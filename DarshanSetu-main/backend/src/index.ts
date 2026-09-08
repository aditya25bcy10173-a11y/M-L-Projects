//MAIN Server Entry point
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { MQTTIngestionService } from './services/mqtt.service';
import authRoutes from './routes/auth.routes';
import gateRoutes from './routes/gate.routes';
import ticketRoutes from './routes/ticket.routes';
import incidentRoutes from './routes/incident.routes';
import analyticsRoutes from './routes/analytics.routes';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());


// Inject Socket.io instance into Express requests
app.use((req: any, res, next) => {
  req.io = io;
  next();

});

app.use('/api/auth', authRoutes);

app.use('/api/tickets', ticketRoutes);

app.use('/api/gates', gateRoutes);

app.use('/api/incidents', incidentRoutes);

app.use('/api/analytics', analyticsRoutes);

// Initialize MQTT Ingestion Engine
new MQTTIngestionService(io);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

// 2-Second Live Forecast Telemetry Streamer (2000ms Interval)
setInterval(() => {
  const sites = ['dwarka', 'somnath', 'ambaji', 'pavagadh'];
  const randomSite = sites[Math.floor(Math.random() * sites.length)];
  
  // Micro velocity drift (+/- 1.5% fluctuation)
  const drift = (Math.random() - 0.48) * 0.03;
  
  io.emit('forecast_stream', {
    siteId: randomSite,
    timestamp: new Date().toISOString(),
    drift: drift
  });
}, 2000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});