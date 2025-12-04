import { clerkMiddleware, getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export interface AuthRequest extends Request {
    auth?: {
        userId?: string;
        sessionId?: string;
        sessionClaims?: Record<string, any>;
    };
}

export const authMiddleware = clerkMiddleware();

export const requireAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);

    if (!auth.userId) {
        logger.warn('Unauthorized access attempt', { path: req.path, ip: req.ip });
        res.status(401).json({ error: 'Unauthorized', message: 'You must be signed in to access this resource' });
        return;
    }
    (req as AuthRequest).auth = auth;
    next();
};
export const requireAuth = requireAuthMiddleware;
