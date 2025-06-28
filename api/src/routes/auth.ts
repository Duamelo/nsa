import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { validateEmpty } from '../middlewares/checkBody';
import { checkJwt } from '../middlewares/checkJwt';

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion de l'authentification des utilisateurs
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d’un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Enregistrement d’un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Données invalides
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données utilisateur retournées
 *       401:
 *         description: Non autorisé
 */
router.get('/me', [checkJwt], AuthController.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Modifier le mot de passe de l'utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 *       400:
 *         description: Mot de passe actuel incorrect
 *       401:
 *         description: Non autorisé
 */
router.post('/change-password', [checkJwt], AuthController.changePassword);

export default router;