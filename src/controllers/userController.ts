import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../db';

export const getMyBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [balanceResult]: any = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN receiver_id = ? THEN hours_exchanged ELSE 0 END) - SUM(CASE WHEN sender_id = ? THEN hours_exchanged ELSE 0 END), 0) as balance FROM time_ledger WHERE status = 'COMPLETED' AND (? = sender_id OR ? = receiver_id)`,
      [userId, userId, userId, userId]
    );
    const [userResult]: any = await pool.query('SELECT id, full_name, email, avatar_url, latitude, longitude FROM users WHERE id = ?', [userId]);
    res.json({ user: userResult[0], balance: parseFloat(balanceResult[0].balance) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

export const getMyTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [transactions]: any = await pool.query(
      `SELECT t.*, s.full_name as sender_name, r.full_name as receiver_name, l.title as listing_title
       FROM time_ledger t
       JOIN users s ON t.sender_id = s.id
       JOIN users r ON t.receiver_id = r.id
       LEFT JOIN listings l ON t.listing_id = l.id
       WHERE t.sender_id = ? OR t.receiver_id = ?
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const [userResult]: any = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.avatar_url, 
       (SELECT COUNT(*) FROM time_ledger WHERE (sender_id = u.id OR receiver_id = u.id) AND status = 'COMPLETED') as completed_trades,
       (SELECT COUNT(*) FROM listings WHERE user_id = u.id AND is_active = TRUE) as active_listings,
       (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = u.id) as average_rating,
       (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id) as review_count
       FROM users u WHERE u.id = ?`,
      [targetUserId]
    );
    res.json(userResult[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [users]: any = await pool.query(
      `SELECT id, full_name, email, avatar_url, bio, latitude, longitude FROM users WHERE id = ?`,
      [userId]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const [stats]: any = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM time_ledger WHERE (sender_id = ? OR receiver_id = ?) AND status = 'COMPLETED') as completed_trades,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = ?) as average_rating,
        (SELECT COUNT(*) FROM reviews WHERE reviewee_id = ?) as review_count`,
      [userId, userId, userId, userId]
    );

    res.json({ ...users[0], ...stats[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { full_name, bio, avatar_url } = req.body;
    await pool.query(
      'UPDATE users SET full_name = ?, bio = ?, avatar_url = ? WHERE id = ?',
      [full_name, bio || null, avatar_url || null, userId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getPendingTradesCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // Count trades where this user is the receiver and status is PENDING
    const [result]: any = await pool.query(
      `SELECT COUNT(*) as count FROM time_ledger WHERE receiver_id = ? AND status = 'PENDING'`,
      [userId]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count trades' });
  }
};
