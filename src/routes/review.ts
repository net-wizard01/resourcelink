import { Router } from 'express';
import { submitReview, getReviewsForUser } from '../controllers/reviewController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/', requireAuth, submitReview);
router.get('/user/:userId', requireAuth, getReviewsForUser);
export default router;
