import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, OnboardingStatus } from '../generated/prisma';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

type SyncUserInput = {
  email: string;
  password: string;
  name?: string;
  timezone?: string;
  defaultCurrency?: string;
};

export const syncUser: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, timezone = 'UTC', defaultCurrency = 'USD' }: SyncUserInput = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Try to find existing user with related preferences
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { preferences: true }
    });

    if (existingUser) {
      // Login flow - verify credentials
      const passwordValid = await bcrypt.compare(password, existingUser.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Create new user with preferences if needed
    const user = existingUser || await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
        name,
        timezone,
        defaultCurrency,
        onboardingStatus: 'incomplete',
        preferences: {
          create: {
            weeklyReport: false,
            businessHours: [9, 17]
          }
        }
      },
      include: { preferences: true }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        onboardingStatus: user.onboardingStatus 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return safe user data
    const { passwordHash: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      token,
      isNewUser: !existingUser
    });

  } catch (error) {
    console.error('User sync error:', error);
    
    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};