import { Router } from 'express';
import { createTransfer, completeTransfer } from '../controllers/ledgerController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/transfer', requireAuth, createTransfer);
router.post('/:id/complete', requireAuth, completeTransfer);

export default router;