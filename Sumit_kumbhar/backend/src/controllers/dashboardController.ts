import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Idol } from '../models/Idol';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const [totalBookings, totalIdolTypes, recentBookings] = await Promise.all([
      Booking.countDocuments({ owner: req.user.id, status: { $ne: 'Cancelled' } }),
      Idol.countDocuments({ owner: req.user.id }),
      Booking.find({ owner: req.user.id }).sort({ createdAt: -1 }).limit(5)
    ]);

    return res.json({
      totalBookings,
      totalIdolTypes,
      recentBookings
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({ message: 'Error retrieving statistics.' });
  }
}
