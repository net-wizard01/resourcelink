import { Router } from 'express';
import { createListing, getNearbyListings } from '../controllers/listingController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/nearby', requireAuth, getNearbyListings);
router.post('/', requireAuth, createListing);

export default router;