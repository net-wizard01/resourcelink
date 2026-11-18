import { Router } from 'express';
import { sendMessage, getMessages, getChatList, deleteChat, getUnreadCount, markMessagesAsRead } from '../controllers/messageController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/', requireAuth, sendMessage);
router.get('/', requireAuth, getMessages);
router.get('/inbox', requireAuth, getChatList);
router.get('/unread', requireAuth, getUnreadCount);
router.put('/read', requireAuth, markMessagesAsRead);
router.delete('/:otherUserId/:listingId', requireAuth, deleteChat);
export default router;
