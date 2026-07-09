/**
 * Bookings Routes
 */

const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { createBookingRules, mongoIdParam } = require('../middleware/validation');

// Protected routes
router.post('/', authenticate, authorize('patient'), createBookingRules, bookingsController.createBooking);
router.get('/patient/:id', authenticate, authorize('patient', 'admin'), mongoIdParam('id'), bookingsController.getPatientBookings);
router.get('/nurse/:id', authenticate, authorize('nurse', 'admin'), mongoIdParam('id'), bookingsController.getNurseBookings);
router.put('/:id', authenticate, authorize('nurse', 'admin', 'patient'), mongoIdParam('id'), bookingsController.updateBookingStatus);
router.post('/:id/google-meet', authenticate, authorize('nurse', 'admin'), mongoIdParam('id'), bookingsController.generateGoogleMeetLink);

module.exports = router;
