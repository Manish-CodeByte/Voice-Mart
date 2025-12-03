import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import custom modules
import logger from './utils/logger.js';
import voiceRoutes from './routes/voice.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import ordersRoutes from './routes/orders.js';
import addressesRoutes from './routes/addresses.js';
import adminRoutes from './routes/admin.js';
import userPreferencesRoutes from './routes/userPreferences.js';
import reviewsRoutes from './routes/reviews.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import paymentRoutes from './routes/paymentRoutes.js';
import imageSearchRoutes from './routes/imageSearch.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(path.dirname(__dirname), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.info(`📁 Created uploads directory: ${uploadsDir}`);
}

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Rate limiting - very relaxed for development
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '2000'), // 2000 requests per 15min
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for localhost in development
      return process.env.NODE_ENV === 'development';
    }
});
app.use('/api/', limiter);

// HTTP Request Logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Clerk Authentication Middleware
app.use(authMiddleware);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        features: ['Google STT', 'Clerk Auth', 'E-commerce', 'Addresses']
    });
});

// Serve API Documentation at root
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../src/public/index.html'));
});

// Register routes
app.use('/api/voice', voiceRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', imageSearchRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    logger.warn(`404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled Error:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger.info(`📁 Uploads dir: ${uploadsDir}`);

    // Keep-Alive for Render (Ping every 14 minutes)
    const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
    setInterval(async () => {
        try {
            // Prefer external URL to keep Render active, fallback to localhost
            const healthUrl = process.env.RENDER_EXTERNAL_URL 
                ? `${process.env.RENDER_EXTERNAL_URL}/health`
                : `http://localhost:${PORT}/health`;
            
            await fetch(healthUrl);
            logger.info(`💓 Self-ping successful to ${healthUrl}`);
        } catch (error) {
            logger.error('Self-ping failed:', error);
        }
    }, PING_INTERVAL);
});

export default app;
