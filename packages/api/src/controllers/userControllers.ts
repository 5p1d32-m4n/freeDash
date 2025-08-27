import { RequestHandler } from 'express';
import { PrismaClient } from "../../prisma/generated/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserSchema } from '@free-dash/shared-types';
import { checkPermissions } from '../middleware/auth';
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

const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  auth0Id: true,
  createdAt: true,
  updatedAt: true
})

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
    if (error instanceof PrismaClientKnownRequestError) {
      if ((error as any).code === 'P2002') {
        if ((error as any).meta?.target?.includes('email')) {
          return res.status(409).json({ error: 'A user with this email already exists.' });
        }
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe: RequestHandler = async (req, res) => {
  try {
    console.log('Getting me...')
    const auth0UserId = req.auth?.payload.sub;
    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID in token.' })
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0UserId },
      include: { preferences: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateMe: RequestHandler = async (req, res) => {

  try {
    const auth0UserId = req.auth?.payload.sub;
    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID in token.' })
    }

    // Validate incoming request
    const validation = UpdateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid user input', details: validation.error.flatten() });
    }

    const updateUser = await prisma.user.update({
      where: { auth0Id: auth0UserId },
      data: validation.data,
      include: { preferences: true }
    });
    return res.status(200).json(updateUser);

  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof PrismaClientKnownRequestError) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteMe: RequestHandler = async (req, res) => {
  try {
    // Step 1. get auth0 user id
    const auth0UserId = req.auth?.payload.sub;
    // Step 2. check if that user is authorized
    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No use ID in token' })
    }
    // Step 3. await prisma transaction (CRUD)
    await prisma.user.delete({
      // Trhis has to change to a soft delete.
      where: { auth0Id: auth0UserId }
    })
    // STep 4. validate operation
    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

/** Admin functions */
export const getAllUsers: RequestHandler = async (req, res) => {

  try {

    // Step 1. get auth0 user id
    const auth0UserId = req.auth?.payload.sub;
    // Step 2. check if that user is authorized and has permission for admin
    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No use ID in token' })
    }
    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: auth0UserId }
    });

    //TODO: implement role and permission check with auth0.
    if (!currentUser || currentUser.onboardingStatus !== 'complete') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
    // Step 3. await prisma transaction (CRUD)
    const users = await prisma.user.findMany({
      include: { preferences: true }
    })
    // STep 4. validate operation

    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//TODO: implemente a 'getUserByFilter' function
export const getAllUsersByParam: RequestHandler = async (req, res) => {
  try {
    return res.status(501).json({ message: 'Endpoint not implemented.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const auth0UserId = req.auth?.payload.sub;

    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID in token' });
    }

    // Users can only access their own data unless they're admin
    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: auth0UserId },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // A regular user can only access their own data. An admin can access anyone's.
    if (currentUser.id !== id && currentUser.onboardingStatus !== 'complete') { // 'complete' is a placeholder for a real role/permission check
      return res.status(403).json({ error: 'Forbidden: Cannot access other user data' });
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
      include: { preferences: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const auth0UserId = req.auth?.payload.sub;

    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID in token' });
    }

    // Only admins can update other users
    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: auth0UserId },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    // Only an admin can update another user's data.
    if (currentUser.id !== id && currentUser.onboardingStatus !== 'complete') { // 'complete' is a placeholder for a real role/permission check
      return res.status(403).json({ error: 'Forbidden: Cannot update other user data' });
    }

    // Validate the incoming request body
    const validation = UpdateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input for user update',
        details: validation.error.flatten()
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: validation.data,
      include: { preferences: true },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user by ID error:', error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const auth0UserId = req.auth?.payload.sub;

    if (!auth0UserId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID in token' });
    }

    // Only admins can delete users
    const currentUser = await prisma.user.findUnique({
      where: { auth0Id: auth0UserId },
    });

    if (!currentUser || currentUser.onboardingStatus !== 'complete') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    await prisma.user.delete({
      where: { id: id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user by ID error:', error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};
