// src/entity/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { IsNotEmpty, Length } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { StockMovement } from './StockMovement';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(3, 50)
  username!: string;

  @Column()
  @IsNotEmpty()
  @Length(6, 255)
  password!: string;

  @Column({ default: 'user' })
  role!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => StockMovement, stockMovement => stockMovement.user)
  stockMovements!: StockMovement[];

  /**
   * Hache le mot de passe avec bcrypt
   */
  hashPassword() {
    const saltRounds = 10;
    this.password = bcrypt.hashSync(this.password, saltRounds);
  }

  /**
   * Vérifie si le mot de passe est correct
   */
  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordBeforeSave() {
    // Ne rehash pas un mot de passe déjà hashé
    if (!this.password.startsWith('$2b$')) {
      this.hashPassword();
    }
  }
}
