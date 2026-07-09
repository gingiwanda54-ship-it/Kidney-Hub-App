/**
 * Health Records Routes
 */

const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadRecord, handleUploadError } = require('../middleware/upload');

// Create a new health record
router.post('/', authenticate, authorize('nurse', 'admin'), uploadRecord, handleUploadError, recordsController.createRecord);

// Get all records for a patient (paginated, filterable)
router.get('/patient/:id', authenticate, recordsController.getPatientRecords);

// Get single record
router.get('/:id', authenticate, recordsController.getRecord);

// Update record
router.put('/:id', authenticate, authorize('nurse', 'admin'), uploadRecord, handleUploadError, recordsController.updateRecord);

// Delete record (soft delete)
router.delete('/:id', authenticate, authorize('nurse', 'admin'), recordsController.deleteRecord);

// Get patient vitals
router.get('/patient/:id/vitals', authenticate, recordsController.getPatientVitals);

// Get patient lab results
router.get('/patient/:id/lab-results', authenticate, recordsController.getPatientLabResults);

// Get patient trends for charts
router.get('/patient/:id/trends', authenticate, recordsController.getPatientTrends);

module.exports = router;
