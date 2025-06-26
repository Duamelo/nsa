
// src/entity/Stock.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';

export type StockStatus = 'OUT_OF_STOCK' | 'CRITICAL' | 'LOW' | 'NORMAL';

@Entity()
export class Stock {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', default: 0 })
    quantity!: number;

    @Column({ type: 'int', default: 0 })
    minThreshold!: number;

    @Column({ type: 'int', default: 0 })
    criticalThreshold!: number;

    @Column()
    productId!: number;

    @OneToOne(() => Product, product => product.stock)
    @JoinColumn()
    product!: Product;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Business logic methods
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

    getStockStatus(): StockStatus {
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
