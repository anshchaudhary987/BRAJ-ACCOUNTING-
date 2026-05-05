import type { Request, Response } from 'express';
import { CompanyRepository } from '../repositories/company.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import pool from '../config/database.js';

/**
 * Controller for company-related operations.
 */
export class CompanyController {
  /**
   * Create a new company.
   */
  static async create(req: any, res: Response): Promise<void> {
    try {
      const { 
        name, stateId, gstin, pan, tan, 
        gstRegistrationType, financialYearStart, booksBeginningDate 
      } = req.body;

      const userId = req.userId;

      if (!name || !stateId || !gstin || !pan || !financialYearStart || !booksBeginningDate) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const company = await CompanyRepository.create(pool, {
        name,
        stateId,
        gstin,
        pan,
        tan,
        gstRegistrationType: gstRegistrationType || 'Regular',
        financialYearStart,
        booksBeginningDate
      });

      // Link current user as Admin
      const adminRole = await UserRepository.findRoleByName(pool, 'Admin');
      if (adminRole && userId) {
        await UserRepository.addUserToCompany(pool, userId, company.id, adminRole.id);
      }

      res.status(201).json({ success: true, data: company });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ success: false, message: 'Error creating company' });
    }
  }

  /**
   * Get all companies for current user.
   */
  static async list(req: any, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const companies = await CompanyRepository.findByUser(pool, userId);
      res.status(200).json({ success: true, data: companies });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ success: false, message: 'Error fetching companies' });
    }
  }

  /**
   * Get a company by ID.
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await CompanyRepository.findById(pool, id as string);
      if (!company) {
        res.status(404).json({ success: false, message: 'Company not found' });
        return;
      }

      res.status(200).json({ success: true, data: company });
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ success: false, message: 'Error fetching company' });
    }
  }

  /**
   * Update a company by ID.
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const company = await CompanyRepository.update(pool, id as string, updateData);
      res.status(200).json({ success: true, data: company });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ success: false, message: 'Error updating company' });
    }
  }
}