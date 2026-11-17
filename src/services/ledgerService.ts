import crypto from 'crypto';
import { pool } from '../db';
import { config } from '../config';

export class LedgerService {
  static async transferCredits(
    senderId: string,
    receiverId: string,
    listingId: string,
    hours: number,
    idempotencyKey: string
  ) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Check for existing transaction (Idempotency)
      const [existingTx]: any = await connection.query(
        'SELECT id, status FROM time_ledger WHERE idempotency_key = ?',
        [idempotencyKey]
      );
      
      if (existingTx.length > 0) {
        await connection.rollback();
        return existingTx[0];
      }

      // 2. Lock the sender row to prevent double-spending
      await connection.query('SELECT id FROM users WHERE id = ? FOR UPDATE', [senderId]);
      
      // 3. Calculate current balance
      const [balanceResult]: any = await connection.query(
        `SELECT 
          COALESCE(
            SUM(CASE WHEN receiver_id = ? THEN hours_exchanged ELSE 0 END) - 
            SUM(CASE WHEN sender_id = ? THEN hours_exchanged ELSE 0 END), 
          0) as current_balance
        FROM time_ledger
        WHERE status = 'COMPLETED' AND (? = sender_id OR ? = receiver_id)`,
        [senderId, senderId, senderId, senderId]
      );
      
      const currentBalance = parseFloat(balanceResult[0].current_balance);

      // 4. Enforce overdraft floor (e.g., cannot go below -10)
      if (currentBalance - hours < config.overdraftFloor) {
        throw new Error(`Insufficient credits. Current balance: ${currentBalance}`);
      }

      // 5. Insert the new pending transaction
      const newTxId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO time_ledger (id, sender_id, receiver_id, listing_id, hours_exchanged, status, idempotency_key)
         VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
        [newTxId, senderId, receiverId, listingId, hours, idempotencyKey]
      );

      await connection.commit();
      return { id: newTxId, status: 'PENDING' };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async completeTransfer(ledgerId: string, receiverId: string) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Lock the transaction row
      const [txResult]: any = await connection.query(
        'SELECT * FROM time_ledger WHERE id = ? FOR UPDATE',
        [ledgerId]
      );

      const tx = txResult[0];

      if (!tx) {
        throw new Error('Transaction not found');
      }

      // 2. Verify the person trying to complete it is the receiver (Bob)
      if (tx.receiver_id !== receiverId) {
        throw new Error('Only the receiver can complete this transaction');
      }

      // 3. Verify it's currently PENDING
      if (tx.status !== 'PENDING') {
        throw new Error(`Transaction is already ${tx.status}`);
      }

      // 4. Update the status to COMPLETED
      await connection.query(
        'UPDATE time_ledger SET status = "COMPLETED" WHERE id = ?',
        [ledgerId]
      );

      await connection.commit();
      return { status: 'COMPLETED', id: ledgerId };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}