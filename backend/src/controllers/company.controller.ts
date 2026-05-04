import type { Request, Response, NextFunction } from 'express';
import { CompanyRepository } from '../repositories/company.repository.js';
import pool from '../config/database.js';

/**
 * Controller for company-related operations.
 */
export class CompanyController {
  /**
   * Create a new company.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, state, gstin, pan, financialYearStart, booksBeginningDate } = req.body;

      // Validate required fields
      if (!name || !state || !gstin || !pan || !financialYearStart || !booksBeginningDate) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      // Create company using the repository (no companyId needed for creation)
      const company = await CompanyRepository.create(
        pool,
        name,
        state,
        gstin,
        pan,
        financialYearStart,
        booksBeginningDate
      );

      res.status(201).json({ success: true, data: company });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ success: false, message: 'Error creating company' });
    }
  }

  /**
   * Get all companies.
   * @param req - Express request object
   * @param res - Express response object
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const companies = await CompanyRepository.findAll(pool);
      res.status(200).json({ success: true, data: companies });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ success: false, message: 'Error fetching companies' });
    }
  }

  /**
   * Get a company by ID.
   * @param req - Express request object
   * @param res - Express response object
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
   * @param req - Express request object
   * @param res - Express response object
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