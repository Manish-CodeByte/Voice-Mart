import { Router } from 'express';
import { requireAuthMiddleware } from '../middleware/auth.js';
import * as addressController from '../controllers/addressController.js';

const router = Router();

router.use(requireAuthMiddleware);

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;
