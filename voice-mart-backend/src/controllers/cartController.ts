import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import cartService from '../services/cartService.js';
import logger from '../utils/logger.js';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  } catch (error) {
    logger.error('Error in getCart:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cart = await cartService.addToCart(userId, req.body);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    logger.error('Error in addToCart:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to add to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId } = req.params;
    const cart = await cartService.updateCartItem(userId, productId, req.body);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    logger.error('Error in updateCartItem:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update cart' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId } = req.params;
    const cart = await cartService.removeFromCart(userId, productId);
    res.json({ success: true, data: cart });
  } catch (error) {
    logger.error('Error in removeFromCart:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await cartService.clearCart(userId);
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    logger.error('Error in clearCart:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};
