const express = require('express');
const { getProgress, getStats, createProgress, updateProgress, deleteProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/',       getProgress);
router.get('/stats',  getStats);
router.post('/',      createProgress);
router.put('/:id',    updateProgress);
router.delete('/:id', deleteProgress);

module.exports = router;
