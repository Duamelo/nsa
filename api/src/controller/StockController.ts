
// StockController.ts (mis à jour)
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { getRepository, getConnection } from 'typeorm';
import { Product } from '../entity/Product';
import { Stock } from '../entity/Stock';
import { StockMovement, MovementType } from '../entity/StockMovement';

export class StockController {

    // Marquer une entrée de stock
    public static stockEntry = async (req: Request, res: Response) => {
        const { productId, quantity, reason, reference } = req.body;
        const userId = 1;

        if (!productId || !quantity || quantity <= 0) {
            res.status(400).json({ message: 'ProductId et quantity (> 0) sont requis' });
            return;
        }

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const productRepository = queryRunner.manager.getRepository(Product);
            const stockRepository = queryRunner.manager.getRepository(Stock);
            const stockMovementRepository = queryRunner.manager.getRepository(StockMovement);

            const product = await productRepository.findOne({
                where: { id: productId, isActive: true },
                relations: ['stock']
            });

            if (!product) {
                await queryRunner.rollbackTransaction();
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            // Créer le stock s'il n'existe pas
            if (!product.stock) {
                const newStock = new Stock();
                newStock.productId = productId;
                newStock.quantity = 0;
                newStock.minThreshold = 10;
                newStock.criticalThreshold = 5;
                product.stock = await stockRepository.save(newStock);
            }

            console.log('Stock avant l\'entrée:', product.stock);
            const previousQuantity = product.stock.quantity;

            // Utiliser la méthode addStock de l'entité Stock
            product.stock.addStock(quantity);
            const newQuantity = product.stock.quantity;

            // Créer le mouvement de stock pour l'historique
            const movement = new StockMovement();
            movement.type = MovementType.ENTRY;
            movement.quantity = quantity;
            movement.previousQuantity = previousQuantity;
            movement.newQuantity = newQuantity;
            movement.reason = reason || 'Entrée de stock';
            movement.reference = reference;
            movement.productId = productId;
            movement.userId = userId;

            // Validation du mouvement
            const errors = await validate(movement);
            if (errors.length > 0) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ message: 'Erreurs de validation', errors });
                return;
            }

            // Sauvegarder en transaction
            await stockRepository.save(product.stock);
            await stockMovementRepository.save(movement);

            await queryRunner.commitTransaction();

            res.status(200).json({
                message: 'Entrée de stock enregistrée avec succès',
                product: {
                    id: product.id,
                    name: product.name,
                    previousQuantity,
                    newQuantity,
                    stockStatus: product.stock.getStockStatus()
                },
                movement
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Erreur lors de l\'entrée de stock:', error);
            res.status(500).json({ message: 'Erreur lors de l\'entrée de stock', error: (error as any).message });
        } finally {
            await queryRunner.release();
        }
    };

    // Marquer une sortie de stock
    public static stockExit = async (req: Request, res: Response) => {
        const { productId, quantity, reason, reference } = req.body;
        const userId = 1;

        if (!productId || !quantity || quantity <= 0) {
            res.status(400).json({ message: 'ProductId et quantity (> 0) sont requis' });
            return;
        }

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const productRepository = queryRunner.manager.getRepository(Product);
            const stockRepository = queryRunner.manager.getRepository(Stock);
            const stockMovementRepository = queryRunner.manager.getRepository(StockMovement);

            const product = await productRepository.findOne({
                where: { id: productId, isActive: true },
                relations: ['stock']
            });

            if (!product || !product.stock) {
                await queryRunner.rollbackTransaction();
                res.status(404).json({ message: 'Produit ou stock non trouvé' });
                return;
            }

            const previousQuantity = product.stock.quantity;

            // Vérifier si le stock est suffisant avec la méthode de Stock
            if (!product.stock.removeStock(quantity)) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({
                    message: 'Stock insuffisant',
                    availableQuantity: previousQuantity,
                    requestedQuantity: quantity
                });
                return;
            }

            const newQuantity = product.stock.quantity;

            // Créer le mouvement de stock pour l'historique
            const movement = new StockMovement();
            movement.type = MovementType.EXIT;
            movement.quantity = quantity;
            movement.previousQuantity = previousQuantity;
            movement.newQuantity = newQuantity;
            movement.reason = reason || 'Sortie de stock';
            movement.reference = reference;
            movement.productId = productId;
            movement.userId = userId;

            // Validation du mouvement
            const errors = await validate(movement);
            if (errors.length > 0) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ message: 'Erreurs de validation', errors });
                return;
            }

            // Sauvegarder en transaction
            await stockRepository.save(product.stock);
            await stockMovementRepository.save(movement);

            await queryRunner.commitTransaction();

            // Vérifier les alertes après la sortie
            const alerts = [];
            if (product.stock.isOutOfStock()) {
                alerts.push('STOCK_EXHAUSTED');
            } else if (product.stock.isCriticalStock()) {
                alerts.push('CRITICAL_THRESHOLD_REACHED');
            } else if (product.stock.isLowStock()) {
                alerts.push('MIN_THRESHOLD_REACHED');
            }

            res.status(200).json({
                message: 'Sortie de stock enregistrée avec succès',
                product: {
                    id: product.id,
                    name: product.name,
                    previousQuantity,
                    newQuantity,
                    stockStatus: product.stock.getStockStatus()
                },
                movement,
                alerts
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Erreur lors de la sortie de stock:', error);
            res.status(500).json({ message: 'Erreur lors de la sortie de stock', error: (error as any).message });
        } finally {
            await queryRunner.release();
        }
    };

    // Ajustement de stock (correction)
    public static stockAdjustment = async (req: Request, res: Response) => {
        const { productId, newQuantity, reason } = req.body;
        const userId = 1;

        if (!productId || newQuantity < 0) {
            res.status(400).json({ message: 'ProductId et newQuantity (>= 0) sont requis' });
            return;
        }

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const productRepository = queryRunner.manager.getRepository(Product);
            const stockRepository = queryRunner.manager.getRepository(Stock);
            const stockMovementRepository = queryRunner.manager.getRepository(StockMovement);

            const product = await productRepository.findOne({
                where: { id: productId, isActive: true },
                relations: ['stock']
            });

            if (!product) {
                await queryRunner.rollbackTransaction();
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            // Créer le stock s'il n'existe pas
            if (!product.stock) {
                const newStock = new Stock();
                newStock.productId = productId;
                newStock.quantity = 0;
                newStock.minThreshold = 10;
                newStock.criticalThreshold = 5;
                product.stock = await stockRepository.save(newStock);
            }

            const previousQuantity = product.stock.quantity;
            const adjustmentQuantity = Math.abs(newQuantity - previousQuantity);

            // Mettre à jour la quantité du stock
            product.stock.quantity = newQuantity;

            // Créer le mouvement de stock pour l'historique
            const movement = new StockMovement();
            movement.type = MovementType.ADJUSTMENT;
            movement.quantity = adjustmentQuantity;
            movement.previousQuantity = previousQuantity;
            movement.newQuantity = newQuantity;
            movement.reason = reason || 'Ajustement de stock';
            movement.productId = productId;
            movement.userId = userId;

            // Validation du mouvement
            const errors = await validate(movement);
            if (errors.length > 0) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ message: 'Erreurs de validation', errors });
                return;
            }

            // Sauvegarder en transaction
            await stockRepository.save(product.stock);
            await stockMovementRepository.save(movement);

            await queryRunner.commitTransaction();

            res.status(200).json({
                message: 'Ajustement de stock effectué avec succès',
                product: {
                    id: product.id,
                    name: product.name,
                    previousQuantity,
                    newQuantity,
                    adjustment: newQuantity - previousQuantity,
                    stockStatus: product.stock.getStockStatus()
                },
                movement
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Erreur lors de l\'ajustement de stock:', error);
            res.status(500).json({ message: 'Erreur lors de l\'ajustement de stock', error: (error as any).message });
        } finally {
            await queryRunner.release();
        }
    };

    // Consulter l'historique des mouvements de stock
    public static getStockHistory = async (req: Request, res: Response) => {
        const { productId } = req.params;
        const { page = 1, limit = 50, type } = req.query;

        try {
            const stockMovementRepository = getRepository(StockMovement);

            const query = stockMovementRepository.createQueryBuilder('movement')
                .leftJoinAndSelect('movement.product', 'product')
                .leftJoinAndSelect('movement.user', 'user')
                .orderBy('movement.createdAt', 'DESC');

            if (productId) {
                query.where('movement.productId = :productId', { productId: parseInt(productId) });
            }

            if (type && Object.values(MovementType).includes(type as MovementType)) {
                query.andWhere('movement.type = :type', { type });
            }

            const skip = (Number(page) - 1) * Number(limit);
            query.skip(skip).take(Number(limit));

            const [movements, total] = await query.getManyAndCount();

            res.status(200).json({
                movements,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error: (error as any).message });
        }
    };

    // Obtenir les mouvements récents
    public static getRecentMovements = async (req: Request, res: Response) => {
        const { limit = 20 } = req.query;

        try {
            const stockMovementRepository = getRepository(StockMovement);

            const movements = await stockMovementRepository.find({
                relations: ['product', 'user'],
                order: { createdAt: 'DESC' },
                take: Number(limit)
            });

            res.status(200).json({
                movements,
                count: movements.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des mouvements récents:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des mouvements récents', error: (error as any).message });
        }
    };

    // Rapport de stock par période
    public static getStockReport = async (req: Request, res: Response) => {
        const { startDate, endDate, productId } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ message: 'startDate et endDate sont requis' });
            return;
        }

        try {
            const stockMovementRepository = getRepository(StockMovement);

            const query = stockMovementRepository.createQueryBuilder('movement')
                .leftJoinAndSelect('movement.product', 'product')
                .where('movement.createdAt BETWEEN :startDate AND :endDate', {
                    startDate: new Date(startDate as string),
                    endDate: new Date(endDate as string)
                });

            if (productId) {
                query.andWhere('movement.productId = :productId', { productId: parseInt(productId as string) });
            }

            const movements = await query.getMany();

            // Calculer les statistiques
            const stats = {
                totalMovements: movements.length,
                entries: movements.filter(m => m.type === MovementType.ENTRY).length,
                exits: movements.filter(m => m.type === MovementType.EXIT).length,
                adjustments: movements.filter(m => m.type === MovementType.ADJUSTMENT).length,
                totalEntryQuantity: movements
                    .filter(m => m.type === MovementType.ENTRY)
                    .reduce((sum, m) => sum + m.quantity, 0),
                totalExitQuantity: movements
                    .filter(m => m.type === MovementType.EXIT)
                    .reduce((sum, m) => sum + m.quantity, 0)
            };

            res.status(200).json({
                period: {
                    startDate,
                    endDate
                },
                stats,
                movements
            });
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport', error: (error as any).message });
        }
    };

    // Obtenir le stock actuel d'un produit
    public static getCurrentStock = async (req: Request, res: Response) => {
        const { productId } = req.params;

        try {
            const productRepository = getRepository(Product);

            const product = await productRepository.findOne({
                where: { id: parseInt(productId || '0'), isActive: true },
                relations: ['stock']
            });

            if (!product) {
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            if (!product.stock) {
                res.status(200).json({
                    product: {
                        id: product.id,
                        name: product.name,
                        unit: product.unit
                    },
                    stock: {
                        quantity: 0,
                        minThreshold: 10,
                        criticalThreshold: 5,
                        stockStatus: 'OUT_OF_STOCK'
                    }
                });
                return;
            }

            res.status(200).json({
                product: {
                    id: product.id,
                    name: product.name,
                    unit: product.unit
                },
                stock: {
                    quantity: product.stock.quantity,
                    minThreshold: product.stock.minThreshold,
                    criticalThreshold: product.stock.criticalThreshold,
                    stockStatus: product.stock.getStockStatus()
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du stock:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération du stock', error: (error as any).message });
        }
    };

    // Obtenir tous les stocks avec alertes
    public static getAllStocksWithAlerts = async (req: Request, res: Response) => {
        try {
            const productRepository = getRepository(Product);

            const products = await productRepository.find({
                where: { isActive: true },
                relations: ['stock']
            });

            const stocksWithAlerts = products.map(product => {
                const stockInfo = {
                    productId: product.id,
                    productName: product.name,
                    unit: product.unit,
                    quantity: product.stock?.quantity || 0,
                    minThreshold: product.stock?.minThreshold || 10,
                    criticalThreshold: product.stock?.criticalThreshold || 5,
                    stockStatus: product.stock?.getStockStatus() || 'OUT_OF_STOCK',
                    alerts: [] as string[]
                };

                if (!product.stock || product.stock.isOutOfStock()) {
                    stockInfo.alerts.push('STOCK_EXHAUSTED');
                } else if (product.stock.isCriticalStock()) {
                    stockInfo.alerts.push('CRITICAL_THRESHOLD_REACHED');
                } else if (product.stock.isLowStock()) {
                    stockInfo.alerts.push('MIN_THRESHOLD_REACHED');
                }

                return stockInfo;
            });

            // Filtrer par type d'alerte si spécifié
            const { alertType } = req.query;
            let filteredStocks = stocksWithAlerts;

            if (alertType) {
                filteredStocks = stocksWithAlerts.filter(stock =>
                    stock.alerts.includes(alertType as string)
                );
            }

            res.status(200).json({
                stocks: filteredStocks,
                summary: {
                    total: stocksWithAlerts.length,
                    withAlerts: stocksWithAlerts.filter(s => s.alerts.length > 0).length,
                    outOfStock: stocksWithAlerts.filter(s => s.alerts.includes('STOCK_EXHAUSTED')).length,
                    critical: stocksWithAlerts.filter(s => s.alerts.includes('CRITICAL_THRESHOLD_REACHED')).length,
                    low: stocksWithAlerts.filter(s => s.alerts.includes('MIN_THRESHOLD_REACHED')).length
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des stocks:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des stocks', error: (error as any).message });
        }
    };
}