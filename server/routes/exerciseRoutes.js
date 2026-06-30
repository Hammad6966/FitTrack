const express  = require('express');
const { getExercises, getFeaturedExercises, getExercise, createExercise, updateExercise, deleteExercise, toggleFeatured } = require('../controllers/exerciseController');
const { protect }    = require('../middleware/auth');
const { isAdmin, isTrainer } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/',           getExercises);
router.get('/featured',   getFeaturedExercises);
router.get('/:id',        getExercise);
router.post('/',          protect, isTrainer, createExercise);
router.put('/:id',        protect, isTrainer, updateExercise);
router.delete('/:id',     protect, isAdmin,   deleteExercise);
router.put('/:id/featured', protect, isAdmin, toggleFeatured);

module.exports = router;
