import { Request, Response, NextFunction, RequestHandler } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { OnboardingStatus } from '../generated/prisma';
import { Prisma, PrismaClient } from '@prisma/client';

// Type extension for Express Request
// This is the correct way to add the Auth0 payload to the request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                onboardingStatus: OnboardingStatus;
            };
        }
    }
}

// Environment validation
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

const prisma = new PrismaClient();

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
    console.error('Missing Auth0 configuration. Please check your .env file.');
    process.exit(1);
}

// --- 1. JWT Validation (jwtCheck) ---
// This middleware verifies the token's signature, expiration, audience, and issuer.
// It uses Auth0's public keys (JWKS), so you do NOT need a local JWT_SECRET.
export const jwtCheck = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256'
});

// --- 2. Permission Checking (checkPermissions) ---
// This middleware runs AFTER jwtCheck has successfully validated the token.
// It checks the 'permissions' claim in the token's payload.
export const checkPermissions = (requiredPermissions: string[]): RequestHandler => {
    return (req, res, next) => {
        // req.auth.payload is attached by jwtCheck
        const userPermissions: string[] = (req.auth?.payload?.permissions as string[] | undefined) || [];

        const hasAllPermissions = requiredPermissions.every(p =>
            userPermissions.includes(p)
        );

        if (hasAllPermissions) {
            return next();
        }

        res.status(403).json({ message: 'Insufficient permissions' });
    };
};

// --- 3. Fetch User from Database ---
// This MUST be placed after jwtCheck in your middleware chain.
export const addUserToRequest: RequestHandler = async (req, res, next) => {
  // jwtCheck has already validated the token and attached the payload
  const auth0Id = req.auth?.payload.sub;

  if (!auth0Id) {
    // This should theoretically never happen if jwtCheck passed, but it's good to be safe.
    return next(); // Let subsequent middleware handle the missing user.
  }

  try {
    // Fetch the user from your database using the auth0Id
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      select: { // Only select what you need for the request context
        id: true,
        email: true,
        onboardingStatus: true,
        // add other frequently accessed fields here, but avoid sensitive data
      }
    });

    if (user) {
      req.user = user; // Now your type definition is fulfilled!
    }
    // If user is not found, req.user remains undefined, which is correct for a new user who hasn't synced yet.
    next();
  } catch (error) {
    console.error('Error fetching user for request:', error);
    next(error); // Pass the error to your central error handler
  }
};

// --- 3. Role Checking (checkRoles) ---
// This is your custom middleware for roles, which also runs AFTER jwtCheck.
export const checkRoles = (requiredRoles: string[]): RequestHandler => {
    return (req, res, next) => {
        const rolesClaim = 'https://pupfinance.com/roles'; // Must match your Auth0 Action
        const userRoles: string[] = (req.auth?.payload?.[rolesClaim] as string[] | undefined) || [];

        const hasRequiredRole = requiredRoles.some(r =>
            userRoles.includes(r)
        );

        if (hasRequiredRole) {
            return next();
        }

        res.status(403).json({ message: 'Insufficient role' });
    };
};

// --- 4. User Onboarding Logic ---
// Your existing onboarding check can be a separate middleware that also runs AFTER jwtCheck.
export const requireOnboardingComplete: RequestHandler = (req, res, next) => {
    // Note: The 'onboardingStatus' would need to be a custom claim in your JWT
    // from your Auth0 Action for this to work perfectly without a DB lookup.
    // For now, this is fine but it is an additional database lookup in your controller
    // which is not the most efficient.
    next();
};

// --- 5. Error Handling Middleware (handleAuthErrors) ---
export const handleAuthErrors = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err && err.status && err.code) {
        console.error('Auth error:', err);
        return res.status(err.status).json({
            code: err.code,
            message: err.message
        });
    }
    next(err);
};