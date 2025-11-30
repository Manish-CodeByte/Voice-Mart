import { db } from '../config/firebase.js';
import { Wishlist, AddToWishlistDTO } from '../models/wishlist.js';
import productService from './productService.js';
import logger from '../utils/logger.js';

class WishlistService {
  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Firestore is not initialized');
    }
    return db.collection('wishlists');
  }

  async getWishlist(userId: string): Promise<Wishlist> {
    try {
      const doc = await this.collection.doc(userId).get();
      
      if (!doc.exists) {
        return {
          userId,
          productIds: [],
          updatedAt: new Date(),
        };
      }

      const data = doc.data();
      return {
        userId: doc.id,
        productIds: data?.productIds || [],
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      logger.error(`Error getting wishlist for user ${userId}:`, error);
      throw error;
    }
  }

  async addToWishlist(userId: string, dto: AddToWishlistDTO): Promise<Wishlist> {
    try {
      const product = await productService.getProductById(dto.productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const wishlist = await this.getWishlist(userId);
      
      if (!wishlist.productIds.includes(dto.productId)) {
        wishlist.productIds.push(dto.productId);
        wishlist.updatedAt = new Date();
        
        await this.collection.doc(userId).set(wishlist);
        logger.info(`Added product ${dto.productId} to wishlist for user ${userId}`);
      }

      return wishlist;
    } catch (error) {
      logger.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist> {
    try {
      const wishlist = await this.getWishlist(userId);
      wishlist.productIds = wishlist.productIds.filter((id: string) => id !== productId);
      wishlist.updatedAt = new Date();
      
      await this.collection.doc(userId).set(wishlist);
      logger.info(`Removed product ${productId} from wishlist for user ${userId}`);
      
      return wishlist;
    } catch (error) {
      logger.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist(userId);
      return wishlist.productIds.includes(productId);
    } catch (error) {
      logger.error('Error checking wishlist:', error);
      throw error;
    }
  }
}

export default new WishlistService();
