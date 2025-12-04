import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import logger from '../utils/logger.js';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];

console.log('ADMIN_EMAILS loaded:', ADMIN_EMAILS);
console.log('Raw ADMIN_EMAILS env:', process.env.ADMIN_EMAILS);

export const requireAdminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const clerkApiUrl = `https://api.clerk.com/v1/users/${req.auth.userId}`;
    const clerkResponse = await fetch(clerkApiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!clerkResponse.ok) {
      logger.error('Failed to fetch user from Clerk');
      res.status(500).json({ success: false, message: 'Internal server error' });
      return;
    }

    const userData = await clerkResponse.json() as {
      email_addresses?: Array<{ email_address?: string }>;
    };
    const userEmail = userData.email_addresses?.[0]?.email_address?.toLowerCase();

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      logger.warn(`Non-admin user attempted to access admin route: ${userEmail}`);
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      return;
    }

    logger.info(`Admin access granted to: ${userEmail}`);
    next();
  } catch (error) {
    logger.error('Error in admin middleware:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
