import type { Request, Response } from 'express';
import { GroupRepository } from '../repositories/group.repository.js';
import pool from '../config/database.js';

export class GroupController {
  static async listGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await GroupRepository.findAll(pool);
      res.status(200).json({ success: true, data: groups });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ success: false, message: 'Error fetching groups' });
    }
  }
}
