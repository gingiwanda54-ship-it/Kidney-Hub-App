/**
 * Patients Routes
 */

const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');
const { authenticate, authorize } = require('../middleware/auth');
const { updatePatientProfileRules, mongoIdParam } = require('../middleware/validation');
const { uploadProfilePhoto, handleUploadError } = require('../middleware/upload');

// Protected routes
router.get('/:id', authenticate, authorize('patient', 'admin'), mongoIdParam('id'), patientsController.getPatientProfile);
router.put('/:id/profile', authenticate, authorize('patient', 'admin'), mongoIdParam('id'), updatePatientProfileRules, patientsController.updatePatientProfile);
router.post('/:id/photo', authenticate, authorize('patient', 'admin'), mongoIdParam('id'), uploadProfilePhoto, handleUploadError, patientsController.uploadPatientPhoto);

module.exports = router;
