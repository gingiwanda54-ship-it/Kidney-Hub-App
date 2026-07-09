/**
 * Nurses Routes
 */

const express = require('express');
const router = express.Router();
const nursesController = require('../controllers/nursesController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { 
    updateNurseProfileRules, 
    createAvailabilityRules, 
    mongoIdParam 
} = require('../middleware/validation');
const { uploadProfilePhoto, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, nursesController.getAllNurses);
router.get('/:id', optionalAuth, mongoIdParam('id'), nursesController.getNurseById);
router.get('/:id/availability', optionalAuth, mongoIdParam('id'), nursesController.getNurseAvailability);

// Protected routes (nurse must own the profile)
router.put('/:id/profile', authenticate, authorize('nurse', 'admin'), mongoIdParam('id'), updateNurseProfileRules, nursesController.updateNurseProfile);
router.post('/:id/photo', authenticate, authorize('nurse', 'admin'), mongoIdParam('id'), uploadProfilePhoto, handleUploadError, nursesController.uploadNursePhoto);
router.post('/:id/availability', authenticate, authorize('nurse', 'admin'), mongoIdParam('id'), createAvailabilityRules, nursesController.setNurseAvailability);

module.exports = router;
