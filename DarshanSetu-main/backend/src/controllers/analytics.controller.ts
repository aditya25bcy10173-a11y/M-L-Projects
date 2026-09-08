import { Request, Response } from 'express';
import { redis } from '../config/redis';

// GET /api/analytics/forecast
export const getForecast = async (req: Request, res: Response) => {
  const { siteId } = req.query;

  if (!siteId) {
    return res.status(400).json({ error: 'siteId query parameter is required' });
  }

  try {
    const forecastList: any[] = [];
    const today = new Date();

    // Fetch next 14 days of forecasts from Redis
    for (let i = 0; i < 14; i++) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + i);
      const dateStr = futureDate.toISOString().split('T')[0];

      const redisKey = `site:${String(siteId).toLowerCase()}:forecast:${dateStr}`;
      const cachedForecast = await redis.hgetall(redisKey);

      if (cachedForecast && cachedForecast.point) {
        forecastList.push({
          date: dateStr,
          point: parseInt(cachedForecast.point, 10),
          lower: parseInt(cachedForecast.lower, 10),
          upper: parseInt(cachedForecast.upper, 10),
        });
      }
    }

    res.json({
      siteId,
      forecast: forecastList,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve forecast metrics' });
  }
};