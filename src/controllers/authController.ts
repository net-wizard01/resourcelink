import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { config } from '../config';

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, lat, lon } = req.body;

    if (!full_name || !email || !password || !lat || !lon) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, latitude, longitude) 
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, lat, lon]
    );

    const [users]: any = await pool.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);
    const user = users[0];

    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
    res.status(201).json({ user, token });
  } catch (error) {
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

    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
    res.json({ token, user: { id: user.id, full_name: user.full_name } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};