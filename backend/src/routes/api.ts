import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as idolController from '../controllers/idolController';
import * as bookingController from '../controllers/bookingController';
import * as dashboardController from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// --- Public Authentication Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Protected Routes (Require Authentication) ---
router.use(authMiddleware as any);

// --- User Profile Route ---
router.get('/auth/me', authController.getProfile as any);

// --- Dashboard Routes ---
router.get('/dashboard/stats', dashboardController.getDashboardStats as any);

// --- Booking Routes ---
router.get('/bookings', bookingController.getBookings as any);
router.get('/bookings/export', bookingController.exportBookings as any);
router.get('/bookings/:id', bookingController.getBookingById as any);
router.post('/bookings', bookingController.createBooking as any);
router.put('/bookings/:id', bookingController.updateBooking as any);
router.put('/bookings/:id/cancel', bookingController.cancelBooking as any);

// --- Idol Routes ---
router.get('/idols', idolController.getIdols as any);
router.post('/idols', idolController.createIdol as any);
router.put('/idols/:id', idolController.updateIdol as any);
router.delete('/idols/:id', idolController.deleteIdol as any);
router.post('/idols/:id/increment', idolController.incrementCount as any);
router.post('/idols/:id/decrement', idolController.decrementCount as any);

export default router;
