import { Request, Response } from 'express';
import { getRepository, getConnection } from 'typeorm';
import { validate } from 'class-validator';
import { Product } from '../entity/Product';
import { Stock } from '../entity/Stock';

export class ProductController {

    // Obtenir tous les produits avec leurs stocks
    public static async getAllProducts(req: Request, res: Response): Promise<void> {
        const { includeInactive = false, withStock = true } = req.query;

        try {
            const productRepository = getRepository(Product);

            const queryBuilder = productRepository.createQueryBuilder('product');

            if (withStock === 'true' || withStock === true) {
                queryBuilder.leftJoinAndSelect('product.stock', 'stock');
            }

            if (!JSON.parse(includeInactive as string || 'false')) {
                queryBuilder.where('product.isActive = :isActive', { isActive: true });
            }

            queryBuilder.orderBy('product.name', 'ASC');

            const products = await queryBuilder.getMany();

            // Enrichir avec les informations de stock si demandé
            const enrichedProducts = products.map(product => ({
                ...product,
                stockInfo: product.stock ? {
                    quantity: product.stock.quantity,
                    minThreshold: product.stock.minThreshold,
                    criticalThreshold: product.stock.criticalThreshold,
                    stockStatus: product.stock.getStockStatus(),
                    alerts: ProductController.getStockAlerts(product.stock)
                } : null
            }));

            res.status(200).json({
                products: enrichedProducts,
                count: enrichedProducts.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération des produits',
                error: (error as Error).message
            });
        }
    }

    // Obtenir un produit par ID avec son stock
    public static async getProductById(req: Request, res: Response): Promise<void> {
        const productId: number = parseInt(req.params.id || '0', 10);

        if (isNaN(productId)) {
            res.status(400).json({ message: 'ID de produit invalide' });
            return;
        }

        try {
            const productRepository = getRepository(Product);

            const product = await productRepository.findOne({
                where: { id: productId },
                relations: ['stock', 'stockMovements'],
                order: {
                    stockMovements: {
                        createdAt: 'DESC'
                    }
                }
            });

            if (!product) {
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            res.status(200).json(product);
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error);
            res.status(500).json({
                message: 'Erreur lors de la récupération du produit',
                error: (error as Error).message
            });
        }
    }

    // Créer un nouveau produit avec stock initial
    public static async createProduct(req: Request, res: Response): Promise<void> {
        const {
            name,
            description,
            price,
            unit,
            initialQuantity = 0,
            minThreshold = 10,
            criticalThreshold = 5
        } = req.body;

        // Validation des champs requis
        if (!name || price === undefined) {
            res.status(400).json({ message: 'Le nom et le prix sont requis' });
            return;
        }

        if (price < 0) {
            res.status(400).json({ message: 'Le prix doit être positif ou nul' });
            return;
        }

        if (initialQuantity < 0 || minThreshold < 0 || criticalThreshold < 0) {
            res.status(400).json({ message: 'Les quantités et seuils doivent être positifs ou nuls' });
            return;
        }

        if (criticalThreshold > minThreshold) {
            res.status(400).json({ message: 'Le seuil critique doit être inférieur ou égal au seuil minimum' });
            return;
        }

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const productRepository = queryRunner.manager.getRepository(Product);
            const stockRepository = queryRunner.manager.getRepository(Stock);

            // Créer le produit
            const newProduct = productRepository.create({
                name: name.trim(),
                description: description?.trim(),
                price: parseFloat(price),
                unit: unit || 'unit',
                isActive: true
            });

            // Validation du produit
            const productErrors = await validate(newProduct);
            if (productErrors.length > 0) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ message: 'Erreurs de validation du produit', errors: productErrors });
                return;
            }

            // Sauvegarder le produit
            const savedProduct = await productRepository.save(newProduct);

            // Créer le stock initial
            const newStock = stockRepository.create({
                productId: savedProduct.id,
                quantity: parseInt(initialQuantity),
                minThreshold: parseInt(minThreshold),
                criticalThreshold: parseInt(criticalThreshold)
            });

            // Validation du stock
            // const stockErrors = await validate(newStock);
            // if (stockErrors.length > 0) {
            //     await queryRunner.rollbackTransaction();
            //     res.status(400).json({ message: 'Erreurs de validation du stock', errors: stockErrors });
            //     return;
            // }

            // Sauvegarder le stock
            const savedStock = await stockRepository.save(newStock);

            await queryRunner.commitTransaction();

            res.status(201).json({
                message: 'Produit créé avec succès',
                product: {
                    ...savedProduct,
                    stockInfo: {
                        quantity: savedStock.quantity,
                        minThreshold: savedStock.minThreshold,
                        criticalThreshold: savedStock.criticalThreshold,
                        stockStatus: savedStock.getStockStatus(),
                        alerts: ProductController.getStockAlerts(savedStock)
                    }
                }
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Erreur lors de la création du produit:', error);
        } finally {
            await queryRunner.release();
        }
    }

    // Mettre à jour un produit
    public static async updateProduct(req: Request, res: Response): Promise<void> {
        const productId: number = parseInt(req.params.id || '0', 10);

        if (isNaN(productId)) {
            res.status(400).json({ message: 'ID de produit invalide' });
            return;
        }

        const { name, description, price, unit, isActive } = req.body;

        // Validation des données
        if (price !== undefined && price < 0) {
            res.status(400).json({ message: 'Le prix doit être positif ou nul' });
            return;
        }

        try {
            const productRepository = getRepository(Product);

            const product = await productRepository.findOne({
                where: { id: productId },
                relations: ['stock']
            });

            if (!product) {
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            // Mettre à jour les champs fournis
            if (name !== undefined) product.name = name.trim();
            if (description !== undefined) product.description = description?.trim();
            if (price !== undefined) product.price = parseFloat(price);
            if (unit !== undefined) product.unit = unit;
            if (isActive !== undefined) product.isActive = Boolean(isActive);

            // Validation du produit mis à jour
            const errors = await validate(product);
            if (errors.length > 0) {
                res.status(400).json({ message: 'Erreurs de validation', errors });
                return;
            }

            const updatedProduct = await productRepository.save(product);

            // Enrichir avec les informations de stock
            const enrichedProduct = {
                ...updatedProduct,
                stockInfo: product.stock ? {
                    quantity: product.stock.quantity,
                    minThreshold: product.stock.minThreshold,
                    criticalThreshold: product.stock.criticalThreshold,
                    stockStatus: product.stock.getStockStatus(),
                    alerts: ProductController.getStockAlerts(product.stock)
                } : null
            };

            res.status(200).json({
                message: 'Produit mis à jour avec succès',
                product: enrichedProduct
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
        }
    }

    // Mettre à jour les seuils de stock d'un produit
    public static async updateStockThresholds(req: Request, res: Response): Promise<void> {
        const productId: number = parseInt(req.params.id || '0', 10);

        if (isNaN(productId)) {
            res.status(400).json({ message: 'ID de produit invalide' });
            return;
        }

        const { minThreshold, criticalThreshold } = req.body;

        if (minThreshold === undefined || criticalThreshold === undefined) {
            res.status(400).json({ message: 'Les seuils minimum et critique sont requis' });
            return;
        }

        if (minThreshold < 0 || criticalThreshold < 0) {
            res.status(400).json({ message: 'Les seuils doivent être positifs ou nuls' });
            return;
        }

        if (criticalThreshold > minThreshold) {
            res.status(400).json({ message: 'Le seuil critique doit être inférieur ou égal au seuil minimum' });
            return;
        }

        try {
            const productRepository = getRepository(Product);
            const stockRepository = getRepository(Stock);

            const product = await productRepository.findOne({
                where: { id: productId, isActive: true },
                relations: ['stock']
            });

            if (!product) {
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            if (!product.stock) {
                res.status(404).json({ message: 'Stock non trouvé pour ce produit' });
                return;
            }

            // Mettre à jour les seuils
            product.stock.minThreshold = parseInt(minThreshold);
            product.stock.criticalThreshold = parseInt(criticalThreshold);

            // Validation du stock
            const errors = await validate(product.stock);
            if (errors.length > 0) {
                res.status(400).json({ message: 'Erreurs de validation', errors });
                return;
            }

            const updatedStock = await stockRepository.save(product.stock);

            res.status(200).json({
                message: 'Seuils de stock mis à jour avec succès',
                stock: {
                    quantity: updatedStock.quantity,
                    minThreshold: updatedStock.minThreshold,
                    criticalThreshold: updatedStock.criticalThreshold,
                    stockStatus: updatedStock.getStockStatus(),
                    alerts: ProductController.getStockAlerts(updatedStock)
                }
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des seuils:', error);
            res.status(500).json({
                message: 'Erreur lors de la mise à jour des seuils',
                error: (error as Error).message
            });
        }
    }

    // Supprimer un produit (soft delete)
    public static async deleteProduct(req: Request, res: Response): Promise<void> {
        const productId: number = parseInt(req.params.id || '0', 10);

        if (isNaN(productId)) {
            res.status(400).json({ message: 'ID de produit invalide' });
            return;
        }

        try {
            const productRepository = getRepository(Product);

            const product = await productRepository.findOne({
                where: { id: productId }
            });

            if (!product) {
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            // Soft delete (marquer comme inactif)
            product.isActive = false;
            await productRepository.save(product);

            res.status(200).json({
                message: 'Produit désactivé avec succès',
                productId: productId
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            res.status(500).json({
                message: 'Erreur lors de la suppression du produit',
                error: (error as Error).message
            });
        }
    }

    // Réactiver un produit
    public static async reactivateProduct(req: Request, res: Response): Promise<void> {
        const productId: number = parseInt(req.params.id || '0', 10);

        if (isNaN(productId)) {
            res.status(400).json({ message: 'ID de produit invalide' });
            return;
        }

        try {
            const productRepository = getRepository(Product);

            const product = await productRepository.findOne({
                where: { id: productId },
                relations: ['stock']
            });

            if (!product) {
                res.status(404).json({ message: 'Produit non trouvé' });
                return;
            }

            // Réactiver le produit
            product.isActive = true;
            const updatedProduct = await productRepository.save(product);

            // Enrichir avec les informations de stock
            const enrichedProduct = {
                ...updatedProduct,
                stockInfo: product.stock ? {
                    quantity: product.stock.quantity,
                    minThreshold: product.stock.minThreshold,
                    criticalThreshold: product.stock.criticalThreshold,
                    stockStatus: product.stock.getStockStatus(),
                    alerts: ProductController.getStockAlerts(product.stock)
                } : null
            };

            res.status(200).json({
                message: 'Produit réactivé avec succès',
                product: enrichedProduct
            });
        } catch (error) {
            console.error('Erreur lors de la réactivation du produit:', error);
            res.status(500).json({
                message: 'Erreur lors de la réactivation du produit',
                error: (error as Error).message
            });
        }
    }

    // Rechercher des produits
    public static async searchProducts(req: Request, res: Response): Promise<void> {
        const { query, minPrice, maxPrice, unit, stockStatus } = req.query;

        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            res.status(400).json({ message: 'La requête de recherche doit contenir au moins 2 caractères' });
            return;
        }

        try {
            const productRepository = getRepository(Product);

            const queryBuilder = productRepository.createQueryBuilder('product')
                .leftJoinAndSelect('product.stock', 'stock')
                .where('product.isActive = :isActive', { isActive: true })
                .andWhere('(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query))',
                    { query: `%${query.trim()}%` });

            if (minPrice !== undefined) {
                queryBuilder.andWhere('product.price >= :minPrice', { minPrice: parseFloat(minPrice as string) });
            }

            if (maxPrice !== undefined) {
                queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: parseFloat(maxPrice as string) });
            }

            if (unit) {
                queryBuilder.andWhere('product.unit = :unit', { unit });
            }

            queryBuilder.orderBy('product.name', 'ASC');

            let products = await queryBuilder.getMany();

            // Filtrer par statut de stock si spécifié
            if (stockStatus) {
                products = products.filter(product => {
                    if (!product.stock) return stockStatus === 'OUT_OF_STOCK';
                    return product.stock.getStockStatus() === stockStatus;
                });
            }

            // Enrichir avec les informations de stock
            const enrichedProducts = products.map(product => ({
                ...product,
                stockInfo: product.stock ? {
                    quantity: product.stock.quantity,
                    minThreshold: product.stock.minThreshold,
                    criticalThreshold: product.stock.criticalThreshold,
                    stockStatus: product.stock.getStockStatus(),
                    alerts: ProductController.getStockAlerts(product.stock)
                } : null
            }));

            res.status(200).json({
                products: enrichedProducts,
                count: enrichedProducts.length,
                searchQuery: query
            });
        } catch (error) {
            console.error('Erreur lors de la recherche de produits:', error);
            res.status(500).json({
                message: 'Erreur lors de la recherche de produits',
                error: (error as Error).message
            });
        }
    }

    // Méthode utilitaire pour obtenir les alertes de stock
    private static getStockAlerts(stock: Stock): string[] {
        const alerts: string[] = [];

        if (stock.isOutOfStock()) {
            alerts.push('STOCK_EXHAUSTED');
        } else if (stock.isCriticalStock()) {
            alerts.push('CRITICAL_THRESHOLD_REACHED');
        } else if (stock.isLowStock()) {
            alerts.push('MIN_THRESHOLD_REACHED');
        }

        return alerts;
    }
}