
// src/entity/Product.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { IsNotEmpty, Length, IsNumber, Min } from 'class-validator';
import { Stock } from './Stock';
import { StockMovement } from './StockMovement';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty()
    @Length(2, 100)
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @IsNumber()
    @Min(0)
    price!: number;

    @Column({ default: 'piece' })
    unit!: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToOne(() => Stock, stock => stock.product)
    stock!: Stock;

    @OneToMany(() => StockMovement, stockMovement => stockMovement.product)
    stockMovements!: StockMovement[];
}
