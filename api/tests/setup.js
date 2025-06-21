"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
// Polyfill pour les décorateurs en environnement de test
if (!Reflect.hasOwnMetadata) {
    require('reflect-metadata');
}
// Mock global pour TypeORM en mode test
jest.mock('typeorm', () => ({
    getRepository: jest.fn(),
    createConnection: jest.fn(),
    Entity: () => () => { },
    PrimaryGeneratedColumn: () => () => { },
    Column: () => () => { },
    CreateDateColumn: () => () => { },
    UpdateDateColumn: () => () => { },
    OneToMany: () => () => { },
    ManyToOne: () => () => { },
    JoinColumn: () => () => { },
}));
// Mock pour class-validator
jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsNotEmpty: () => () => { },
    Length: () => () => { },
    IsEmail: () => () => { },
    IsOptional: () => () => { },
}));
// Mock pour class-transformer
jest.mock('class-transformer', () => ({
    Exclude: () => () => { },
    plainToClass: jest.fn(),
    classToPlain: jest.fn(),
}));
