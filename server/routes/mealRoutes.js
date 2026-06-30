const express = require('express');
const { getMealPlans, getFeaturedMealPlans, getMealPlan, createMealPlan, updateMealPlan, deleteMealPlan } = require('../controllers/mealController');
const { protect }    = require('../middleware/auth');
const { isAdmin, isTrainer } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/',         getMealPlans);
router.get('/featured', getFeaturedMealPlans);
router.get('/:id',      getMealPlan);
router.post('/',        protect, isTrainer, createMealPlan);
router.put('/:id',      protect, isTrainer, updateMealPlan);
router.delete('/:id',   protect, isAdmin,   deleteMealPlan);

module.exports = router;
