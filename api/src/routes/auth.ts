import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { validateEmpty } from '../middlewares/checkBody';
import { checkJwt } from '../middlewares/checkJwt';

const router = Router();
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', [checkJwt], AuthController.getMe);
router.post('/change-password', [checkJwt], AuthController.changePassword);

export default router;