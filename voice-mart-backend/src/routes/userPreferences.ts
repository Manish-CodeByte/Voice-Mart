import { Router } from 'express';
import { requireAuthMiddleware } from '../middleware/auth.js';
import * as userPreferencesController from '../controllers/userPreferencesController.js';

const router = Router();

router.use(requireAuthMiddleware);

router.get('/', userPreferencesController.getPreferences);
router.put('/', userPreferencesController.updatePreferences);

export default router;
