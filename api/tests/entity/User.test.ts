import 'reflect-metadata';

// Approach alternative : mocker le module avant tout import
jest.mock('bcryptjs');

// Mock TypeORM decorators - Include ALL decorators used in your entities
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
    OneToOne: () => () => { },      // Added this - used in Stock entity
    JoinColumn: () => () => { },
    Unique: () => () => { },
    Index: () => () => { },
    BeforeInsert: () => () => { },
    BeforeUpdate: () => () => { },
    AfterLoad: () => () => { },
    BeforeRemove: () => () => { },  // Optional, commonly used
    AfterInsert: () => () => { },   // Optional, commonly used
    AfterUpdate: () => () => { },   // Optional, commonly used
    AfterRemove: () => () => { },   // Optional, commonly used
}));

// Mock class-validator - Include ALL validators used in your entities
jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsNotEmpty: () => () => { },
    Length: () => () => { },
    IsEmail: () => () => { },
    IsOptional: () => () => { },
    IsNumber: () => () => { },  // Added this
    Min: () => () => { },       // Added this
    Max: () => () => { },       // Optional, in case you use it
    IsIn: () => () => { },      // Added this (used in StockMovement)
    IsString: () => () => { },  // Optional, commonly used
    IsBoolean: () => () => { }, // Optional, commonly used
}));

// Mock class-transformer
jest.mock('class-transformer', () => ({
    Exclude: () => () => { },
    plainToClass: jest.fn(),
    classToPlain: jest.fn(),
}));

// Mock bcrypt directly since you're using bcrypt (not bcryptjs)
jest.mock('bcrypt', () => ({
    hashSync: jest.fn(),
    compareSync: jest.fn(),
}));

// Importer après les mocks
import { User } from '../../src/entity/User';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';

describe('User Entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        jest.clearAllMocks();

        // Configuration des valeurs de retour des mocks
        (bcrypt.hashSync as jest.Mock).mockImplementation((password: string) => `hashed_${password}`);
        (bcrypt.compareSync as jest.Mock).mockImplementation((plain: string, hashed: string) => hashed === `hashed_${plain}`);
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

    describe('Password Methods', () => {
        beforeEach(() => {
            user.username = 'testuser';
            user.password = 'plainpassword';
        });

        it('should hash password', () => {
            // Act
            user.hashPassword();

            // Assert
            expect(bcrypt.hashSync).toHaveBeenCalledWith('plainpassword', 10);
            expect(user.password).toBe('hashed_plainpassword');
        });

        it('should validate correct password', () => {
            // Arrange
            user.password = 'hashed_plainpassword';

            // Act
            const isValid = user.checkIfUnencryptedPasswordIsValid('plainpassword');

            // Assert
            expect(bcrypt.compareSync).toHaveBeenCalledWith('plainpassword', 'hashed_plainpassword');
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', () => {
            // Arrange
            user.password = 'hashed_plainpassword';

            // Act
            const isValid = user.checkIfUnencryptedPasswordIsValid('wrongpassword');

            // Assert
            expect(bcrypt.compareSync).toHaveBeenCalledWith('wrongpassword', 'hashed_plainpassword');
            expect(isValid).toBe(false);
        });

        it('should not rehash already hashed password', async () => {
            // Arrange
            user.password = '$2b$10$hashedpassword';

            // Act
            await user.hashPasswordBeforeSave();

            // Assert
            expect(bcrypt.hashSync).not.toHaveBeenCalled();
            expect(user.password).toBe('$2b$10$hashedpassword');
        });

        it('should hash new password before save', async () => {
            // Arrange
            user.password = 'newplainpassword';

            // Act
            await user.hashPasswordBeforeSave();

            // Assert
            expect(bcrypt.hashSync).toHaveBeenCalledWith('newplainpassword', 10);
            expect(user.password).toBe('hashed_newplainpassword');
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
                { property: 'username', constraints: { length: 'username must be longer than 3 characters' } },
                { property: 'password', constraints: { length: 'password must be longer than 6 characters' } }
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