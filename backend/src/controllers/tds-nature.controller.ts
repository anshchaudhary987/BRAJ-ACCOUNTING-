import type { Request, Response } from 'express';
import { TdsNatureRepository } from '../repositories/tds-nature.repository.js';
import pool from '../config/database.js';

export class TDSNatureController {
  static async listTdsNatures(req: Request, res: Response): Promise<void> {
    try {
      const tdsNatures = await TdsNatureRepository.findAll(pool);
      res.status(200).json({ success: true, data: tdsNatures });
    } catch (error) {
      console.error('Error fetching TDS Natures:', error);
      res.status(500).json({ success: false, message: 'Error fetching TDS Natures' });
    }
  }
}

