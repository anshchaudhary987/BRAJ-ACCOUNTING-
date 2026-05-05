import type { Request, Response } from 'express';
import { StateRepository } from '../repositories/state.repository.js';
import pool from '../config/database.js';

export class StateController {
  static async listStates(req: Request, res: Response): Promise<void> {
    try {
      const states = await StateRepository.findAll(pool);
      res.status(200).json({ success: true, data: states });
    } catch (error) {
      console.error('Error listing states:', error);
      res.status(500).json({ success: false, message: 'Error listing states' });
    }
  }
}
