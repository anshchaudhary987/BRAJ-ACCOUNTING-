import type { Request, Response } from 'express';
import pool from '../config/database.js';
import { InventoryRepository } from '../repositories/inventory.repository.js';

export const listUnits = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const units = await InventoryRepository.listUnits(pool, companyId);
    res.json(units);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUnit = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { name, symbol } = req.body;
    const unit = await InventoryRepository.createUnit(pool, companyId, name, symbol);
    res.status(201).json(unit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listGodowns = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const godowns = await InventoryRepository.listGodowns(pool, companyId);
    res.json(godowns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createGodown = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { name, location } = req.body;
    const godown = await InventoryRepository.createGodown(pool, companyId, name, location);
    res.status(201).json(godown);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listStockItems = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const items = await InventoryRepository.listStockItems(pool, companyId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createStockItem = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const item = await InventoryRepository.createStockItem(pool, companyId, req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createStockJournal = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const result = await InventoryRepository.saveStockJournal(pool, companyId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
