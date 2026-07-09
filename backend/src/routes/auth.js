/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { 
    registerPatientRules, 
    registerNurseRules, 
    loginRules, 
    verifyOTPRules 
} = require('../middleware/validation');

// Public routes
router.post('/register/patient', registerPatientRules, authController.registerPatient);
router.post('/register/nurse', registerNurseRules, authController.registerNurse);
router.post('/login', loginRules, authController.login);

// Protected routes
router.post('/verify-otp', authenticate, verifyOTPRules, authController.verifyOtp);
router.post('/send-otp', authenticate, authController.resendOtp);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
