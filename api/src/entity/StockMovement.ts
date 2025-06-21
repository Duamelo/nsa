
// src/entity/StockMovement.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, Min, IsIn } from 'class-validator';
import { Product } from './Product';
import { User } from './User';

export enum MovementType {
    ENTRY = 'ENTRY',
    EXIT = 'EXIT',
    ADJUSTMENT = 'ADJUSTMENT'
}

@Entity()
export class StockMovement {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar' })
    @IsNotEmpty()
    @IsIn([MovementType.ENTRY, MovementType.EXIT, MovementType.ADJUSTMENT])
    type!: MovementType;

    @Column({ type: 'int' })
    @IsNumber()
    @Min(1)
    quantity!: number;

    @Column({ type: 'int' })
    @IsNumber()
    previousQuantity!: number;

    @Column({ type: 'int' })
    @IsNumber()
    newQuantity!: number;

    @Column({ type: 'text', nullable: true })
    reason?: string | null;

    @Column({ nullable: true })
    reference?: string | null;

    @Column()
    productId!: number;

    @ManyToOne(() => Product, product => product.stockMovements)
    @JoinColumn()
    product!: Product;

    @Column()
    userId!: number;

    @ManyToOne(() => User, user => user.stockMovements)
    @JoinColumn()
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;
}