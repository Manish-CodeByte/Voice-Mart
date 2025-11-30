import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import orderService from '../services/orderService.js';
import logger from '../utils/logger.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const order = await orderService.createOrder(userId, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    logger.error('Error in createOrder:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await orderService.getUserOrders(userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Error in getOrders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user can only view their own orders
    if (order.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Error in getOrder:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user can only cancel their own orders
    if (order.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updatedOrder = await orderService.cancelOrder(id);
    res.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    logger.error('Error in cancelOrder:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to cancel order' });
  }
};
