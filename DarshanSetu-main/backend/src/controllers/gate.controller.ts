import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import yaml from 'yaml';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// POST /api/gates/validate
export const validateEntry = async (req: Request, res: Response) => {
  const { qrToken, gateId } = req.body;

  if (!qrToken || !gateId) {
    return res.status(400).json({ error: 'qrToken and gateId are required' });
  }

  try {
    // 1. Check if Ticket is Valid
    const ticket = await prisma.ticket.findUnique({
      where: { qrToken },
      include: { user: true }
    });

    if (!ticket) {
      (req as any).io.emit('gate_scan', { gateId, status: 'INVALID', error: 'Ticket not found' });
      return res.status(400).json({ status: 'INVALID', error: 'Ticket not found' });
    }
    if (ticket.status === 'VALIDATED') {
      (req as any).io.emit('gate_scan', { siteId: ticket.siteId, gateId, status: 'INVALID', error: 'Ticket already used' });
      return res.status(400).json({ status: 'INVALID', error: 'Ticket already used' });
    }

    // 2. Check Time Slot Mismatch (+/- 30 minute buffer)
    const now = new Date();
    const slotTime = new Date(ticket.slotTime);
    const diffMinutes = Math.abs(now.getTime() - slotTime.getTime()) / 60000;

    if (diffMinutes > 30) {
      (req as any).io.emit('gate_scan', { siteId: ticket.siteId, gateId, status: 'MISMATCH', error: 'Not your time slot' });
      return res.status(400).json({ status: 'MISMATCH', error: 'Not your time slot' });
    }

    // 3. Check Live Capacity Hold (Read from site yaml config and Redis)
    const configPath = path.resolve(__dirname, `../../../config/sites/${ticket.siteId}.yaml`);
    const siteConfig = yaml.parse(fs.readFileSync(configPath, 'utf8'));
    
    // We check occupancy of the first zone (e.g., sanctum_approach)
    const targetZone = siteConfig.zones[0].id;
    const currentOccupancy = parseInt(await redis.hget(`site:${ticket.siteId}:occupancy`, targetZone) || '0', 10);
    
    // Hardcoded threshold for demo, or read dynamically (e.g. 50 people max limit)
    const limit = 50; 

    if (currentOccupancy >= limit && !ticket.user.isPriority) {
      (req as any).io.emit('gate_scan', { siteId: ticket.siteId, gateId, status: 'HOLD', error: 'Zone capacity limit reached' });
      return res.status(423).json({ 
        status: 'HOLD', 
        error: 'Zone capacity limit reached. Please wait.' 
      });
    }

    // Validation Successful -> Update DB & Increment Redis
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'VALIDATED', validatedAt: new Date() }
    });

    const newOccupancy = currentOccupancy + 1;
    await redis.hset(`site:${ticket.siteId}:occupancy`, targetZone, newOccupancy);

    // Emit successful gate scan
    (req as any).io.emit('gate_scan', { siteId: ticket.siteId, gateId, status: 'VALID', user: ticket.user.name || 'Devotee' });

    res.json({ 
      status: 'VALID', 
      message: 'Access Granted', 
      user: ticket.user.name || 'Devotee' 
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error during validation' });
  }
};