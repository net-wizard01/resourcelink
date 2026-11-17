import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LedgerService } from '../services/ledgerService';

export const createTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user!.id;
    const { receiver_id, listing_id, hours, idempotency_key } = req.body;

    if (!receiver_id || !listing_id || !hours || !idempotency_key) {
      return res.status(400).json({ error: 'Missing transfer details' });
    }

    const transaction = await LedgerService.transferCredits(
      senderId,
      receiver_id,
      listing_id,
      hours,
      idempotency_key
    );

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Transfer Error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const completeTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const receiverId = req.user!.id;
    const ledgerId = req.params.id;

    const result = await LedgerService.completeTransfer(ledgerId, receiverId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Complete Transfer Error:', error);
    res.status(400).json({ error: error.message });
  }
};