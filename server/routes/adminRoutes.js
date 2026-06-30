const express = require('express');
const { getDashboard, getUsers, updateUserRole, toggleUserStatus, deleteUser, getAnalytics, getAllPosts } = require('../controllers/adminController');
const { approvePost } = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, isAdmin);

router.get('/dashboard',         getDashboard);
router.get('/analytics',         getAnalytics);
router.get('/users',             getUsers);
router.put('/users/:id/role',    updateUserRole);
router.put('/users/:id/status',  toggleUserStatus);
router.delete('/users/:id',      deleteUser);
router.get('/posts',             getAllPosts);
router.put('/posts/:id/approve', approvePost);

module.exports = router;
