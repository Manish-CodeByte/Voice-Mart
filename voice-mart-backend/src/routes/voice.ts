import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { transcribe, transcribeMultiLang, processVoiceCommand } from '../controllers/voiceController.js';
import { syncUser } from '../controllers/authController.js';

const router = Router();

router.post('/stt', transcribe);
router.post('/stt/multilang', transcribeMultiLang);

router.post('/voice-command', upload.single('audio'), processVoiceCommand);

router.post('/auth/sync', syncUser);

export default router;
