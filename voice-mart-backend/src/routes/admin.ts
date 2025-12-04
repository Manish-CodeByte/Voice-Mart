import { Router } from 'express';
import { requireAuthMiddleware } from '../middleware/auth.js';
import { requireAdminMiddleware } from '../middleware/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.use(requireAuthMiddleware);
router.use(requireAdminMiddleware);

router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/stats/orders', adminController.getOrderStats);

router.get('/users', adminController.getAllUsers);
router.get('/stats/users', adminController.getUserStats);

export default router;
