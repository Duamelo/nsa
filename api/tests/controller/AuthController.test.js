"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const jwt = __importStar(require("jsonwebtoken"));
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
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const AuthController_1 = require("../../src/controller/AuthController");
const config_1 = __importDefault(require("../../src/config/config"));
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
    let mockRequest;
    let mockResponse;
    let mockUserRepository;
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
        typeorm_1.getRepository.mockReturnValue(mockUserRepository);
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
            class_validator_1.validate.mockResolvedValue(validationErrors);
            // Act
            await AuthController_1.AuthController.register(mockRequest, mockResponse);
            // Assert
            expect(class_validator_1.validate).toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(validationErrors);
        });
    });
    describe('login', () => {
        let mockUserInstance;
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
            mockUserInstance.checkIfUnencryptedPasswordIsValid.mockReturnValue(true);
            jwt.sign.mockReturnValue('mock-token');
            // Act
            await AuthController_1.AuthController.login(mockRequest, mockResponse);
            // Assert
            expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
                where: { username: 'testuser' }
            });
            expect(mockUserInstance.checkIfUnencryptedPasswordIsValid).toHaveBeenCalledWith('testpassword');
            expect(jwt.sign).toHaveBeenCalledWith({ userId: 1, username: 'testuser' }, config_1.default.jwtSecret, { expiresIn: '1h' });
            expect(mockResponse.send).toHaveBeenCalledWith({ token: 'mock-token' });
        });
        it('devrait retourner une erreur 400 si le body est vide', async () => {
            // Arrange
            mockRequest.body = {};
            // Act
            await AuthController_1.AuthController.login(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith('Body was empty');
        });
        it('devrait retourner une erreur 401 si l\'utilisateur n\'existe pas', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockRejectedValue(new Error('User not found'));
            // Act
            await AuthController_1.AuthController.login(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith('username or password incorrect');
        });
        it('devrait retourner une erreur 401 si le mot de passe est incorrect', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            mockUserInstance.checkIfUnencryptedPasswordIsValid.mockReturnValue(false);
            // Act
            await AuthController_1.AuthController.login(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith('username or password incorrect');
        });
    });
    describe('getMe', () => {
        let mockUserInstance;
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
            await AuthController_1.AuthController.getMe(mockRequest, mockResponse);
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
            await AuthController_1.AuthController.getMe(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith('User not found');
        });
    });
    describe('changePassword', () => {
        let mockUserInstance;
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
            mockUserInstance.checkIfUnencryptedPasswordIsValid.mockReturnValue(true);
            class_validator_1.validate.mockResolvedValue([]);
            mockUserRepository.save.mockResolvedValue({});
            // Act
            await AuthController_1.AuthController.changePassword(mockRequest, mockResponse);
            // Assert
            expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith(1);
            expect(mockUserInstance.checkIfUnencryptedPasswordIsValid).toHaveBeenCalledWith('oldpassword');
            expect(class_validator_1.validate).toHaveBeenCalledWith(mockUserInstance);
            expect(mockUserInstance.hashPassword).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserInstance);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });
        it('devrait retourner une erreur 401 si l\'utilisateur n\'existe pas', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockRejectedValue(new Error('User not found'));
            // Act
            await AuthController_1.AuthController.changePassword(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalled();
        });
        it('devrait retourner une erreur 401 si l\'ancien mot de passe est incorrect', async () => {
            // Arrange
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            mockUserInstance.checkIfUnencryptedPasswordIsValid.mockReturnValue(false);
            // Act
            await AuthController_1.AuthController.changePassword(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalled();
        });
        it('devrait retourner une erreur 400 si la validation du nouveau mot de passe échoue', async () => {
            // Arrange
            const validationErrors = [{ property: 'password', constraints: { length: 'password must be longer than 4 characters' } }];
            mockUserRepository.findOneOrFail.mockResolvedValue(mockUserInstance);
            mockUserInstance.checkIfUnencryptedPasswordIsValid.mockReturnValue(true);
            class_validator_1.validate.mockResolvedValue(validationErrors);
            // Act
            await AuthController_1.AuthController.changePassword(mockRequest, mockResponse);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(validationErrors);
        });
    });
});
