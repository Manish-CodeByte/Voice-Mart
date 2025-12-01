import { db } from '../config/firebase.js';
import { Review, CreateReviewDTO, UpdateReviewDTO } from '../models/review.js';
import logger from '../utils/logger.js';

class ReviewService {
  private get collection() {
    return db.collection('reviews');
  }

  async createReview(userId: string, userEmail: string, userName: string, dto: CreateReviewDTO): Promise<Review> {
    try {
      const now = new Date();

      // Check if user already reviewed this product
      const existingReview = await this.collection
        .where('productId', '==', dto.productId)
        .where('userId', '==', userId)
        .get();

      if (!existingReview.empty) {
        throw new Error('You have already reviewed this product');
      }

      // Check if user purchased this product
      const ordersSnapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .where('status', '==', 'delivered')
        .get();

      let verified = false;
      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        if (orderData.items?.some((item: any) => item.productId === dto.productId)) {
          verified = true;
          break;
        }
      }

      const reviewData: Omit<Review, 'id'> = {
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
        userId,
        userName,
        userEmail,
        verified,
        helpful: 0,
        createdAt: now,
        updatedAt: now,
      };

      // Only add optional fields if they exist
      if (dto.title) reviewData.title = dto.title;
      if (dto.images && dto.images.length > 0) reviewData.images = dto.images;

      const docRef = await this.collection.add(reviewData);

      // Update product rating
      await this.updateProductRating(dto.productId);

      logger.info(`Review created for product ${dto.productId} by user ${userId}`);

      return {
        id: docRef.id,
        ...reviewData,
      };
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error;
    }
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const snapshot = await this.collection
        .where('productId', '==', productId)
        .get();

      const reviews = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      // Sort in memory to avoid Firestore index requirement
      return reviews.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // newest first
      });
    } catch (error) {
      logger.error('Error getting product reviews:', error);
      throw error;
    }
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .get();

      const reviews = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      // Sort in memory
      return reviews.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      logger.error('Error getting user reviews:', error);
      throw error;
    }
  }

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDTO): Promise<Review> {
    try {
      const docRef = this.collection.doc(reviewId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Review not found');
      }

      const reviewData = doc.data() as Review;

      // Verify ownership
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized to update this review');
      }

      const updateData = {
        ...dto,
        updatedAt: new Date(),
      };

      await docRef.update(updateData);

      // Update product rating if rating changed
      if (dto.rating) {
        await this.updateProductRating(reviewData.productId);
      }

      logger.info(`Review ${reviewId} updated`);

      return {
        ...reviewData,
        ...updateData,
        id: reviewId,
      };
    } catch (error) {
      logger.error('Error updating review:', error);
      throw error;
    }
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      const docRef = this.collection.doc(reviewId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Review not found');
      }

      const reviewData = doc.data() as Review;

      // Verify ownership
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized to delete this review');
      }

      const productId = reviewData.productId;

      await docRef.delete();

      // Update product rating
      await this.updateProductRating(productId);

      logger.info(`Review ${reviewId} deleted`);
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error;
    }
  }

  async markHelpful(reviewId: string): Promise<void> {
    try {
      const docRef = this.collection.doc(reviewId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Review not found');
      }

      const reviewData = doc.data() as Review;

      await docRef.update({
        helpful: (reviewData.helpful || 0) + 1,
      });

      logger.info(`Review ${reviewId} marked as helpful`);
    } catch (error) {
      logger.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  private async updateProductRating(productId: string): Promise<void> {
    try {
      const reviews = await this.getProductReviews(productId);

      if (reviews.length === 0) {
        // No reviews, remove rating
        await db.collection('products').doc(productId).update({
          rating: null,
          reviews: 0,
        });
        return;
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await db.collection('products').doc(productId).update({
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviews: reviews.length,
      });

      logger.info(`Updated product ${productId} rating: ${averageRating} (${reviews.length} reviews)`);
    } catch (error) {
      logger.error('Error updating product rating:', error);
    }
  }
}

export default new ReviewService();
