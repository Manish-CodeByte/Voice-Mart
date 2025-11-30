import { clerkMiddleware, getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

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
    next();
};
