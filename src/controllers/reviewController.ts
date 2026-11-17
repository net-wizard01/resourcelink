import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../db';
import crypto from 'crypto';

export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const reviewerId = req.user!.id;
    const { ledger_id, rating, comment } = req.body;

    if (!ledger_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid review data' });
    }

    // Find the trade to verify participation and get the reviewee
    const [trades]: any = await pool.query(
      'SELECT * FROM time_ledger WHERE id = ? AND status = "COMPLETED"',
      [ledger_id]
    );

    const trade = trades[0];
    if (!trade) return res.status(404).json({ error: 'Completed trade not found' });

    // Ensure the reviewer is either the sender or receiver
    if (trade.sender_id !== reviewerId && trade.receiver_id !== reviewerId) {
      return res.status(403).json({ error: 'You were not part of this trade' });
    }

    const revieweeId = trade.sender_id === reviewerId ? trade.receiver_id : trade.sender_id;
    const reviewId = crypto.randomUUID();

    await pool.query(
      'INSERT INTO reviews (id, reviewer_id, reviewee_id, ledger_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [reviewId, reviewerId, revieweeId, ledger_id, rating, comment || '']
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};
