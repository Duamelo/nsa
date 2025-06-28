import { NextFunction, Request, Response } from 'express';
import basicAuth from 'basic-auth';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Get the jwt token from the head
  if (req.headers.auth === undefined) {
    res.status(400).send('No token provide');
  }

  const token = req.headers.auth as string;
  let jwtPayload;

  // Try to validate the token and get data
  try {
    jwtPayload = jwt.verify(token, config.jwtSecret) as any;
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    // If token is not valid, respond with 401 (unauthorized)
    res.status(401).send("You don't have the rights");
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  const { userId, username, bank } = jwtPayload;
  const newToken = jwt.sign({ userId, username, bank }, config.jwtSecret, {
    expiresIn: '1h',
  });
  console.log('New token generated:', newToken);
  res.setHeader('token', newToken);
  // Call the next middleware or controller
  next();
};

export const swaggerAuth = (req, res, next) => {
  const user = basicAuth(req);
  const isAuthorized =
    user && user.name === process.env.SWAGGER_USER && user.pass === process.env.SWAGGER_PASSWORD;

  if (isAuthorized) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Swagger Docs"');
  return res.status(401).send('Authentication required.');
};