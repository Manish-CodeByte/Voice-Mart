import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);

router.post('/', requireAuth, createReview);
router.get('/my-reviews', requireAuth, getUserReviews);
router.put('/:id', requireAuth, updateReview);
router.delete('/:id', requireAuth, deleteReview);
router.post('/:id/helpful', markReviewHelpful);

export default router;
