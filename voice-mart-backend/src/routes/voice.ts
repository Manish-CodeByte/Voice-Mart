import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { transcribe, transcribeMultiLang, processVoiceCommand } from '../controllers/voiceController.js';
import { syncUser } from '../controllers/authController.js';

const router = Router();

// Voice Routes
router.post('/stt', transcribe);
router.post('/stt/multilang', transcribeMultiLang);

// New route for file-based voice commands (Gemini)
router.post('/voice-command', upload.single('audio'), processVoiceCommand);

// Auth Routes (Sync user to Firestore)
router.post('/auth/sync', syncUser);

export default router;
