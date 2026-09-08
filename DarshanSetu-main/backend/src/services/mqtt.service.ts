import mqtt from 'mqtt';
import { redis } from '../config/redis';
import { Server as SocketIOServer } from 'socket.io';

export class MQTTIngestionService {
  private client: mqtt.MqttClient;

  constructor(private io: SocketIOServer) {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      console.log('✅ Connected to MQTT Broker');
      this.client.subscribe('temple/+/+/inflow');
      this.client.subscribe('temple/+/+/telemetry');
    });

    this.client.on('error', () => {
      // Gracefully ignore connection attempts if broker is not running locally
    });

    this.client.on('message', this.handleMessage.bind(this));
  }

  private async handleMessage(topic: string, payload: Buffer) {
    try {
      const parts = topic.split('/'); // temple/:siteId/:locationId/:type
      const siteId = parts[1];
      const locationId = parts[2];
      const messageType = parts[3];

      const data = JSON.parse(payload.toString());

      if (messageType === 'inflow') {
        const netFlow = data.count || 1;
        const currentCount = await redis.hincrby(`site:${siteId}:occupancy`, locationId, netFlow);
        
        this.io.emit('occupancy_update', {
          siteId,
          locationId,
          occupancy: Math.max(0, currentCount),
          timestamp: new Date()
        });
      } else if (messageType === 'telemetry') {
        const { fusedOccupancy, status, incidentAlert } = data;
        await redis.hset(`site:${siteId}:occupancy`, locationId, fusedOccupancy);

        this.io.emit('zone_telemetry', {
          siteId,
          locationId,
          fusedOccupancy,
          status,
          timestamp: new Date()
        });

        if (incidentAlert) {
          this.io.emit('incident_alert', { siteId, locationId, ...incidentAlert });
        }
      }
    } catch (error) {
      console.error('❌ MQTT Ingestion Error:', error);
    }
  }
}