import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();

router.use(authMiddleware);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/cancel', orderController.cancelOrder);

export default router;
