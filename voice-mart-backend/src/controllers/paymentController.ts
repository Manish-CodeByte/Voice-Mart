import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will fail.');
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), 
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
    }

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.error?.description || error.message || 'Failed to create order' 
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!secret) {
        console.warn("RAZORPAY_WEBHOOK_SECRET not set, skipping signature validation");
    } else {
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');
    
        if (digest !== req.headers['x-razorpay-signature']) {
          return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Received Razorpay Webhook:', event);

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      console.log('Payment captured:', payment.id, payment.amount);
      // Update order status to 'paid' in DB
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      console.log('Payment failed:', payment.id);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ success: false, message: 'Webhook handler failed' });
  }
};
