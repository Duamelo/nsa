import { Router } from 'express';
import { ProductController } from '../controller/ProductController';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: API de gestion des produits
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Liste tous les produits
 *     tags: [Produits]
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/', ProductController.getAllProducts);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Recherche de produits
 *     tags: [Produits]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 */
router.get('/search', ProductController.searchProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtenir un produit par ID
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Détails du produit
 *       401:
 *         description: Non autorisé
 */
router.get('/:id([0-9]+)', [checkJwt], ProductController.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Créer un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               threshold:
 *                 type: number
 *     responses:
 *       201:
 *         description: Produit créé
 *       403:
 *         description: Accès interdit
 */
router.post('/', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Mettre à jour un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produit mis à jour
 */
router.patch('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.updateProduct);

/**
 * @swagger
 * /products/{id}/thresholds:
 *   patch:
 *     summary: Mettre à jour les seuils de stock
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seuils mis à jour
 */
router.patch('/:id([0-9]+)/thresholds', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.updateStockThresholds);

/**
 * @swagger
 * /products/{id}/reactivate:
 *   patch:
 *     summary: Réactiver un produit supprimé
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produit réactivé
 */
router.patch('/:id([0-9]+)/reactivate', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], ProductController.reactivateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Produit supprimé
 */
router.delete('/:id([0-9]+)', [checkJwt, checkRole(['ADMIN'])], ProductController.deleteProduct);

export default router;
