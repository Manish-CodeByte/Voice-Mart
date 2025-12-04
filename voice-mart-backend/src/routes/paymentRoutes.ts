import express from 'express';
import { createOrder, verifyPayment, handleWebhook } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', authMiddleware, createOrder);

router.post('/verify', authMiddleware, verifyPayment);

router.post('/webhook', handleWebhook);

export default router;
