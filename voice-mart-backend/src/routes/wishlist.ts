import { Router } from 'express';
import * as wishlistController from '../controllers/wishlistController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
