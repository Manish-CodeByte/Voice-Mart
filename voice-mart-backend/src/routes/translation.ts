import { Router } from 'express';
import * as translationController from '../controllers/translationController.js';

const router = Router();

router.post('/', translationController.translateText);
router.post('/batch', translationController.translateBatch);

export default router;
