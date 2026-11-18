import { Router } from 'express';
import { createListing, getNearbyListings, getMyListings, deleteListing, updateListing } from '../controllers/listingController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/nearby', requireAuth, getNearbyListings);
router.get('/me', requireAuth, getMyListings);
router.post('/', requireAuth, createListing);
router.delete('/:id', requireAuth, deleteListing);
router.put('/:id', requireAuth, updateListing); // <-- Explicit DELETE route

export default router;
