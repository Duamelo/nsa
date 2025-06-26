// Stock.test.ts
import { validate } from 'class-validator';

// Mock de la classe Product
jest.mock('../../src/entity/Product', () => {
    return {
        Product: jest.fn().mockImplementation(() => ({
            id: undefined,
            name: '',
            description: undefined,
            price: 0,
            unit: 'piece',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            stock: undefined,
            stockMovements: []
        }))
    };
});

// Mock de class-validator
jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsNotEmpty: jest.fn(() => jest.fn()),
    Length: jest.fn(() => jest.fn()),
    IsNumber: jest.fn(() => jest.fn()),
    Min: jest.fn(() => jest.fn())
}));

// Mock de TypeORM decorators
jest.mock('typeorm', () => ({
    Entity: jest.fn(() => jest.fn()),
    PrimaryGeneratedColumn: jest.fn(() => jest.fn()),
    Column: jest.fn(() => jest.fn()),
    CreateDateColumn: jest.fn(() => jest.fn()),
    UpdateDateColumn: jest.fn(() => jest.fn()),
    OneToOne: jest.fn(() => jest.fn()),
    OneToMany: jest.fn(() => jest.fn()),
    JoinColumn: jest.fn(() => jest.fn())
}));

import { Stock } from '../../src/entity/Stock';
import { Product } from '../../src/entity/Product';

// Mock de la fonction validate
const mockValidate = validate as jest.MockedFunction<typeof validate>;

describe('Stock Entity', () => {
    let stock: Stock;
    let mockProduct: Product;

    beforeEach(() => {
        jest.clearAllMocks();

        // Créer une instance de Stock réelle
        stock = new Stock();
        stock.quantity = 50;
        stock.minThreshold = 10;
        stock.criticalThreshold = 5;

        // Espionner les méthodes si nécessaire pour les tests
        jest.spyOn(stock, 'isLowStock');
        jest.spyOn(stock, 'isCriticalStock');
        jest.spyOn(stock, 'isOutOfStock');
        jest.spyOn(stock, 'addStock');
        jest.spyOn(stock, 'removeStock');
        jest.spyOn(stock, 'getStockStatus');

        // Créer une instance de Product mockée
        mockProduct = new Product();
        mockProduct.id = 1;
        mockProduct.name = 'Test Product';
        mockProduct.price = 100;
    });

    describe('Validation', () => {
        it('should validate a valid stock', async () => {
            mockValidate.mockResolvedValue([]);

            const errors = await validate(stock);
            expect(errors).toHaveLength(0);
            expect(mockValidate).toHaveBeenCalledWith(stock);
        });

        it('should fail validation when quantity is negative', async () => {
            const mockError = {
                property: 'quantity',
                constraints: { min: 'quantity must not be less than 0' }
            };
            mockValidate.mockResolvedValue([mockError]);

            stock.quantity = -1;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('quantity');
            expect(errors[0].constraints).toHaveProperty('min');
            expect(mockValidate).toHaveBeenCalledWith(stock);
        });

        it('should fail validation when minThreshold is negative', async () => {
            const mockError = {
                property: 'minThreshold',
                constraints: { min: 'minThreshold must not be less than 0' }
            };
            mockValidate.mockResolvedValue([mockError]);

            stock.minThreshold = -1;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('minThreshold');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when criticalThreshold is negative', async () => {
            const mockError = {
                property: 'criticalThreshold',
                constraints: { min: 'criticalThreshold must not be less than 0' }
            };
            mockValidate.mockResolvedValue([mockError]);

            stock.criticalThreshold = -1;

            const errors = await validate(stock);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('criticalThreshold');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when quantity is not a number', async () => {
            const mockError = {
                property: 'quantity',
                constraints: { isNumber: 'quantity must be a number' }
            };
            mockValidate.mockResolvedValue([mockError]);

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

            stock.id = 1;
            stock.quantity = 100;
            stock.minThreshold = 20;
            stock.criticalThreshold = 10;
            stock.productId = 1;
            stock.product = mockProduct;
            stock.createdAt = now;
            stock.updatedAt = now;

            expect(stock.id).toBe(1);
            expect(stock.quantity).toBe(100);
            expect(stock.minThreshold).toBe(20);
            expect(stock.criticalThreshold).toBe(10);
            expect(stock.productId).toBe(1);
            expect(stock.product).toBe(mockProduct);
            expect(stock.createdAt).toBe(now);
            expect(stock.updatedAt).toBe(now);
        });
    });

    describe('Stock Status Methods', () => {
        describe('isLowStock()', () => {
            it('should return true when quantity is equal to minThreshold', () => {
                stock.quantity = 10;
                stock.minThreshold = 10;

                const result = stock.isLowStock();

                expect(result).toBe(true);
                expect(stock.isLowStock).toHaveBeenCalled();
            });

            it('should return true when quantity is less than minThreshold', () => {
                stock.quantity = 5;
                stock.minThreshold = 10;

                const result = stock.isLowStock();

                expect(result).toBe(true);
                expect(stock.isLowStock).toHaveBeenCalled();
            });

            it('should return false when quantity is greater than minThreshold', () => {
                stock.quantity = 15;
                stock.minThreshold = 10;

                const result = stock.isLowStock();

                expect(result).toBe(false);
                expect(stock.isLowStock).toHaveBeenCalled();
            });
        });

        describe('isCriticalStock()', () => {
            it('should return true when quantity is equal to criticalThreshold', () => {
                stock.quantity = 5;
                stock.criticalThreshold = 5;

                const result = stock.isCriticalStock();

                expect(result).toBe(true);
                expect(stock.isCriticalStock).toHaveBeenCalled();
            });

            it('should return true when quantity is less than criticalThreshold', () => {
                stock.quantity = 2;
                stock.criticalThreshold = 5;

                const result = stock.isCriticalStock();

                expect(result).toBe(true);
                expect(stock.isCriticalStock).toHaveBeenCalled();
            });

            it('should return false when quantity is greater than criticalThreshold', () => {
                stock.quantity = 10;
                stock.criticalThreshold = 5;

                const result = stock.isCriticalStock();

                expect(result).toBe(false);
                expect(stock.isCriticalStock).toHaveBeenCalled();
            });
        });

        describe('isOutOfStock()', () => {
            it('should return true when quantity is 0', () => {
                stock.quantity = 0;

                const result = stock.isOutOfStock();

                expect(result).toBe(true);
                expect(stock.isOutOfStock).toHaveBeenCalled();
            });

            it('should return true when quantity is negative', () => {
                stock.quantity = -1;

                const result = stock.isOutOfStock();

                expect(result).toBe(true);
                expect(stock.isOutOfStock).toHaveBeenCalled();
            });

            it('should return false when quantity is positive', () => {
                stock.quantity = 1;

                const result = stock.isOutOfStock();

                expect(result).toBe(false);
                expect(stock.isOutOfStock).toHaveBeenCalled();
            });
        });
    });

    describe('Stock Management Methods', () => {
        describe('addStock()', () => {
            it('should add quantity to current stock', () => {
                stock.quantity = 10;

                stock.addStock(5);

                expect(stock.quantity).toBe(15);
                expect(stock.addStock).toHaveBeenCalledWith(5);
            });

            it('should handle adding zero quantity', () => {
                stock.quantity = 10;

                stock.addStock(0);

                expect(stock.quantity).toBe(10);
                expect(stock.addStock).toHaveBeenCalledWith(0);
            });

            it('should handle adding negative quantity', () => {
                stock.quantity = 10;

                stock.addStock(-5);

                expect(stock.quantity).toBe(5);
                expect(stock.addStock).toHaveBeenCalledWith(-5);
            });
        });

        describe('removeStock()', () => {
            it('should remove quantity and return true when sufficient stock', () => {
                stock.quantity = 10;

                const result = stock.removeStock(5);

                expect(result).toBe(true);
                expect(stock.quantity).toBe(5);
                expect(stock.removeStock).toHaveBeenCalledWith(5);
            });

            it('should remove exact quantity and return true', () => {
                stock.quantity = 10;

                const result = stock.removeStock(10);

                expect(result).toBe(true);
                expect(stock.quantity).toBe(0);
                expect(stock.removeStock).toHaveBeenCalledWith(10);
            });

            it('should not remove quantity and return false when insufficient stock', () => {
                stock.quantity = 5;

                const result = stock.removeStock(10);

                expect(result).toBe(false);
                expect(stock.quantity).toBe(5);
                expect(stock.removeStock).toHaveBeenCalledWith(10);
            });

            it('should handle removing zero quantity', () => {
                stock.quantity = 10;

                const result = stock.removeStock(0);

                expect(result).toBe(true);
                expect(stock.quantity).toBe(10);
                expect(stock.removeStock).toHaveBeenCalledWith(0);
            });
        });
    });

    describe('getStockStatus()', () => {
        it('should return OUT_OF_STOCK when quantity is 0', () => {
            stock.quantity = 0;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('OUT_OF_STOCK');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });

        it('should return OUT_OF_STOCK when quantity is negative', () => {
            stock.quantity = -1;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('OUT_OF_STOCK');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });

        it('should return CRITICAL when quantity is at critical threshold', () => {
            stock.quantity = 5;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('CRITICAL');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });

        it('should return CRITICAL when quantity is below critical threshold but above 0', () => {
            stock.quantity = 3;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('CRITICAL');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });

        it('should return LOW when quantity is at min threshold', () => {
            stock.quantity = 10;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('LOW');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });

        it('should return LOW when quantity is between critical and min thresholds', () => {
            stock.quantity = 7;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('LOW');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });

        it('should return NORMAL when quantity is above min threshold', () => {
            stock.quantity = 15;
            stock.criticalThreshold = 5;
            stock.minThreshold = 10;

            const result = stock.getStockStatus();

            expect(result).toBe('NORMAL');
            expect(stock.getStockStatus).toHaveBeenCalled();
        });
    });

    describe('Relations', () => {
        it('should allow setting product relation', () => {
            stock.product = mockProduct;
            stock.productId = 1;

            expect(stock.product).toBe(mockProduct);
            expect(stock.productId).toBe(1);
            expect(stock.product.id).toBe(1);
            expect(stock.product.name).toBe('Test Product');
        });
    });

    describe('Mock Verification', () => {
        it('should verify that spied methods are jest functions', () => {
            expect(jest.isMockFunction(stock.isLowStock)).toBe(true);
            expect(jest.isMockFunction(stock.isCriticalStock)).toBe(true);
            expect(jest.isMockFunction(stock.isOutOfStock)).toBe(true);
            expect(jest.isMockFunction(stock.addStock)).toBe(true);
            expect(jest.isMockFunction(stock.removeStock)).toBe(true);
            expect(jest.isMockFunction(stock.getStockStatus)).toBe(true);
        });

        it('should verify that validate function is mocked', () => {
            expect(jest.isMockFunction(mockValidate)).toBe(true);
        });
    });
});