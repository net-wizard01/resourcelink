import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../db';
import { config } from '../config';

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const { listing_type, category, title, description } = req.body;
    const user_id = req.user!.id;

    // Generate a UUID for the listing
    const listingId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO listings (id, user_id, listing_type, category, title, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [listingId, user_id, listing_type, category, title, description]
    );

    // Return the newly created listing details back to the client
    res.status(201).json({
      id: listingId,
      user_id,
      listing_type,
      category,
      title,
      description
    });
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
      SELECT l.id, l.title, l.category, l.listing_type, u.full_name,
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