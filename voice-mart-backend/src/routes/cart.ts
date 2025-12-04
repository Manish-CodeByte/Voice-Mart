import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as cartController from '../controllers/cartController.js';
const router = Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:productId', cartController.updateCartItem);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
