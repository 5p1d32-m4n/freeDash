import { RequestHandler } from 'express';
import { PrismaClient, Prisma } from '../generated/prisma';
import { UserSchema } from '@free-dash/shared-types';
import { z } from 'zod';

const prisma = new PrismaClient();

// This schema defines the data we expect from the client during the first sync.
const NewUserPayloadSchema = UserSchema.pick({
  email: true,
  name: true,
  timezone: true,
  defaultCurrency: true,
})
  .extend({
    email: z.email('A valid email is required to create an account.'),
  })
  .partial({
    name: true,
    timezone: true,
    defaultCurrency: true,
  });

export const syncUser: RequestHandler = async (req, res) => {
  try {
    // 1. Get the user's unique ID from the validated Auth0 token.
    //    This is attached to the request by the `express-oauth2-jwt-bearer` middleware.
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res.status(401).json({ error: 'Unauthorized: No user ID in token' });
    }

    // 2. Find user by auth0Id
    const existingUser = await prisma.user.findUnique({
      where: { auth0Id },
      include: { preferences: true },
    });

    if (existingUser) {
      // User already exists, return their data
      return res.status(200).json({
        user: existingUser,
        isNewUser: false,
      });
    }

    // 3. User does not exist, so we create a new one.
    // Validate the incoming request body for new user data.
    const validation = NewUserPayloadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input for new user', details: validation.error.flatten() });
    }
    const { email, name, timezone, defaultCurrency } = validation.data;

    const newUser = await prisma.user.create({
      data: {
        auth0Id,
        email,
        name,
        timezone: timezone || 'UTC',
        defaultCurrency: defaultCurrency || 'USD',
        onboardingStatus: 'incomplete',
        preferences: {
          create: { weeklyReport: false, businessHours: [9, 17] },
        },
      },
      include: { preferences: true },
    });

    // 4. Return the newly created user profile.
    res.status(201).json({
      user: newUser,
      isNewUser: true,
    });
  } catch (error) {
    console.error('User sync error:', error);

    // Handle potential Prisma unique constraint violation for email
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
        if ((error.meta?.target as string[])?.includes('email')) {
          return res.status(409).json({ error: 'A user with this email already exists.' });
        }
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};