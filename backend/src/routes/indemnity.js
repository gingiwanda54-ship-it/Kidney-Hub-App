/**
 * Indemnity Routes
 */

const express = require('express');
const router = express.Router();
const indemnityController = require('../controllers/indemnityController');
const { authenticate } = require('../middleware/auth');
const { signIndemnityRules } = require('../middleware/validation');

// Protected routes
router.get('/form', authenticate, indemnityController.getIndemnityForm);
router.post('/sign', authenticate, signIndemnityRules, indemnityController.signIndemnityForm);
router.get('/status/:userId', authenticate, indemnityController.getIndemnityStatus);

module.exports = router;
