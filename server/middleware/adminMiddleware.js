const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
};

const isTrainer = (req, res, next) => {
  if (req.user && (req.user.role === 'trainer' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Trainers or Admins only' });
};

module.exports = { isAdmin, isTrainer };
