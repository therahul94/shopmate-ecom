import express from 'express'
import { adminRoute, protectedRoute } from '../middlewares/auth.middleware.js';
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from '../controllers/product.controller.js';
const router = express.Router();

router.get('/', protectedRoute, adminRoute, getAllProducts);
router.get('/featured-products', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/recommendations', getRecommendedProducts);
router.post('/', protectedRoute, adminRoute, createProduct);
router.patch('/:id', protectedRoute, adminRoute, toggleFeaturedProduct);
router.delete('/:id', protectedRoute, adminRoute, deleteProduct);
export default router;