import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// POST /api/tickets/book
export const bookTicket = async (req: Request, res: Response) => {
  const { siteId, slotTime, isPriority } = req.body;
  const userId = (req as any).userId;

  if (!siteId || !slotTime) {
    return res.status(400).json({ error: 'siteId and slotTime are required' });
  }

  // Generate HMAC-signed QR token
  const rawToken = `${userId}:${siteId}:${slotTime}:${Date.now()}`;
  const qrToken = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'kshemyatra_secret')
    .update(rawToken)
    .digest('hex');

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      siteId,
      slotTime: new Date(slotTime),
      qrToken,
      status: 'BOOKED'
    }
  });

  res.status(201).json({
    message: 'Ticket booked successfully',
    ticket,
    qrToken
  });
};

// GET /api/tickets/my
export const getMyTickets = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ tickets });
};