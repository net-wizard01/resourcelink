import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../db';
import crypto from 'crypto';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const sender_id = req.user!.id;
    const { receiver_id, listing_id, content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'Message cannot be empty' });

    const messageId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO messages (id, sender_id, receiver_id, listing_id, content) VALUES (?, ?, ?, ?, ?)',
      [messageId, sender_id, receiver_id, listing_id, content]
    );
    res.status(201).json({ id: messageId, sender_id, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const { otherUserId, listingId } = req.query;
    const [messages]: any = await pool.query(
      `SELECT * FROM messages 
       WHERE listing_id = ? 
       AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       ORDER BY created_at ASC`,
      [listingId, currentUserId, otherUserId, otherUserId, currentUserId]
    );
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const getChatList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [chats]: any = await pool.query(
      `SELECT 
        MAX(m.created_at) as created_at,
        MAX(m.content) as last_message,
        m.listing_id,
        l.title as listing_title,
        u.id as other_user_id, u.full_name as other_user_name
       FROM messages m
       JOIN users u ON (u.id = m.sender_id OR u.id = m.receiver_id) AND u.id != ?
       JOIN listings l ON m.listing_id = l.id
       WHERE (m.sender_id = ? OR m.receiver_id = ?)
       GROUP BY u.id, m.listing_id, l.title
       ORDER BY created_at DESC`,
      [userId, userId, userId]
    );
    res.json(chats);
  } catch (error) {
    console.error("Chat List Error:", error);
    res.status(500).json({ error: 'Failed to fetch chat list' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { otherUserId, listingId } = req.params;
    await pool.query(
      `DELETE FROM messages WHERE listing_id = ? AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))`,
      [listingId, userId, otherUserId, otherUserId, userId]
    );
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // Count messages sent to this user. (For simplicity, we assume all received messages are unread until they open the chat)
    const [result]: any = await pool.query(
      `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE`,
      [userId]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count messages' });
  }
};

export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { otherUserId, listingId } = req.body;
    await pool.query(
      `UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ? AND listing_id = ?`,
      [userId, otherUserId, listingId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};
