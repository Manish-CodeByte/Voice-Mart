import express from 'express';
import multer from 'multer';
import { searchByImage } from '../controllers/imageSearchController.js';

const router = express.Router();

// Configure multer for image upload (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// POST /api/search/image - Search products by image
router.post('/image', upload.single('image'), searchByImage);

export default router;
