import { Router } from 'express';
import { transcribe, transcribeMultiLang, processVoiceCommand } from '../controllers/voiceController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/stt', transcribe);
router.post('/stt/multilang', transcribeMultiLang);

// New route for file-based voice commands (Gemini)
router.post('/voice-command', upload.single('audio'), processVoiceCommand);

export default router;
