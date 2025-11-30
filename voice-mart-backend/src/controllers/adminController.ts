import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import logger from '../utils/logger.js';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, imageUrl, stock, featured } = req.body;

    if (!name || !price || !category) {
      res.status(400).json({ success: false, message: 'Name, price, and category are required' });
      return;
    }

    const productData = {
      name,
      description: description || '',
      price: Number(price),
      category,
      imageUrl: imageUrl || '',
      stock: stock !== undefined ? Number(stock) : 100,
      featured: Boolean(featured),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('products').add(productData);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...productData },
      message: 'Product created successfully',
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'Product ID required' });
      return;
    }

    const updateData: any = { ...updates, updatedAt: new Date() };
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    await db.collection('products').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: 'Product ID required' });
      return;
    }

    await db.collection('products').doc(id).delete();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
    const pendingOrders = orders.filter((o: any) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
    const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
    });
  } catch (error) {
    logger.error('Error getting order stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get order statistics' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = 100 } = req.query;

    let query: any = db.collection('orders');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }))
    .sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, Number(limit));

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error('Error getting all orders:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      res.status(400).json({ success: false, message: 'Order ID and status required' });
      return;
    }

    await db.collection('orders').doc(id).update({
      status,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const ordersSnapshot = await db.collection('orders').get();

    const totalUsers = usersSnapshot.size;
    const totalOrders = ordersSnapshot.size;
    const avgOrdersPerUser = totalUsers > 0 ? totalOrders / totalUsers : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        avgOrdersPerUser: avgOrdersPerUser.toFixed(2),
      },
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get user statistics' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 100 } = req.query;

    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      // Handle different createdAt formats
      let createdAt = data.createdAt;
      if (createdAt?.toDate) {
        createdAt = createdAt.toDate();
      } else if (typeof createdAt === 'string') {
        createdAt = new Date(createdAt);
      }

      return {
        id: doc.id,
        ...data,
        createdAt,
      };
    })
    .sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, Number(limit));

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
};
