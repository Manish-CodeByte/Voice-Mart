import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/sync', authController.syncUser);

export default router;
