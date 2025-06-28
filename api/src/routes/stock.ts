import { Router } from 'express';
import { StockController } from '../controller/StockController';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Opérations liées à la gestion du stock
 */

/**
 * @swagger
 * /stock/alerts:
 *   get:
 *     summary: Liste des produits avec alerte de stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produits avec stock critique
 */
router.get('/alerts', [checkJwt], StockController.getAllStocksWithAlerts);

/**
 * @swagger
 * /stock/current/{productId}:
 *   get:
 *     summary: Obtenir le stock courant d’un produit
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock courant du produit
 */
router.get('/current/:productId([0-9]+)', [checkJwt], StockController.getCurrentStock);

/**
 * @swagger
 * /stock/history:
 *   get:
 *     summary: Historique des mouvements de stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des mouvements de stock
 */
router.get('/history', [checkJwt], StockController.getStockHistory);

/**
 * @swagger
 * /stock/history/{productId}:
 *   get:
 *     summary: Historique des mouvements d’un produit
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historique du produit
 */
router.get('/history/:productId([0-9]+)', [checkJwt], StockController.getStockHistory);

/**
 * @swagger
 * /stock/recent:
 *   get:
 *     summary: Derniers mouvements de stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mouvements récents
 */
router.get('/recent', [checkJwt], StockController.getRecentMovements);

/**
 * @swagger
 * /stock/report:
 *   get:
 *     summary: Générer un rapport global du stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rapport généré
 *       403:
 *         description: Accès interdit
 */
router.get('/report', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], StockController.getStockReport);

/**
 * @swagger
 * /stock/entry:
 *   post:
 *     summary: Enregistrer une entrée de stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entrée de stock enregistrée
 */
router.post('/entry', [checkJwt, checkRole(['ADMIN', 'MANAGER', 'EMPLOYEE'])], StockController.stockEntry);

/**
 * @swagger
 * /stock/exit:
 *   post:
 *     summary: Enregistrer une sortie de stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sortie de stock enregistrée
 */
router.post('/exit', [checkJwt, checkRole(['ADMIN', 'MANAGER', 'EMPLOYEE'])], StockController.stockExit);

/**
 * @swagger
 * /stock/adjustment:
 *   post:
 *     summary: Ajustement manuel du stock
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ajustement effectué
 *       403:
 *         description: Accès interdit
 */
router.post('/adjustment', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], StockController.stockAdjustment);

export default router;