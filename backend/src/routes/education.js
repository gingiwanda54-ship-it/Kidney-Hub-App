/**
 * Education Hub Routes
 */

const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all education content
router.get('/', educationController.getAllContent);

// Get categories
router.get('/categories', educationController.getCategories);

// Get featured content based on patient eGFR
router.get('/featured', authenticate, educationController.getFeatured);

// Search content
router.get('/search', educationController.searchContent);

// Get single content item
router.get('/:id', educationController.getContent);

// Get patient progress
router.get('/patient/:id/progress', authenticate, educationController.getPatientProgress);

// Create education content (admin/nurse only)
router.post('/', authenticate, authorize('nurse', 'admin'), educationController.createContent);

// Mark patient progress
router.post('/patient/:id/progress', authenticate, educationController.markProgress);

module.exports = router;
