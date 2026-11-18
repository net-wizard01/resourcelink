import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db';
import { config } from '../config';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '15m' });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, lat, lon } = req.body;
    if (!full_name || !email || !password || !lat || !lon) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, full_name, email, password_hash, lat, lon]
    );

    const [users]: any = await pool.query('SELECT id, full_name, email, avatar_url FROM users WHERE id = ?', [userId]);
    const user = users[0];
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await pool.query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [refreshHash, user.id]);

    res.status(201).json({ user, token: accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await pool.query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [refreshHash, user.id]);

    res.json({ token: accessToken, refreshToken, user: { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const [users]: any = await pool.query('SELECT * FROM users WHERE refresh_token_hash = ?', [refreshHash]);
    const user = users[0];

    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await pool.query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [newRefreshHash, user.id]);

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('UPDATE users SET refresh_token_hash = NULL WHERE refresh_token_hash = ?', [refreshHash]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
