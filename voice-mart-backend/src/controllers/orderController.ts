import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import orderService from '../services/orderService.js';
import logger from '../utils/logger.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
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
    logger.info(`🔍 DEBUG - Getting orders for userId: ${userId}`);
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const orders = await orderService.getUserOrders(userId);
    logger.info(` DEBUG - Found ${orders.length} orders for userId: ${userId}`);
    
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Error in getOrders:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Ensure user can only view their own orders
    if (order.userId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
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
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const updatedOrder = await orderService.cancelOrder(id);
    res.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    logger.error('Error in cancelOrder:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to cancel order' });
  }
};
