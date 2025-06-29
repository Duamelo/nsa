import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '../entity/User';

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get the user ID from previous midleware
    const id = res.locals.jwtPayload.userId;

    // Get user role from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOne({
        where: { id: id },
      });;
    } catch {
      res.status(401).send();
      return;
    }

    // Check if array of authorized roles includes the user's role
    if (roles.indexOf(user.role) > -1) {
      next();
    } else {
      res.status(401).send();
    }
  };
};
