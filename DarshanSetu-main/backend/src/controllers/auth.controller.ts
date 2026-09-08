import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Simulated OTP store (in production use Redis with TTL)
const otpStore: Record<string, string> = {};

// POST /api/auth/send-otp
export const sendOTP = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  // In production: send via SMS gateway (Twilio / MSG91)
  console.log(`📱 OTP for ${phone}: ${otp}`);

  res.json({ message: 'OTP sent successfully', otp }); // Remove otp in production!
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
  if (otpStore[phone] !== otp) return res.status(401).json({ error: 'Invalid OTP' });

  // Clear OTP after use
  delete otpStore[phone];

  // Upsert user record in DB
  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone }
  });

  // Issue JWT
  const token = jwt.sign(
    { userId: user.id, phone: user.phone },
    process.env.JWT_SECRET || 'kshemyatra_secret',
    { expiresIn: '7d' }
  );

  res.json({ message: 'Login successful', token, user });
};