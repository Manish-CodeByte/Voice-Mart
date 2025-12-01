import { clerkMiddleware, getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

// Extend Request to include auth
export interface AuthRequest extends Request {
    auth?: {
        userId?: string;
        sessionId?: string;
        sessionClaims?: Record<string, any>;
    };
}

// Global Clerk middleware
export const authMiddleware = clerkMiddleware();

// Middleware to protect routes that require authentication
export const requireAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);

    if (!auth.userId) {
        logger.warn('Unauthorized access attempt', { path: req.path, ip: req.ip });
        res.status(401).json({ error: 'Unauthorized', message: 'You must be signed in to access this resource' });
        return;
    }
    
    // Attach auth to request
    (req as AuthRequest).auth = auth;
    next();
};

// Export as requireAuth for convenience
export const requireAuth = requireAuthMiddleware;
