import type { Request, Response } from 'express';
import pool from '../config/database.js';
import { UserRepository } from '../repositories/user.repository.js';

export const listCompanyUsers = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const users = await UserRepository.listByCompany(pool, companyId);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listRoles = async (req: Request, res: Response) => {
  try {
    const roles = await UserRepository.listRoles(pool);
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { name, email, roleId } = req.body;

    // Check if user exists
    let user = await UserRepository.findByEmail(pool, email);
    if (!user) {
      user = await UserRepository.createUser(pool, name, email);
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to create or find user' });
    }

    await UserRepository.addUserToCompany(pool, user.id, companyId, roleId);
    res.json({ message: 'User added to company', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const userId = req.params.userId as string;
    await UserRepository.removeUserFromCompany(pool, userId, companyId);
    res.json({ message: 'User removed from company' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
