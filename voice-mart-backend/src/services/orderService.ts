import { db } from '../config/firebase.js';
import { Order, CreateOrderDTO, OrderStatus, UpdateOrderStatusDTO } from '../models/order.js';
import cartService from './cartService.js';
import logger from '../utils/logger.js';

class OrderService {
  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Firestore is not initialized');
    }
    return db.collection('orders');
  }

  async createOrder(userId: string, dto: CreateOrderDTO): Promise<Order> {
    try {
      const now = new Date();
      const totalItems = dto.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const totalPrice = dto.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      const orderData = {
        userId,
        items: dto.items,
        totalItems,
        totalPrice,
        status: 'pending' as OrderStatus,
        shippingAddress: dto.shippingAddress,
        paymentMethod: dto.paymentMethod,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(orderData);
      
      // Clear user's cart after order
      await cartService.clearCart(userId);
      
      const order = await this.getOrderById(docRef.id);
      logger.info(`Created order: ${docRef.id} for user ${userId}`);
      
      return order!;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const doc = await this.collection.doc(orderId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        userId: data?.userId,
        items: data?.items || [],
        totalItems: data?.totalItems || 0,
        totalPrice: data?.totalPrice || 0,
        status: data?.status || 'pending',
        shippingAddress: data?.shippingAddress,
        paymentMethod: data?.paymentMethod,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      logger.error(`Error getting order ${orderId}:`, error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const orders: Order[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          items: data.items || [],
          totalItems: data.totalItems || 0,
          totalPrice: data.totalPrice || 0,
          status: data.status || 'pending',
          shippingAddress: data.shippingAddress,
          paymentMethod: data.paymentMethod,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      logger.info(`Retrieved ${orders.length} orders for user ${userId}`);
      return orders;
    } catch (error) {
      logger.error(`Error getting orders for user ${userId}:`, error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDTO): Promise<Order | null> {
    try {
      await this.collection.doc(orderId).update({
        status: dto.status,
        updatedAt: new Date(),
      });

      logger.info(`Updated order ${orderId} status to ${dto.status}`);
      return this.getOrderById(orderId);
    } catch (error) {
      logger.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<Order | null> {
    try {
      const order = await this.getOrderById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error('Cannot cancel order with current status');
      }

      return await this.updateOrderStatus(orderId, { status: 'cancelled' });
    } catch (error) {
      logger.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }
}

export default new OrderService();
