import { Router } from 'express';
import auth from './auth';
import user from './user';
import product from './product';
import stock from './stock';

const routes = Router();

routes.use('/auth', auth);
routes.use('/user', user);
routes.use('/products', product);
routes.use('/stock', stock);

export default routes;
