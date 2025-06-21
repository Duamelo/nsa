
// StockMovement.test.ts
import { validate } from 'class-validator';
import { StockMovement, MovementType } from '../../src/entity/StockMovement';
import { Product } from '../../src/entity/Product';
import { User } from '../../src/entity/User';

describe('StockMovement Entity', () => {
    let stockMovement: StockMovement;
    let product: Product;
    let user: User;

    beforeEach(() => {
        stockMovement = new StockMovement();
        product = new Product();
        user = new User();

        product.id = 1;
        product.name = 'Test Product';
        user.id = 1;
        user.username = 'Test User';
    });

    describe('Validation', () => {
        it('should validate a valid stock movement', async () => {
            stockMovement.type = MovementType.ENTRY;
            stockMovement.quantity = 10;
            stockMovement.previousQuantity = 5;
            stockMovement.newQuantity = 15;
            stockMovement.product = product;
            stockMovement.productId = 1;
            stockMovement.user = user;
            stockMovement.userId = 1;

            const errors = await validate(stockMovement);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when type is empty', async () => {
            stockMovement.type = '' as any;
            stockMovement.quantity = 10;

            const errors = await validate(stockMovement);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('type');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when type is invalid', async () => {
            stockMovement.type = 'INVALID_TYPE' as any;
            stockMovement.quantity = 10;

            const errors = await validate(stockMovement);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('type');
            expect(errors[0].constraints).toHaveProperty('isIn');
        });

        it('should validate all valid movement types', async () => {
            const validTypes = [MovementType.ENTRY, MovementType.EXIT, MovementType.ADJUSTMENT];

            for (const type of validTypes) {
                stockMovement.type = type;
                stockMovement.quantity = 10;

                const errors = await validate(stockMovement);
                const typeErrors = errors.filter(error => error.property === 'type');
                expect(typeErrors).toHaveLength(0);
            }
        });

        it('should fail validation when quantity is zero', async () => {
            stockMovement.type = MovementType.ENTRY;
            stockMovement.quantity = 0;

            const errors = await validate(stockMovement);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('quantity');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when quantity is negative', async () => {
            stockMovement.type = MovementType.ENTRY;
            stockMovement.quantity = -5;

            const errors = await validate(stockMovement);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('quantity');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when quantity is not a number', async () => {
            stockMovement.type = MovementType.ENTRY;
            stockMovement.quantity = 'not a number' as any;

            const errors = await validate(stockMovement);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('quantity');
            expect(errors[0].constraints).toHaveProperty('isNumber');
        });
    });

    describe('Properties', () => {
        it('should allow setting all properties', () => {
            const now = new Date();

            stockMovement.id = 1;
            stockMovement.type = MovementType.ENTRY;
            stockMovement.quantity = 25;
            stockMovement.previousQuantity = 10;
            stockMovement.newQuantity = 35;
            stockMovement.reason = 'Purchase order';
            stockMovement.reference = 'PO-2024-001';
            stockMovement.product = product;
            stockMovement.productId = 1;
            stockMovement.user = user;
            stockMovement.userId = 1;
            stockMovement.createdAt = now;

            expect(stockMovement.id).toBe(1);
            expect(stockMovement.type).toBe(MovementType.ENTRY);
            expect(stockMovement.quantity).toBe(25);
            expect(stockMovement.previousQuantity).toBe(10);
            expect(stockMovement.newQuantity).toBe(35);
            expect(stockMovement.reason).toBe('Purchase order');
            expect(stockMovement.reference).toBe('PO-2024-001');
            expect(stockMovement.product).toBe(product);
            expect(stockMovement.productId).toBe(1);
            expect(stockMovement.user).toBe(user);
            expect(stockMovement.userId).toBe(1);
            expect(stockMovement.createdAt).toBe(now);
        });

        it('should allow nullable properties to be null', () => {
            stockMovement.reason = null;
            stockMovement.reference = null;

            expect(stockMovement.reason).toBeNull();
            expect(stockMovement.reference).toBeNull();
        });
    });

    describe('Movement Types', () => {
        it('should have correct MovementType enum values', () => {
            expect(MovementType.ENTRY).toBe('ENTRY');
            expect(MovementType.EXIT).toBe('EXIT');
            expect(MovementType.ADJUSTMENT).toBe('ADJUSTMENT');
        });

        it('should accept ENTRY movement type', () => {
            stockMovement.type = MovementType.ENTRY;
            expect(stockMovement.type).toBe('ENTRY');
        });

        it('should accept EXIT movement type', () => {
            stockMovement.type = MovementType.EXIT;
            expect(stockMovement.type).toBe('EXIT');
        });

        it('should accept ADJUSTMENT movement type', () => {
            stockMovement.type = MovementType.ADJUSTMENT;
            expect(stockMovement.type).toBe('ADJUSTMENT');
        });
    });

    describe('Relations', () => {
        it('should allow setting product relation', () => {
            stockMovement.product = product;
            stockMovement.productId = product.id;

            expect(stockMovement.product).toBe(product);
            expect(stockMovement.productId).toBe(product.id);
        });

        it('should allow setting user relation', () => {
            stockMovement.user = user;
            stockMovement.userId = user.id;

            expect(stockMovement.user).toBe(user);
            expect(stockMovement.userId).toBe(user.id);
        });
    });

    describe('Business Logic Scenarios', () => {
        it('should handle entry movement correctly', () => {
            stockMovement.type = MovementType.ENTRY;
            stockMovement.quantity = 20;
            stockMovement.previousQuantity = 10;
            stockMovement.newQuantity = 30;
            stockMovement.reason = 'Restocking';

            expect(stockMovement.newQuantity).toBe(stockMovement.previousQuantity + stockMovement.quantity);
        });

        it('should handle exit movement correctly', () => {
            stockMovement.type = MovementType.EXIT;
            stockMovement.quantity = 5;
            stockMovement.previousQuantity = 20;
            stockMovement.newQuantity = 15;
            stockMovement.reason = 'Sale';

            expect(stockMovement.newQuantity).toBe(stockMovement.previousQuantity - stockMovement.quantity);
        });

        it('should handle adjustment movement correctly', () => {
            stockMovement.type = MovementType.ADJUSTMENT;
            stockMovement.quantity = 3;
            stockMovement.previousQuantity = 20;
            stockMovement.newQuantity = 17; // Could be any value based on adjustment
            stockMovement.reason = 'Inventory correction';

            expect(stockMovement.type).toBe(MovementType.ADJUSTMENT);
            expect(stockMovement.reason).toBe('Inventory correction');
        });
    });
});
