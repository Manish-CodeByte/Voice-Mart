import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { userService } from '../services/userService.js';
import logger from '../utils/logger.js';

export const syncUser = async (req: Request, res: Response) => {
    try {
        const auth = getAuth(req);
        if (!auth.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { email, firstName, lastName } = req.body;

        if (!email) {
             res.status(400).json({ error: 'Email is required' });
             return;
        }

        const user = await userService.syncUser({
            uid: auth.userId,
            email,
            firstName,
            lastName
        });

        res.json({ success: true, user });
    } catch (error) {
        logger.error('Error syncing user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
