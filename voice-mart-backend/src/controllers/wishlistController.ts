import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import wishlistService from '../services/wishlistService.js';
import logger from '../utils/logger.js';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const wishlist = await wishlistService.getWishlist(userId);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    logger.error('Error in getWishlist:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const wishlist = await wishlistService.addToWishlist(userId, req.body);
    res.json({ success: true, data: wishlist });
  } catch (error: any) {
    logger.error('Error in addToWishlist:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to add to wishlist' });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId } = req.params;
    const wishlist = await wishlistService.removeFromWishlist(userId, productId);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    logger.error('Error in removeFromWishlist:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
};
