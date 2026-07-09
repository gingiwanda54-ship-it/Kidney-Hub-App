/**
 * Payments Routes
 */

const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticate, authorize } = require('../middleware/auth');
const { initiatePaymentRules } = require('../middleware/validation');

// Protected routes
router.post('/initiate', authenticate, authorize('patient'), initiatePaymentRules, paymentsController.initiateCashPayment);
router.post('/confirm', authenticate, authorize('patient', 'admin'), paymentsController.confirmCashPayment);
router.post('/medical-aid-claim', authenticate, authorize('patient'), paymentsController.submitMedicalAidClaim);
router.get('/:bookingId', authenticate, authorize('patient', 'nurse', 'admin'), paymentsController.getPaymentStatus);

module.exports = router;
