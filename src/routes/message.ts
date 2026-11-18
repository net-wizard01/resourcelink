import { Router } from 'express';
import { sendMessage, getMessages, getChatList, deleteChat } from '../controllers/messageController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/', requireAuth, sendMessage);
router.get('/', requireAuth, getMessages);
router.get('/inbox', requireAuth, getChatList);
router.delete('/:otherUserId/:listingId', requireAuth, deleteChat);
export default router;
