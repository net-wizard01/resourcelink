import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  overdraftFloor: parseFloat(process.env.CREDIT_OVERDRAFT_FLOOR || '-10.00'),
  defaultSearchRadius: parseInt(process.env.DEFAULT_SEARCH_RADIUS_M || '5000', 10),
};