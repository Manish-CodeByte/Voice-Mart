import { db } from '../config/firebase.js';
import { Cart, CartItem, AddToCartDTO, UpdateCartItemDTO } from '../models/cart.js';
import productService from './productService.js';
import logger from '../utils/logger.js';

class CartService {
  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Firestore is not initialized');
    }
    return db.collection('carts');
  }

  async getCart(userId: string): Promise<Cart | null> {
    try {
      const doc = await this.collection.doc(userId).get();
      
      if (!doc.exists) {
        return {
          userId,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          updatedAt: new Date(),
        };
      }

      const data = doc.data();
      return {
        userId: doc.id,
        items: data?.items || [],
        totalItems: data?.totalItems || 0,
        totalPrice: data?.totalPrice || 0,
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      logger.error(`Error getting cart for user ${userId}:`, error);
      throw error;
    }
  }

  async addToCart(userId: string, dto: AddToCartDTO): Promise<Cart> {
    try {
      const product = await productService.getProductById(dto.productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock < dto.quantity) {
        throw new Error('Insufficient stock');
      }

      const cart = await this.getCart(userId);
      const existingItemIndex = cart!.items.findIndex((item: CartItem) => item.productId === dto.productId);

      if (existingItemIndex >= 0) {
        cart!.items[existingItemIndex].quantity += dto.quantity;
        cart!.items[existingItemIndex].addedAt = new Date();
      } else {
        const newItem: CartItem = {
          productId: dto.productId,
          productName: product.name,
          productImage: product.images[0] || '',
          quantity: dto.quantity,
          price: product.price,
          addedAt: new Date(),
        };
        cart!.items.push(newItem);
      }

      cart!.totalItems = cart!.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      cart!.totalPrice = cart!.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
      cart!.updatedAt = new Date();

      await this.collection.doc(userId).set(cart!);
      logger.info(`Added product ${dto.productId} to cart for user ${userId}`);
      
      return cart!;
    } catch (error) {
      logger.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(userId: string, productId: string, dto: UpdateCartItemDTO): Promise<Cart> {
    try {
      const cart = await this.getCart(userId);
      const itemIndex = cart!.items.findIndex((item: CartItem) => item.productId === productId);

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (dto.quantity <= 0) {
        // Remove item
        cart!.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        const product = await productService.getProductById(productId);
        if (product && product.stock < dto.quantity) {
          throw new Error('Insufficient stock');
        }
        cart!.items[itemIndex].quantity = dto.quantity;
      }

      // Recalculate totals
      cart!.totalItems = cart!.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      cart!.totalPrice = cart!.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
      cart!.updatedAt = new Date();

      await this.collection.doc(userId).set(cart!);
      logger.info(`Updated cart for user ${userId}`);
      
      return cart!;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    try {
      return await this.updateCartItem(userId, productId, { quantity: 0 });
    } catch (error) {
      logger.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      await this.collection.doc(userId).delete();
      logger.info(`Cleared cart for user ${userId}`);
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export default new CartService();
