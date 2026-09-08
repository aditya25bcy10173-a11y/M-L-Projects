import { Router } from 'express';
import { getForecast } from '../controllers/analytics.controller';

const router = Router();

router.get('/forecast', getForecast);

export default router;