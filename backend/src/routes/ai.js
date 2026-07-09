/**
 * AI Health Agent Routes
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');

// Chat with AI
router.post('/chat', authenticate, aiController.chat);

// Get patient health context
router.get('/context/:patientId', authenticate, authorize('nurse', 'admin'), aiController.getContext);

// Submit feedback
router.post('/feedback', authenticate, aiController.submitFeedback);

// Get conversation history
router.get('/conversation/:patientId', authenticate, aiController.getConversation);

// Get flagged warnings for nurse review
router.get('/warnings', authenticate, authorize('nurse', 'admin'), aiController.getWarnings);

module.exports = router;
