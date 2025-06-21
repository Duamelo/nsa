import 'reflect-metadata';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

// Définir les mocks avant les imports des modules qui utilisent les décorateurs
jest.mock('typeorm', () => ({
    getRepository: jest.fn(),
    Entity: () => () => { },
    PrimaryGeneratedColumn: () => () => { },
    Column: () => () => { },
    CreateDateColumn: () => () => { },
    UpdateDateColumn: () => () => { },
}));

jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsNotEmpty: () => () => { },
    Length: () => () => { },
}));

jest.mock('class-transformer', () => ({
    Exclude: () => () => { },
}));

jest.mock('jsonwebtoken');
jest.mock('../../src/config/config', () => ({
    jwtSecret: 'test-secret'
}));

// Maintenant importer les modules
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';
import { AuthController } from '../../src/controller/AuthController';
import config from '../../src/config/config';

// Mock User class
const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    role: 'NORMAL',
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    checkIfUnencryptedPasswordIsValid: jest.fn()
};

// Mock User constructor
jest.mock('../../src/entity/User', () => {
    return {
        User: jest.fn().mockImplementation(() => mockUser)
    };
});

describe('AuthController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockUserRepository: any;

    beforeEach(() => {
        // Reset des mocks
        jest.clearAllMocks();

        // Mock de la réponse Express
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            locals: {}
        };

        // Mock du repository
        mockUserRepository = {
            save: jest.fn(),
            findOneOrFail: jest.fn()
        };

        (getRepository as jest.Mock).mockReturnValue(mockUserRepository);
    });

    describe('register', () => {
        beforeEach(() => {
            mockRequest = {
                body: {
                    username: 'testuser',
                    password: 'testpassword'
                }
            };
        });

        it('devrait retourner une erreur 400 si la validation échoue', async () => {
            // Arrange
            const validationErrors = [{ property: 'username', constraints: { length: 'username must be longer than 4 characters' } }];
            (validate as jest.Mock).mockResolvedValue(validationErrors);

            // Act
            await AuthController.register(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(validate).toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(validationErrors);
        });
    });

    describe('login', () => {
        let mockUserInstance: any;

        beforeEach(() => {
            mockRequest = {
                body: {
                    username: 'testuser',
                    password: 'testpassword'
                }
            };

            mockUserInstance = {
                id: 1,
                username: 'testuser',
                password: 'hashedpassword',
                role: 'NORMAL',
                createdAt: new Date(),
                updatedAt: new Date(),
                hashPassword: jest.fn(),
                checkIfUnencryptedPasswordIsValid: jest.fn()
            };
        });

        it('devrait connecter un utilisateur avec succès', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            (mockUserInstance.checkIfUnencryptedPasswordIsValid as jest.Mock).mockReturnValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
                where: { username: 'testuser' }
            });
            expect(mockUserInstance.checkIfUnencryptedPasswordIsValid).toHaveBeenCalledWith('testpassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, username: 'testuser' },
                config.jwtSecret,
                { expiresIn: '1h' }
            );
            expect(mockResponse.send).toHaveBeenCalledWith({ token: 'mock-token' });
        });

        it('devrait retourner une erreur 400 si le body est vide', async () => {
            // Arrange
            mockRequest.body = {};

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith('Body was empty');
        });

        it('devrait retourner une erreur 401 si l\'utilisateur n\'existe pas', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockRejectedValue(new Error('User not found'));

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith('username or password incorrect');
        });

        it('devrait retourner une erreur 401 si le mot de passe est incorrect', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            (mockUserInstance.checkIfUnencryptedPasswordIsValid as jest.Mock).mockReturnValue(false);

            // Act
            await AuthController.login(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith('username or password incorrect');
        });
    });

    describe('getMe', () => {
        let mockUserInstance: any;

        beforeEach(() => {
            mockRequest = {};
            mockResponse.locals = {
                jwtPayload: { userId: 1 }
            };

            mockUserInstance = {
                id: 1,
                username: 'testuser',
                role: 'NORMAL'
            };
        });

        it('devrait retourner les informations de l\'utilisateur', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);

            // Act
            await AuthController.getMe(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
                select: ['id', 'username', 'role'],
                where: { id: 1 }
            });
            expect(mockResponse.send).toHaveBeenCalledWith({ user: mockUserInstance });
        });

        it('devrait retourner une erreur 404 si l\'utilisateur n\'existe pas', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockRejectedValue(new Error('User not found'));

            // Act
            await AuthController.getMe(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith('User not found');
        });
    });

    describe('changePassword', () => {
        let mockUserInstance: any;

        beforeEach(() => {
            mockRequest = {
                body: {
                    oldPassword: 'oldpassword',
                    newPassword: 'newpassword'
                }
            };

            mockResponse.locals = {
                jwtPayload: { userId: 1 }
            };

            mockUserInstance = {
                id: 1,
                username: 'testuser',
                password: 'hashedoldpassword',
                role: 'NORMAL',
                hashPassword: jest.fn(),
                checkIfUnencryptedPasswordIsValid: jest.fn()
            };
        });

        it('devrait changer le mot de passe avec succès', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            (mockUserInstance.checkIfUnencryptedPasswordIsValid as jest.Mock).mockReturnValue(true);
            (validate as jest.Mock).mockResolvedValue([]);
            mockUserRepository.save.mockResolvedValue({});

            // Act
            await AuthController.changePassword(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith(1);
            expect(mockUserInstance.checkIfUnencryptedPasswordIsValid).toHaveBeenCalledWith('oldpassword');
            expect(validate).toHaveBeenCalledWith(mockUserInstance);
            expect(mockUserInstance.hashPassword).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserInstance);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('devrait retourner une erreur 401 si l\'utilisateur n\'existe pas', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockRejectedValue(new Error('User not found'));

            // Act
            await AuthController.changePassword(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('devrait retourner une erreur 401 si l\'ancien mot de passe est incorrect', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            (mockUserInstance.checkIfUnencryptedPasswordIsValid as jest.Mock).mockReturnValue(false);

            // Act
            await AuthController.changePassword(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('devrait retourner une erreur 400 si la validation du nouveau mot de passe échoue', async () => {
            // Arrange
            const validationErrors = [{ property: 'password', constraints: { length: 'password must be longer than 4 characters' } }];
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            (mockUserInstance.checkIfUnencryptedPasswordIsValid as jest.Mock).mockReturnValue(true);
            (validate as jest.Mock).mockResolvedValue(validationErrors);

            // Act
            await AuthController.changePassword(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(validationErrors);
        });
    });
});