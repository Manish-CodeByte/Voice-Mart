import express from 'express';
import { createOrder, verifyPayment, handleWebhook } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create order (requires auth)
router.post('/create-order', authMiddleware, createOrder);

// Verify payment (requires auth)
router.post('/verify', authMiddleware, verifyPayment);

// Webhook (no auth middleware, signature validation handled inside)
router.post('/webhook', handleWebhook);

export default router;
