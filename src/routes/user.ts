import { Router } from 'express';
import { getMyBalance, getMyTransactions, getUserProfile, getMyProfile, updateProfile } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/me/balance', requireAuth, getMyBalance);
router.get('/me/transactions', requireAuth, getMyTransactions);
router.get('/me/profile', requireAuth, getMyProfile);
router.put('/me/profile', requireAuth, updateProfile);
router.get('/:id/profile', requireAuth, getUserProfile);

export default router;
