import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'braj-accounting-ultra-secret-key-change-in-production';

// Permissions needed for different actions
export type Permission = 
  | 'user:manage' 
  | 'ledger:create' | 'ledger:view' | 'ledger:edit'
  | 'voucher:create' | 'voucher:view' | 'voucher:edit'
  | 'inventory:manage' | 'inventory:view'
  | 'report:view';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Admin': [
    'user:manage', 'ledger:create', 'ledger:view', 'ledger:edit',
    'voucher:create', 'voucher:view', 'voucher:edit',
    'inventory:manage', 'inventory:view', 'report:view'
  ],
  'Manager': [
    'ledger:view', 'voucher:create', 'voucher:view', 'voucher:edit',
    'inventory:view', 'report:view'
  ],
  'Accountant': [
    'ledger:create', 'ledger:view', 'voucher:create', 'voucher:view',
    'inventory:view', 'report:view'
  ],
  'Data Entry': [
    'voucher:create'
  ]
};

export class AuthMiddleware {
  static async authenticate(req: any, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  static authorize(permission?: Permission) {
    return async (req: any, res: Response, next: NextFunction) => {
      const userId = req.userId;
      const companyId = req.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!companyId) {
        return res.status(400).json({ error: 'Company context required for authorization' });
      }

      try {
        const roleName = await UserRepository.getUserRoleInCompany(pool, userId, companyId);
        
        if (!roleName) {
          return res.status(403).json({ error: 'User does not have access to this company' });
        }

        const permissions = ROLE_PERMISSIONS[roleName] || [];
        
        if (permission && !permissions.includes(permission)) {
          return res.status(403).json({ error: `Permission denied: ${permission} required` });
        }

        // Attach user role info to request
        req.user = { id: userId, role: roleName, permissions };
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error during authorization' });
      }
    };
  }
}

// Keep the old authorize function name for backward compatibility if needed, 
// but wrapped in the new class-based structure
export const authorize = AuthMiddleware.authorize;
