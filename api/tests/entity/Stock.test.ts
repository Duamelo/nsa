
// Stock.test.ts
import { validate } from 'class-validator';
import { Stock } from '../../src/entity/Stock';
import { Product } from '../../src/entity/Product';

describe('Stock Entity', () => {
    let stock: Stock;

    beforeEach(() => {
        stock = new Stock();
        stock.quantity = 50;
        stock.minThreshold = 10;
        stock.criticalThreshold = 5;
    });

    describe('Validation', () => {
        it('should validate a valid stock', async () => {
            const errors = await validate(stock);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when quantity is negative', async () => {
            stock.quantity = -1;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('quantity');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when minThreshold is negative', async () => {
            stock.minThreshold = -1;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('minThreshold');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when criticalThreshold is negative', async () => {
            stock.criticalThreshold = -1;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('criticalThreshold');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when quantity is not a number', async () => {
            stock.quantity = 'not a number' as any;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('quantity');
            expect(errors[0].constraints).toHaveProperty('isNumber');
        });
    });

    describe('Properties', () => {
        it('should allow setting all properties', () => {
            const now = new Date();
            const product = new Product();

            stock.id = 1;
            stock.quantity = 100;
            stock.minThreshold = 20;
            stock.criticalThreshold = 10;
            stock.productId = 1;
            stock.product = product;
            stock.createdAt = now;
            stock.updatedAt = now;

            expect(stock.id).toBe(1);
            expect(stock.quantity).toBe(100);
            expect(stock.minThreshold).toBe(20);
            expect(stock.criticalThreshold).toBe(10);
            expect(stock.productId).toBe(1);
            expect(stock.product).toBe(product);
            expect(stock.createdAt).toBe(now);
            expect(stock.updatedAt).toBe(now);
        });
    });

    describe('Stock Status Methods', () => {
        describe('isLowStock()', () => {
            it('should return true when quantity is equal to minThreshold', () => {
                stock.quantity = 10;
                stock.minThreshold = 10;

                expect(stock.isLowStock()).toBe(true);
            });

            it('should return true when quantity is less than minThreshold', () => {
                stock.quantity = 5;
                stock.minThreshold = 10;

                expect(stock.isLowStock()).toBe(true);
            });

            it('should return false when quantity is greater than minThreshold', () => {
                stock.quantity = 15;
                stock.minThreshold = 10;

                expect(stock.isLowStock()).toBe(false);
            });
        });

        describe('isCriticalStock()', () => {
            it('should return true when quantity is equal to criticalThreshold', () => {
                stock.quantity = 5;
                stock.criticalThreshold = 5;

                expect(stock.isCriticalStock()).toBe(true);
            });

            it('should return true when quantity is less than criticalThreshold', () => {
                stock.quantity = 2;
                stock.criticalThreshold = 5;

                expect(stock.isCriticalStock()).toBe(true);
            });

            it('should return false when quantity is greater than criticalThreshold', () => {
                stock.quantity = 10;
                stock.criticalThreshold = 5;

                expect(stock.isCriticalStock()).toBe(false);
            });
        });

        describe('isOutOfStock()', () => {
            it('should return true when quantity is 0', () => {
                stock.quantity = 0;

                expect(stock.isOutOfStock()).toBe(true);
            });

            it('should return true when quantity is negative', () => {
                stock.quantity = -1;

                expect(stock.isOutOfStock()).toBe(true);
            });

            it('should return false when quantity is positive', () => {
                stock.quantity = 1;

                expect(stock.isOutOfStock()).toBe(false);
            });
        });
    });

    describe('Stock Management Methods', () => {
        describe('addStock()', () => {
            it('should add quantity to current stock', () => {
                stock.quantity = 10;

                stock.addStock(5);

                expect(stock.quantity).toBe(15);
            });

            it('should handle adding zero quantity', () => {
                stock.quantity = 10;

                stock.addStock(0);

                expect(stock.quantity).toBe(10);
            });

            it('should handle adding negative quantity', () => {
                stock.quantity = 10;

                stock.addStock(-5);

                expect(stock.quantity).toBe(5);
            });
        });

        describe('removeStock()', () => {
            it('should remove quantity and return true when sufficient stock', () => {
                stock.quantity = 10;

                const result = stock.removeStock(5);

                expect(result).toBe(true);
                expect(stock.quantity).toBe(5);
            });

            it('should remove exact quantity and return true', () => {
                stock.quantity = 10;

                const result = stock.removeStock(10);

                expect(result).toBe(true);
                expect(stock.quantity).toBe(0);
            });

            it('should not remove quantity and return false when insufficient stock', () => {
                stock.quantity = 5;

                const result = stock.removeStock(10);

                expect(result).toBe(false);
                expect(stock.quantity).toBe(5);
            });

            it('should handle removing zero quantity', () => {
                stock.quantity = 10;

                const result = stock.removeStock(0);

                expect(result).toBe(true);
                expect(stock.quantity).toBe(10);
            });
        });
    });

    describe('getStockStatus()', () => {
        it('should return OUT_OF_STOCK when quantity is 0', () => {
            stock.quantity = 0;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('OUT_OF_STOCK');
        });

        it('should return OUT_OF_STOCK when quantity is negative', () => {
            stock.quantity = -1;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('OUT_OF_STOCK');
        });

        it('should return CRITICAL when quantity is at critical threshold', () => {
            stock.quantity = 5;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('CRITICAL');
        });

        it('should return CRITICAL when quantity is below critical threshold but above 0', () => {
            stock.quantity = 3;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('CRITICAL');
        });

        it('should return LOW when quantity is at min threshold', () => {
            stock.quantity = 10;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('LOW');
        });

        it('should return LOW when quantity is between critical and min thresholds', () => {
            stock.quantity = 7;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('LOW');
        });

        it('should return NORMAL when quantity is above min threshold', () => {
            stock.quantity = 15;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            expect(stock.getStockStatus()).toBe('NORMAL');
        });
    });

    describe('Relations', () => {
        it('should allow setting product relation', () => {
            const product = new Product();
            product.id = 1;
            product.name = 'Test Product';

            stock.product = product;
            stock.productId = 1;

            expect(stock.product).toBe(product);
            expect(stock.productId).toBe(1);
        });
    });
});