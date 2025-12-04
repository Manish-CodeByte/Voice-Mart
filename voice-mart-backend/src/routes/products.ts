import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/search/suggestions', productController.getSearchSuggestions);
router.get('/:id', productController.getProduct);

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
