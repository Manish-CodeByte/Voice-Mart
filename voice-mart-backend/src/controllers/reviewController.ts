import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import reviewService from '../services/reviewService.js';
import logger from '../utils/logger.js';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { productId, rating, title, comment, images } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Product ID, rating, and comment are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    let userName = 'Anonymous';
    let userEmail = '';
    
    try {
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${req.auth.userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });
      
      if (clerkResponse.ok) {
        const userData = await clerkResponse.json() as any;
        userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Anonymous';
        userEmail = userData.email_addresses?.[0]?.email_address || '';
      }
    } catch (err) {
      logger.warn('Could not fetch user info from Clerk:', err);
    }

    const review = await reviewService.createReview(
      req.auth.userId,
      userEmail,
      userName,
      { productId, rating, title, comment, images }
    );

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully',
    });
  } catch (error: any) {
    logger.error('Error creating review:', error);
    res.status(error.message?.includes('already reviewed') ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to create review',
    });
  }
};

export const getProductReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    const reviews = await reviewService.getProductReviews(productId);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    logger.error('Error getting product reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to get reviews' });
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const reviews = await reviewService.getUserReviews(req.auth.userId);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    logger.error('Error getting user reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to get reviews' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const review = await reviewService.updateReview(id, req.auth.userId, {
      rating,
      title,
      comment,
      images,
    });

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating review:', error);
    res.status(error.message?.includes('Unauthorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Failed to update review',
    });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await reviewService.deleteReview(id, req.auth.userId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting review:', error);
    res.status(error.message?.includes('Unauthorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Failed to delete review',
    });
  }
};

export const markReviewHelpful = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await reviewService.markHelpful(id);

    res.json({
      success: true,
      message: 'Review marked as helpful',
    });
  } catch (error) {
    logger.error('Error marking review as helpful:', error);
    res.status(500).json({ success: false, message: 'Failed to mark review as helpful' });
  }
};
