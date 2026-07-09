/**
 * Meal Plans Routes
 */

const express = require('express');
const router = express.Router();
const mealPlansController = require('../controllers/mealPlansController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all meal plans (public)
router.get('/', mealPlansController.getAllMealPlans);

// Get single meal plan
router.get('/:id', mealPlansController.getMealPlan);

// Get recommended meal plan for patient
router.get('/patient/:patientId/recommended', authenticate, mealPlansController.getRecommendedMealPlan);

// Get meal plan assignments
router.get('/assignments', authenticate, authorize('nurse', 'admin'), mealPlansController.getAssignments);

// Generate grocery list
router.get('/:id/grocery-list', authenticate, mealPlansController.generateGroceryList);

// Create meal plan (admin/nurse only)
router.post('/', authenticate, authorize('nurse', 'admin'), mealPlansController.createMealPlan);

// Assign meal plan to patient
router.post('/assign', authenticate, authorize('nurse', 'admin'), mealPlansController.assignMealPlan);

module.exports = router;
