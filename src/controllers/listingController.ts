import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../db';
import { config } from '../config';
import crypto from 'crypto';

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const { listing_type, category, title, description, estimated_hours, image_url } = req.body;
    const user_id = req.user!.id;
    const listingId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO listings (id, user_id, listing_type, category, title, description, estimated_hours, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [listingId, user_id, listing_type, category, title, description || '', estimated_hours || 1.0, image_url || null]
    );

    res.status(201).json({ id: listingId, listing_type, category, title, description, estimated_hours, image_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

export const getNearbyListings = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user!.id;
    const radius = parseInt(req.query.radius as string) || config.defaultSearchRadius;

    const query = `
      SELECT l.id, l.user_id, l.title, l.category, l.listing_type, l.description, l.estimated_hours, l.image_url, 
             u.full_name, u.avatar_url, u.latitude, u.longitude,
             (6371000 * acos(
               cos(radians(u1.latitude)) * cos(radians(u.latitude)) * 
               cos(radians(u.longitude) - radians(u1.longitude)) + 
               sin(radians(u1.latitude)) * sin(radians(u.latitude))
             )) AS distance_meters
      FROM listings l
      JOIN users u ON l.user_id = u.id
      JOIN users u1 ON u1.id = ?
      WHERE l.is_active = TRUE
      HAVING distance_meters < ?
      ORDER BY distance_meters ASC
    `;

    const [listings]: any = await pool.query(query, [user_id, radius]);
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user!.id;
    const [listings]: any = await pool.query(
      `SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch my listings' });
  }
};


export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const listingId = req.params.id;
    const user_id = req.user!.id;

    const [listings]: any = await pool.query('SELECT user_id FROM listings WHERE id = ?', [listingId]);
    if (listings.length === 0) return res.status(404).json({ error: 'Listing not found' });
    if (listings[0].user_id !== user_id) return res.status(403).json({ error: 'Unauthorized' });

    // SOFT DELETE: Just hide it from the feed instead of deleting the row
    await pool.query('UPDATE listings SET is_active = FALSE WHERE id = ?', [listingId]);
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

