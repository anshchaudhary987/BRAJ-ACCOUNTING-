import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to extract company ID from headers and attach to request.
 * Expects header: x-company-id
 */
export const tenancyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const companyId = req.headers['x-company-id'] as string | undefined;
  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required in headers (x-company-id)' });
  }
  // Attach companyId to request object for easy access in controllers
  (req as any).companyId = companyId;
  next();
};