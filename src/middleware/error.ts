import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err.message);

  // Postgres unique violation (e.g., duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists (duplicate constraint).' });
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
};