import {Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, OnboardingStatus } from '../generated/prisma';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Type extension for Express Request
declare global {
    namespace Express{
        interface Request{
            user?:{
                id: string,
                email: string,
                onboardingStatus: OnboardingStatus;
            };
        }
    }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    // Extract token from headers
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if(!token){
        return res.status(401).json({error: 'Authentication required' });
    }

    try {
        // Verify the JWT
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            onboardingStatus: OnboardingStatus
        };

        // Fetch fresh user data (avoid stale data from token)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                onboardingStatus: true,
                preferences: true
            }
        });

        if (!user) {
            return res.status(401).json({error: 'User account not found'});
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            onboardingStatus: user.onboardingStatus
        };

        // Optionaly, I'm adding business logic checks
        if(req.method !== 'GET' && user.onboardingStatus === 'incomplete'){
            return res.status(403).json({
                error: 'Complete onboarding before performing this action',
                requiredAction: 'onbarding'
            })
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        // Handle different error cases
        if (error instanceof jwt.TokenExpiredError){
            return res.status(401).json({ error: 'Session expired', action: 'refresh'});
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.status(500).json({ error: 'Authentication failed' });
    }
}
export const requireOnboardingComplete = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (req.user?.onboardingStatus !== 'complete') {
    return res.status(403).json({
      error: 'Onboarding process not completed',
      requiredAction: 'onboarding'
    });
  }
  next();
};

export const jwtCheck = async(req: Request, res:Response) => {

}

export const checkPermissions = async(req: Request, res: Response)=>{}