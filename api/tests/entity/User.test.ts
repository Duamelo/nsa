import 'reflect-metadata';

// Approach alternative : mocker le module avant tout import
jest.mock('bcryptjs');

// Mock TypeORM decorators
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
    Unique: () => () => { },
    Index: () => () => { },
    BeforeInsert: () => () => { },
    BeforeUpdate: () => () => { },
    AfterLoad: () => () => { },
}));

// Mock class-validator
jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsNotEmpty: () => () => { },
    Length: () => () => { },
    IsEmail: () => () => { },
    IsOptional: () => () => { },
}));

// Mock class-transformer
jest.mock('class-transformer', () => ({
    Exclude: () => () => { },
    plainToClass: jest.fn(),
    classToPlain: jest.fn(),
}));

// Importer après les mocks
import { User } from '../../src/entity/User';
import { validate } from 'class-validator';
import * as bcrypt from 'bcryptjs';

// Configuration des mocks après l'import
const mockHashSync = jest.fn();
const mockCompareSync = jest.fn();

describe('User Entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        jest.clearAllMocks();

        // Configuration des valeurs de retour des mocks
        mockHashSync.mockImplementation((password: string) => `hashed_${password}`);
        mockCompareSync.mockImplementation((plain: string, hashed: string) => hashed === `hashed_${plain}`);
    });

    describe('User Creation', () => {
        it('should create a user instance', () => {
            expect(user).toBeInstanceOf(User);
        });

        it('should have default properties', () => {
            expect(user.id).toBeUndefined();
            expect(user.username).toBeUndefined();
            expect(user.password).toBeUndefined();
            expect(user.role).toBeUndefined();
        });

        it('should allow setting properties', () => {
            // Arrange & Act
            user.username = 'testuser';
            user.password = 'testpass';
            user.role = 'NORMAL';

            // Assert
            expect(user.username).toBe('testuser');
            expect(user.password).toBe('testpass');
            expect(user.role).toBe('NORMAL');
        });
    });

    describe('Validation', () => {
        it('should call validate function', async () => {
            // Arrange
            user.username = 'validuser';
            user.password = 'validpassword';
            user.role = 'NORMAL';

            // Mock validate to return empty array (no errors)
            (validate as jest.Mock).mockResolvedValue([]);

            // Act
            const errors = await validate(user);

            // Assert
            expect(validate).toHaveBeenCalledWith(user);
            expect(Array.isArray(errors)).toBe(true);
            expect(errors.length).toBe(0);
        });

        it('should handle validation errors', async () => {
            // Arrange
            user.username = 'ab'; // Too short
            user.password = '123'; // Too short

            const mockErrors = [
                { property: 'username', constraints: { length: 'username must be longer than 4 characters' } },
                { property: 'password', constraints: { length: 'password must be longer than 4 characters' } }
            ];

            (validate as jest.Mock).mockResolvedValue(mockErrors);

            // Act
            const errors = await validate(user);

            // Assert
            expect(validate).toHaveBeenCalledWith(user);
            expect(errors).toEqual(mockErrors);
            expect(errors.length).toBe(2);
        });

        it('should validate user with all required fields', async () => {
            // Arrange
            user.username = 'validuser';
            user.password = 'validpassword';
            user.role = 'ADMIN';

            (validate as jest.Mock).mockResolvedValue([]);

            // Act
            const errors = await validate(user);

            // Assert
            expect(validate).toHaveBeenCalledWith(user);
            expect(errors.length).toBe(0);
        });
    });
});