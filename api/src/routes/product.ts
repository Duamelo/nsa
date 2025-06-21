import { Router } from 'express';
import { ProductController } from '../controller/ProductController';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Routes publiques
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);

// Routes protégées - Authentification requise
router.get('/:id([0-9]+)', [checkJwt], ProductController.getProductById);

// Routes de création/modification - ADMIN/MANAGER requis
router.post('/', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.createProduct);
router.patch('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.updateProduct);

// Route spécifique pour mettre à jour les seuils de stock - ADMIN/MANAGER requis
router.patch('/:id([0-9]+)/thresholds', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.updateStockThresholds);

// Route pour réactiver un produit - ADMIN/MANAGER requis
router.patch('/:id([0-9]+)/reactivate', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.reactivateProduct);

// Route de suppression (soft delete) - ADMIN uniquement
router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], ProductController.deleteProduct);

export default router;