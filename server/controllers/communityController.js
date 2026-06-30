const Post    = require('../models/Post');
const Comment = require('../models/Comment');

const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = { isApproved: true };
    if (category && category !== 'all') filter.category = category;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments(filter);
    const data  = await Post.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar');

    res.status(200).json({
      success: true,
      data,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comments = await Comment.find({ post: req.params.id, isApproved: true })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar');

    res.status(200).json({ success: true, data: { ...post.toObject(), comments } });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const post = await Post.create({
      title, content, category, tags,
      author: req.user._id,
    });
    await post.populate('author', 'name avatar');
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId   = req.user._id;
    const liked    = post.likes.some((id) => id.toString() === userId.toString());

    if (liked) {
      post.likes    = post.likes.filter((id) => id.toString() !== userId.toString());
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();
    res.status(200).json({ success: true, data: { liked: !liked, likesCount: post.likesCount } });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

const approvePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id, isApproved: true })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar');
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post:    req.params.id,
      author:  req.user._id,
      content: content.trim(),
    });
    await comment.populate('author', 'name avatar');

    post.commentsCount += 1;
    await post.save();

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await comment.deleteOne();

    const post = await Post.findById(req.params.id);
    if (post) { post.commentsCount = Math.max(0, post.commentsCount - 1); await post.save(); }

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, getPost, createPost, likePost, deletePost, approvePost, getComments, addComment, deleteComment };
