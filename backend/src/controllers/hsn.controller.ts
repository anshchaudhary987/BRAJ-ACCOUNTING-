import type { Request, Response } from 'express';
import { HsnRepository } from '../repositories/hsn.repository.js';
import pool from '../config/database.js';

export class HSNController {
  static async listHsnCodes(req: Request, res: Response): Promise<void> {
    try {
      const hsnCodes = await HsnRepository.findAll(pool);
      res.status(200).json({ success: true, data: hsnCodes });
    } catch (error) {
      console.error('Error listing HSN codes:', error);
      res.status(500).json({ success: false, message: 'Error listing HSN codes' });
    }
  }
}
