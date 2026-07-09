/**
 * Verification Routes
 */

const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authenticate, authorize } = require('../middleware/auth');
const { verifySancRules, verifyBhfRules, verifySAIdRules, verifyMedicalAidRules } = require('../middleware/validation');

// Protected routes
router.post('/sanc', authenticate, authorize('nurse', 'admin'), verifySancRules, verificationController.verifySancNumber);
router.post('/bhf', authenticate, authorize('nurse', 'admin'), verifyBhfRules, verificationController.verifyBhfNumber);
router.post('/sa-id', authenticate, verifySAIdRules, verificationController.validateSAIdNumber);
router.post('/medical-aid', authenticate, verifyMedicalAidRules, verificationController.verifyMedicalAidNumber);
router.post('/lookup-medical-aid', authenticate, verificationController.lookupMedicalAid);

module.exports = router;
