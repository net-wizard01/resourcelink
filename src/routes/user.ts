import { Router } from 'express';
import { getMyBalance, getMyTransactions, getUserProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me/balance', requireAuth, getMyBalance);
router.get('/me/transactions', requireAuth, getMyTransactions);
router.get('/:id/profile', requireAuth, getUserProfile);

export default router;
