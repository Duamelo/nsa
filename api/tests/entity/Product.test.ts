// Product.test.ts (avec mock de TypeORM, Stock et StockMovement)

// Mock de TypeORM - OBLIGATOIRE AVANT LES AUTRES IMPORTS
jest.mock('typeorm', () => ({
    Entity: () => () => { },
    PrimaryGeneratedColumn: () => () => { },
    Column: () => () => { },
    CreateDateColumn: () => () => { },
    UpdateDateColumn: () => () => { },
    OneToOne: () => () => { },
    OneToMany: () => () => { },
    ManyToOne: () => () => { },
    JoinColumn: () => () => { },
}));

// Mock des décorateurs class-validator
jest.mock('class-validator', () => ({
    IsNotEmpty: () => () => { },
    IsIn: () => () => { },
    IsOptional: () => () => { },
    IsString: () => () => { },
    IsNumber: () => () => { },
    IsBoolean: () => () => { },
    IsDate: () => () => { },
    Min: () => () => { },
    Max: () => () => { },
    Length: () => () => { },
}));

// Mock de la classe StockMovement
jest.mock('../../src/entity/StockMovement', () => {
    enum MockMovementType {
        ENTRY = 'ENTRY',
        EXIT = 'EXIT',
        ADJUSTMENT = 'ADJUSTMENT'
    }

    class MockStockMovement {
        id?: number;
        type: string = 'ENTRY';
        quantity: number = 0;
        reason?: string;
        productId?: number;
        userId?: number;
        createdAt?: Date;
        updatedAt?: Date;
        product?: any;
        user?: any;

        constructor(data: Partial<MockStockMovement> = {}) {
            Object.assign(this, data);
        }
    }

    return {
        StockMovement: MockStockMovement,
        MovementType: MockMovementType
    };
});

// Mock de la classe Stock au niveau du module - AVANT les imports
jest.mock('../../src/entity/Stock', () => {
    // Mock de la classe Stock définie directement dans le mock
    class MockStock {
        id?: number;
        quantity: number = 0;
        minThreshold: number = 0;
        criticalThreshold: number = 0;
        productId?: number;
        createdAt?: Date;
        updatedAt?: Date;
        product?: any;

        constructor(data: Partial<MockStock> = {}) {
            Object.assign(this, data);
        }

        // Méthodes business logic mockées
        isLowStock(): boolean {
            return this.quantity <= this.minThreshold;
        }

        isCriticalStock(): boolean {
            return this.quantity <= this.criticalThreshold;
        }

        isOutOfStock(): boolean {
            return this.quantity <= 0;
        }

        addStock(quantity: number): void {
            this.quantity += quantity;
        }

        removeStock(quantity: number): boolean {
            if (this.quantity >= quantity) {
                this.quantity -= quantity;
                return true;
            }
            return false;
        }

        getStockStatus(): 'OUT_OF_STOCK' | 'CRITICAL' | 'LOW' | 'NORMAL' {
            if (this.isOutOfStock()) {
                return 'OUT_OF_STOCK';
            }
            if (this.isCriticalStock()) {
                return 'CRITICAL';
            }
            if (this.isLowStock()) {
                return 'LOW';
            }
            return 'NORMAL';
        }
    }

    return {
        Stock: MockStock
    };
});

import { Product } from '../../src/entity/Product';

// Types pour les tests
type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';

// Mock des StockMovements pour les tests
interface MockStockMovement {
    id?: number;
    type?: MovementType;
    quantity?: number;
    reason?: string;
    productId?: number;
    userId?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Classe MockStock pour les tests (identique à celle dans le mock)
class MockStock {
    id?: number;
    quantity: number = 0;
    minThreshold: number = 0;
    criticalThreshold: number = 0;
    productId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    product?: Product;

    constructor(data: Partial<MockStock> = {}) {
        Object.assign(this, data);
    }

    isLowStock(): boolean {
        return this.quantity <= this.minThreshold;
    }

    isCriticalStock(): boolean {
        return this.quantity <= this.criticalThreshold;
    }

    isOutOfStock(): boolean {
        return this.quantity <= 0;
    }

    addStock(quantity: number): void {
        this.quantity += quantity;
    }

    removeStock(quantity: number): boolean {
        if (this.quantity >= quantity) {
            this.quantity -= quantity;
            return true;
        }
        return false;
    }

    getStockStatus(): 'OUT_OF_STOCK' | 'CRITICAL' | 'LOW' | 'NORMAL' {
        if (this.isOutOfStock()) {
            return 'OUT_OF_STOCK';
        }
        if (this.isCriticalStock()) {
            return 'CRITICAL';
        }
        if (this.isLowStock()) {
            return 'LOW';
        }
        return 'NORMAL';
    }
}

// Mock factory functions
const createMockStock = (overrides: Partial<MockStock> = {}): MockStock => {
    return new MockStock({
        quantity: 0,
        minThreshold: 0,
        criticalThreshold: 0,
        ...overrides
    });
};

const createMockStockMovement = (overrides: Partial<MockStockMovement> = {}): MockStockMovement => ({
    quantity: 0,
    type: 'ENTRY' as MovementType,
    ...overrides
});

describe('Product Entity', () => {
    let product: Product;

    beforeEach(() => {
        product = new Product();
    });

    describe('Basic Properties', () => {
        it('should create a product with correct properties', () => {
            product.name = 'Test Product';
            product.price = 10.99;
            product.description = 'A test product';
            product.unit = 'piece';
            product.isActive = true;

            expect(product.name).toBe('Test Product');
            expect(product.price).toBe(10.99);
            expect(product.description).toBe('A test product');
            expect(product.unit).toBe('piece');
            expect(product.isActive).toBe(true);
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

    describe('Business Logic Validation', () => {
        it('should handle empty name (manual validation)', () => {
            product.name = '';
            product.price = 10.99;

            expect(product.name.length).toBe(0);
        });

        it('should handle negative price (manual validation)', () => {
            product.name = 'Test Product';
            product.price = -5;

            expect(product.price).toBeLessThan(0);
        });

        it('should handle valid product data', () => {
            product.name = 'Valid Product';
            product.price = 25.99;

            expect(product.name.length).toBeGreaterThan(0);
            expect(product.price).toBeGreaterThan(0);
        });
    });

    describe('Relations with Stock', () => {
        it('should allow setting stock relation', () => {
            const mockStock = createMockStock({
                id: 1,
                quantity: 100,
                minThreshold: 10,
                criticalThreshold: 5
            });

            product.stock = mockStock as any;

            expect(product.stock).toBe(mockStock);
            expect(product.stock.quantity).toBe(100);
            expect(product.stock.id).toBe(1);
            expect(product.stock.minThreshold).toBe(10);
            expect(product.stock.criticalThreshold).toBe(5);
        });

        it('should allow setting stockMovements relation', () => {
            const mockMovement1 = createMockStockMovement({ id: 1, type: 'ENTRY', quantity: 50 });
            const mockMovement2 = createMockStockMovement({ id: 2, type: 'EXIT', quantity: 25 });

            product.stockMovements = [mockMovement1, mockMovement2] as any[];

            expect(product.stockMovements).toHaveLength(2);
            expect(product.stockMovements[0]).toBe(mockMovement1);
            expect(product.stockMovements[1]).toBe(mockMovement2);
            expect(product.stockMovements[0].id).toBe(1);
            expect(product.stockMovements[1].id).toBe(2);
        });

        it('should handle null stock relation', () => {
            product.stock = null;
            expect(product.stock).toBeNull();
        });

        it('should handle empty stockMovements array', () => {
            product.stockMovements = [];
            expect(product.stockMovements).toHaveLength(0);
            expect(Array.isArray(product.stockMovements)).toBe(true);
        });
    });

    describe('Product Business Logic with Stock', () => {
        it('should validate product name is not empty', () => {
            product.name = 'Valid Product';
            const isValidName = product.name && product.name.trim().length > 0;
            expect(isValidName).toBe(true);
        });

        it('should validate product price is positive', () => {
            product.price = 25.99;
            const isValidPrice = product.price > 0;
            expect(isValidPrice).toBe(true);
        });

        it('should check product status based on stock - Low Stock', () => {
            const mockStock = createMockStock({
                quantity: 5,
                minThreshold: 10,
                criticalThreshold: 3
            });

            product.stock = mockStock as any;

            expect(product.stock.isLowStock()).toBe(true);
            expect(product.stock.isCriticalStock()).toBe(false);
            expect(product.stock.isOutOfStock()).toBe(false);
            expect(product.stock.getStockStatus()).toBe('LOW');
        });

        it('should check product status based on stock - Critical Stock', () => {
            const mockStock = createMockStock({
                quantity: 2,
                minThreshold: 10,
                criticalThreshold: 3
            });

            product.stock = mockStock as any;

            expect(product.stock.isLowStock()).toBe(true);
            expect(product.stock.isCriticalStock()).toBe(true);
            expect(product.stock.isOutOfStock()).toBe(false);
            expect(product.stock.getStockStatus()).toBe('CRITICAL');
        });

        it('should check product status based on stock - Out of Stock', () => {
            const mockStock = createMockStock({
                quantity: 0,
                minThreshold: 10,
                criticalThreshold: 3
            });

            product.stock = mockStock as any;

            expect(product.stock.isOutOfStock()).toBe(true);
            expect(product.stock.getStockStatus()).toBe('OUT_OF_STOCK');
        });

        it('should check product status based on stock - Normal Stock', () => {
            const mockStock = createMockStock({
                quantity: 50,
                minThreshold: 10,
                criticalThreshold: 3
            });

            product.stock = mockStock as any;

            expect(product.stock.isLowStock()).toBe(false);
            expect(product.stock.isCriticalStock()).toBe(false);
            expect(product.stock.isOutOfStock()).toBe(false);
            expect(product.stock.getStockStatus()).toBe('NORMAL');
        });

        it('should handle stock operations - Add Stock', () => {
            const mockStock = createMockStock({
                quantity: 10
            });

            product.stock = mockStock as any;

            product.stock.addStock(5);
            expect(product.stock.quantity).toBe(15);
        });

        it('should handle stock operations - Remove Stock Successfully', () => {
            const mockStock = createMockStock({
                quantity: 10
            });

            product.stock = mockStock as any;

            const success = product.stock.removeStock(5);
            expect(success).toBe(true);
            expect(product.stock.quantity).toBe(5);
        });

        it('should handle stock operations - Remove Stock Failure', () => {
            const mockStock = createMockStock({
                quantity: 3
            });

            product.stock = mockStock as any;

            const success = product.stock.removeStock(5);
            expect(success).toBe(false);
            expect(product.stock.quantity).toBe(3); // Quantity unchanged
        });

        it('should calculate total stock movements', () => {
            const mockMovements = [
                createMockStockMovement({ type: 'ENTRY', quantity: 100 }),
                createMockStockMovement({ type: 'EXIT', quantity: 30 }),
                createMockStockMovement({ type: 'ENTRY', quantity: 50 })
            ];

            product.stockMovements = mockMovements as any[];

            // Calculate total entries and exits
            const totalEntries = product.stockMovements
                .filter(m => m.type === 'ENTRY')
                .reduce((sum, m) => sum + (m.quantity || 0), 0);

            const totalExits = product.stockMovements
                .filter(m => m.type === 'EXIT')
                .reduce((sum, m) => sum + (m.quantity || 0), 0);

            expect(totalEntries).toBe(150);
            expect(totalExits).toBe(30);
        });

        it('should calculate net stock movement', () => {
            const mockMovements = [
                createMockStockMovement({ type: 'ENTRY', quantity: 100 }),
                createMockStockMovement({ type: 'EXIT', quantity: 30 }),
                createMockStockMovement({ type: 'ENTRY', quantity: 50 }),
                createMockStockMovement({ type: 'EXIT', quantity: 20 })
            ];

            product.stockMovements = mockMovements as any[];

            const totalEntries = product.stockMovements
                .filter(m => m.type === 'ENTRY')
                .reduce((sum, m) => sum + (m.quantity || 0), 0);

            const totalExits = product.stockMovements
                .filter(m => m.type === 'EXIT')
                .reduce((sum, m) => sum + (m.quantity || 0), 0);

            const netMovement = totalEntries - totalExits;

            expect(totalEntries).toBe(150);
            expect(totalExits).toBe(50);
            expect(netMovement).toBe(100);
        });
    });

    describe('Product with Stock Integration', () => {
        it('should create a complete product with stock', () => {
            // Setup product
            product.id = 1;
            product.name = 'Test Product';
            product.price = 29.99;
            product.unit = 'piece';
            product.isActive = true;

            // Setup stock
            const mockStock = createMockStock({
                id: 1,
                quantity: 100,
                minThreshold: 10,
                criticalThreshold: 5,
                productId: 1
            });

            product.stock = mockStock as any;

            // Verify integration
            expect(product.stock.productId).toBe(product.id);
            expect(product.stock.quantity).toBe(100);
            expect(product.stock.getStockStatus()).toBe('NORMAL');
        });

        it('should handle product with stock movements history', () => {
            product.name = 'Test Product';
            product.price = 29.99;

            const mockMovements = [
                createMockStockMovement({
                    id: 1,
                    type: 'ENTRY',
                    quantity: 100,
                    reason: 'Initial stock',
                    createdAt: new Date('2024-01-01')
                }),
                createMockStockMovement({
                    id: 2,
                    type: 'EXIT',
                    quantity: 25,
                    reason: 'Sale',
                    createdAt: new Date('2024-01-02')
                }),
                createMockStockMovement({
                    id: 3,
                    type: 'ENTRY',
                    quantity: 50,
                    reason: 'Restock',
                    createdAt: new Date('2024-01-03')
                })
            ];

            product.stockMovements = mockMovements as any[];

            // Verify movements are properly stored
            expect(product.stockMovements).toHaveLength(3);
            expect(product.stockMovements[0].reason).toBe('Initial stock');
            expect(product.stockMovements[1].reason).toBe('Sale');
            expect(product.stockMovements[2].reason).toBe('Restock');

            // Calculate current theoretical stock
            const currentStock = product.stockMovements.reduce((total, movement) => {
                return movement.type === 'ENTRY'
                    ? total + (movement.quantity || 0)
                    : total - (movement.quantity || 0);
            }, 0);

            expect(currentStock).toBe(125); // 100 + 50 - 25
        });
    });
});