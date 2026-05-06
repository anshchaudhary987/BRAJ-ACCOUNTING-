import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { UserRepository } from '../repositories/user.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'braj-accounting-ultra-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  static async signup(req: Request, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    try {
      const existingUser = await UserRepository.findByEmail(pool, email);
      if (existingUser) {
        return res.status(400).json({ error: 'Account already exists with this email' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserRepository.createUserWithPassword(pool, name, email, passwordHash);
      if (!user) {
        return res.status(500).json({ error: 'Failed to create user record in database' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, isActive: user.isActive },
        token
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ 
        error: 'Registration failed due to server error', 
        details: err.message 
      });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await UserRepository.findByEmail(pool, email);
      if (!user) {
        return res.status(401).json({ error: 'No account found with this email' });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ error: 'Account not set up for password login' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      res.json({
        user: { id: user.id, name: user.name, email: user.email, isActive: user.isActive },
        token
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ 
        error: 'Login failed due to server error', 
        details: err.message 
      });
    }
  }

  static async me(req: any, res: Response) {
    try {
      const user = await UserRepository.findById(pool, req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const companies = await UserRepository.listUserCompanies(pool, user.id);
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          companies
        }
      });
    } catch (err) {
      console.error('Me error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
