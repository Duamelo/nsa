import { Router } from 'express';
import { StockController } from '../controller/StockController';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Routes de consultation - Authentification requise
router.get('/alerts', [checkJwt], StockController.getAllStocksWithAlerts);
router.get('/current/:productId([0-9]+)', [checkJwt], StockController.getCurrentStock);
router.get('/history', [checkJwt], StockController.getStockHistory);
router.get('/history/:productId([0-9]+)', [checkJwt], StockController.getStockHistory);
router.get('/recent', [checkJwt], StockController.getRecentMovements);

// Route de rapport - ADMIN/MANAGER requis
router.get('/report', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], StockController.getStockReport);

// Routes de modification de stock
// Entrée de stock - ADMIN/MANAGER/EMPLOYEE (peut être utilisé pour réception de livraisons)
router.post('/entry', [checkJwt, checkRole(['ADMIN', 'MANAGER', 'EMPLOYEE'])], StockController.stockEntry);

// Sortie de stock - ADMIN/MANAGER/EMPLOYEE (pour les ventes, consommations, etc.)
router.post('/exit', [checkJwt, checkRole(['ADMIN', 'MANAGER', 'EMPLOYEE'])], StockController.stockExit);

// Ajustement de stock - ADMIN/MANAGER uniquement (corrections d'inventaire)
router.post('/adjustment', [checkJwt, checkRole(['ADMIN', 'MANAGER'])], StockController.stockAdjustment);

export default router;