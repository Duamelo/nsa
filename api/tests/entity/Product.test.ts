// Product.test.ts
import { validate } from 'class-validator';
import { Product } from '../../src/entity/Product';
import { Stock } from '../../src/entity/Stock';
import { StockMovement } from '../../src/entity/StockMovement';

describe('Product Entity', () => {
    let product: Product;

    beforeEach(() => {
        product = new Product();
    });

    describe('Validation', () => {
        it('should validate a valid product', async () => {
            product.name = 'Test Product';
            product.price = 10.99;
            product.description = 'A test product';
            product.unit = 'piece';
            product.isActive = true;

            const errors = await validate(product);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when name is empty', async () => {
            product.name = '';
            product.price = 10.99;

            const errors = await validate(product);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when name is too short', async () => {
            product.name = 'A';
            product.price = 10.99;

            const errors = await validate(product);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('length');
        });

        it('should fail validation when name is too long', async () => {
            product.name = 'A'.repeat(101);
            product.price = 10.99;

            const errors = await validate(product);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('length');
        });

        it('should fail validation when price is negative', async () => {
            product.name = 'Test Product';
            product.price = -5;

            const errors = await validate(product);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('price');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when price is not a number', async () => {
            product.name = 'Test Product';
            product.price = 'not a number' as any;

            const errors = await validate(product);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('price');
            expect(errors[0].constraints).toHaveProperty('isNumber');
        });
    });

    describe('Properties', () => {
        it('should have correct default values', () => {
            expect(product.unit).toBeUndefined(); // Will be set by TypeORM default
            expect(product.isActive).toBeUndefined(); // Will be set by TypeORM default
        });

        it('should allow setting all properties', () => {
            const now = new Date();

            product.id = 1;
            product.name = 'Test Product';
            product.description = 'Test description';
            product.price = 29.99;
            product.unit = 'kg';
            product.isActive = false;
            product.createdAt = now;
            product.updatedAt = now;

            expect(product.id).toBe(1);
            expect(product.name).toBe('Test Product');
            expect(product.description).toBe('Test description');
            expect(product.price).toBe(29.99);
            expect(product.unit).toBe('kg');
            expect(product.isActive).toBe(false);
            expect(product.createdAt).toBe(now);
            expect(product.updatedAt).toBe(now);
        });
    });

    describe('Relations', () => {
        it('should allow setting stock relation', () => {
            const stock = new Stock();
            stock.id = 1;
            stock.quantity = 100;

            product.stock = stock;

            expect(product.stock).toBe(stock);
            expect(product.stock.quantity).toBe(100);
        });

        it('should allow setting stockMovements relation', () => {
            const movement1 = new StockMovement();
            const movement2 = new StockMovement();
            movement1.id = 1;
            movement2.id = 2;

            product.stockMovements = [movement1, movement2];

            expect(product.stockMovements).toHaveLength(2);
            expect(product.stockMovements[0]).toBe(movement1);
            expect(product.stockMovements[1]).toBe(movement2);
        });
    });
});
