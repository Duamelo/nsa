import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '../entity/User';

export class UserController {
  public static listAll = async (req: Request, res: Response) => {
    // Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find();

    // Send the users object
    res.send(users);
  };

  public static getOneById = async (req: Request, res: Response) => {
    // Get the ID from the url
    const id: number = req.params.id ? parseInt(req.params.id, 10) : NaN;

    // Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'username', 'role'], // We dont want to send the password on response
      });
      res.status(200).send(user);
    } catch {
      res.status(404).send('User not found');
    }
  };

  public static newUser = async (req: Request, res: Response) => {
    // Get parameters from the body
    const { username, password, role } = req.body;
    const user = new User();
    user.username = username;
    user.password = password;
    if (role !== 'NORMAL' && role !== 'ADMIN') {
      res.status(400).send('Provide role is unknown.');
      return;
    }
    user.role = role;

    // Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Hash the password, to securely store on DB
    user.hashPassword();

    // Try to save. If fails, the username is already in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch {
      res.status(409).send('username already in use');
      return;
    }

    // If all ok, send 201 response
    res.status(201).send('User created');
  };

  public static editUser = async (req: Request, res: Response) => {
    // Get the ID from the url
    const id: number = req.params.id ? parseInt(req.params.id, 10) : NaN;

    // Get values from the body
    const { username, role } = req.body;

    // Try to find user on database
    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ where: { id } });
    } catch {
      // If not found, send a 404 response
      res.status(404).send('User not found');
      return;
    }

    // Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Try to safe, if fails, that means username already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send('username already in use');
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  public static deleteUser = async (req: Request, res: Response) => {
    // Get the ID from the url
    const id: number = req.params.id ? parseInt(req.params.id, 10) : NaN;

    const userRepository = getRepository(User);
    try {
      await userRepository.findOneOrFail({ where: { id } });
      await userRepository.delete(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }

    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}
