const express = require('express');
const {
  getPosts, getPost, createPost, likePost, deletePost, approvePost,
  getComments, addComment, deleteComment,
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/',                                   getPosts);
router.get('/:id',                                getPost);
router.post('/',               protect,            createPost);
router.put('/:id/like',        protect,            likePost);
router.delete('/:id',          protect,            deletePost);
router.put('/:id/approve',     protect, isAdmin,   approvePost);

router.get('/:id/comments',                       getComments);
router.post('/:id/comments',   protect,            addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
