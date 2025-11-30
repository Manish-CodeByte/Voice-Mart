import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import userPreferencesService from '../services/userPreferencesService.js';
import logger from '../utils/logger.js';

export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const preferences = await userPreferencesService.getPreferences(userId);
    res.json({ success: true, data: preferences });
  } catch (error) {
    logger.error('Error in getPreferences:', error);
    res.status(500).json({ success: false, message: 'Failed to get preferences' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const preferences = await userPreferencesService.updatePreferences(userId, req.body);
    res.json({ success: true, data: preferences });
  } catch (error) {
    logger.error('Error in updatePreferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};
