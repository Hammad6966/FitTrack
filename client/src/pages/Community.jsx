import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiX, FiHeart, FiMessageCircle, FiBookmark, FiPlus, FiSend } from 'react-icons/fi';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { communityAPI } from '../utils/api';

/* ── static sidebar data ── */
const TOP_CONTRIBUTORS = [
  { name: 'Kamran Ali',    posts: 47, color: 'from-cyan-500 to-blue-600' },
  { name: 'Dr. Fatima N.', posts: 38, color: 'from-blue-500 to-indigo-600' },
  { name: 'Usman Tariq',   posts: 31, color: 'from-green-500 to-teal-600' },
  { name: 'Ayesha Khan',   posts: 26, color: 'from-pink-500 to-rose-600' },
  { name: 'Sana Mirza',    posts: 22, color: 'from-rose-500 to-pink-600' },
];
const TRENDING = ['#diabetes-management', '#blood-sugar', '#weight-loss', '#HIIT', '#meal-prep', '#success-story'];

const CATEGORY_META = {
  all:           { label: 'All',           pill: 'bg-gray-700/50 text-gray-300 border-gray-600/40' },
  general:       { label: 'General',       pill: 'bg-gray-500/15 text-gray-300 border-gray-500/20' },
  diabetes:      { label: 'Diabetes',      pill: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  nutrition:     { label: 'Nutrition',     pill: 'bg-green-500/15 text-green-400 border-green-500/20' },
  exercise:      { label: 'Exercise',      pill: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  success_story: { label: 'Success Story', pill: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
};
const TABS = ['all', 'general', 'diabetes', 'nutrition', 'exercise', 'success_story'];

const GRADIENTS = [
  'from-pink-500 to-rose-600',    'from-blue-500 to-indigo-600',
  'from-green-500 to-teal-600',   'from-orange-500 to-amber-600',
  'from-purple-500 to-violet-600','from-cyan-500 to-blue-600',
  'from-red-500 to-pink-600',     'from-yellow-500 to-orange-600',
];

function nameToGradient(name = '') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function fmtAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d} day${d > 1 ? 's' : ''} ago`;
  return `${Math.floor(d / 7)}w ago`;
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function Avatar({ name, gradient, size = 'w-9 h-9', text = 'text-sm' }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ${text} flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
}

/* ── POST MODAL ── */
function PostModal({ post, onClose, onLike }) {
  const [comment,  setComment]  = useState('');
  const [comments, setComments] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const cat = CATEGORY_META[post.category] || CATEGORY_META.general;

  useEffect(() => {
    communityAPI.getPost(post._id)
      .then(({ data: res }) => setComments(res.data?.comments || []))
      .catch(() => {})
      .finally(() => setLoadingC(false));
  }, [post._id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) { toast.error('Please log in to comment'); return; }
    try {
      const { data: res } = await communityAPI.addComment(post._id, { content: comment.trim() });
      setComments((p) => [...p, res.data]);
      setComment('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.28 }}
        className="bg-gray-900 border border-gray-700/60 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cat.pill}`}>{cat.label}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <FiX size={15} />
          </button>
        </div>

        <div className="p-6">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={post.author?.name || 'User'} gradient={post.authorGradient} size="w-10 h-10" />
            <div>
              <p className="text-white font-semibold text-sm">{post.author?.name || 'Unknown'}</p>
              <p className="text-gray-500 text-xs">{post.date}</p>
            </div>
          </div>

          <h2 className="text-white font-black text-xl mb-3 leading-tight">{post.title}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-5">{post.content}</p>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {post.tags.map((t) => (
                <span key={t} className="px-2.5 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/40 text-gray-400 text-xs">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Like row */}
          <div className="flex items-center gap-5 py-4 border-y border-gray-800/60 mb-5">
            <button onClick={() => onLike(post._id)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
              {post.liked ? <FaHeart className="text-red-400" size={15} /> : <FiHeart size={15} />}
              {post.likesCount} likes
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <FiMessageCircle size={15} /> {comments.length} comments
            </span>
          </div>

          {/* Comments */}
          <div className="space-y-3 mb-5">
            {loadingC && <p className="text-gray-600 text-sm text-center py-3">Loading comments...</p>}
            {!loadingC && comments.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-3">No comments yet. Be the first!</p>
            )}
            {comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <Avatar name={c.author?.name || 'User'} gradient={nameToGradient(c.author?.name || '')} size="w-7 h-7" text="text-xs" />
                <div className="flex-1 bg-gray-800/40 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-semibold">{c.author?.name || 'User'}</span>
                    <span className="text-gray-600 text-xs">{fmtAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment form */}
          <form onSubmit={handleComment} className="flex gap-3">
            {isAuthenticated && (
              <Avatar name={user?.name || 'You'} gradient="from-green-500 to-emerald-600" size="w-8 h-8" text="text-xs" />
            )}
            <div className="flex-1 relative">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isAuthenticated ? 'Write a comment...' : 'Log in to comment'}
                disabled={!isAuthenticated}
                className="w-full bg-gray-800/60 border border-gray-700/50 text-white text-sm rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-green-500/50 placeholder-gray-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || !comment.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-300 disabled:opacity-30 transition-colors"
              >
                <FiSend size={15} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── CREATE POST MODAL ── */
function CreatePostModal({ onClose, onRefresh }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm]     = useState({ title: '', category: 'general', content: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await communityAPI.createPost({ title: form.title, content: form.content, category: form.category });
      toast.success('Post published! It will appear after review.');
      onRefresh();
      onClose();
    } catch {
      toast.error('Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.28 }}
        className="bg-gray-900 border border-gray-700/60 rounded-3xl w-full max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
          <h2 className="text-white font-black text-lg">Create Post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <FiX size={15} />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 text-center">
            <p className="text-5xl mb-4">🔐</p>
            <h3 className="text-white font-bold text-lg mb-2">Login Required</h3>
            <p className="text-gray-400 text-sm mb-6">You need to be logged in to share posts with the community.</p>
            <Link to="/login" onClick={onClose} className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 text-sm">
              Sign In to Post
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Title *</label>
              <input
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Write a clear, descriptive title..."
                className="input-dark" required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-dark">
                {['general', 'diabetes', 'nutrition', 'exercise', 'success_story'].map((c) => (
                  <option key={c} value={c} className="bg-gray-800 capitalize">
                    {CATEGORY_META[c].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Content *</label>
              <textarea
                rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Share your experience, tips, or questions..."
                className="input-dark resize-none" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend size={14} />}
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── POST CARD ── */
function PostCard({ post, onOpen, onLike, onSave }) {
  const cat = CATEGORY_META[post.category] || CATEGORY_META.general;
  return (
    <motion.div
      variants={fadeUp}
      onClick={() => onOpen(post)}
      className="group bg-gray-800/40 border border-gray-700/40 hover:border-green-500/20 rounded-2xl p-5 cursor-pointer hover:bg-gray-800/60 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.author?.name || 'User'} gradient={post.authorGradient} />
          <div>
            <p className="text-white text-sm font-semibold">{post.author?.name || 'Unknown'}</p>
            <p className="text-gray-500 text-xs">{post.date}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.pill}`}>{cat.label}</span>
      </div>

      <h3 className="text-white font-bold text-base mb-2 leading-snug group-hover:text-green-400 transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">{post.content}</p>

      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
          >
            {post.liked ? <FaHeart size={13} /> : <FiHeart size={13} />}
            {post.likesCount}
          </button>
          <button onClick={() => onOpen(post)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            <FiMessageCircle size={13} /> {post.commentsCount || 0}
          </button>
        </div>
        <button
          onClick={() => onSave(post._id)}
          className={`transition-colors ${post.savedLocal ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
        >
          {post.savedLocal ? <FaBookmark size={13} /> : <FiBookmark size={13} />}
        </button>
      </div>
    </motion.div>
  );
}

/* ── skeleton ── */
function PostSkeleton() {
  return (
    <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-700/60" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 bg-gray-700/60 rounded" />
          <div className="h-2.5 w-20 bg-gray-700/40 rounded" />
        </div>
      </div>
      <div className="h-4 w-3/4 bg-gray-700/50 rounded" />
      <div className="h-3 w-full bg-gray-700/40 rounded" />
      <div className="h-3 w-4/5 bg-gray-700/40 rounded" />
    </div>
  );
}

/* ══ MAIN ══ */
export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab,   setActiveTab]   = useState('all');
  const [openPost,    setOpenPost]    = useState(null);
  const [showCreate,  setShowCreate]  = useState(false);
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);

  const mapPost = useCallback((p) => ({
    ...p,
    authorGradient: nameToGradient(p.author?.name || ''),
    date:           fmtAgo(p.createdAt),
    liked:          isAuthenticated && user ? (p.likes || []).some((id) => id?.toString() === user._id?.toString()) : false,
    savedLocal:     false,
  }), [isAuthenticated, user]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.category = activeTab;
      const { data: res } = await communityAPI.getPosts(params);
      setPosts((res.data || []).map(mapPost));
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [activeTab, mapPost]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (id) => {
    if (!isAuthenticated) { toast.error('Please log in to like posts'); return; }
    setPosts((prev) => prev.map((p) =>
      p._id === id
        ? { ...p, liked: !p.liked, likesCount: p.liked ? (p.likesCount || 1) - 1 : (p.likesCount || 0) + 1 }
        : p
    ));
    if (openPost?._id === id) {
      setOpenPost((p) => p ? { ...p, liked: !p.liked, likesCount: p.liked ? (p.likesCount || 1) - 1 : (p.likesCount || 0) + 1 } : p);
    }
    try {
      await communityAPI.likePost(id);
    } catch {
      setPosts((prev) => prev.map((p) =>
        p._id === id
          ? { ...p, liked: !p.liked, likesCount: p.liked ? (p.likesCount || 1) - 1 : (p.likesCount || 0) + 1 }
          : p
      ));
    }
  };

  const handleSave = (id) => {
    setPosts((prev) => prev.map((p) => p._id === id ? { ...p, savedLocal: !p.savedLocal } : p));
    toast.success('Post saved!');
  };

  const filtered = activeTab === 'all' ? posts : posts.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative py-16 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-green-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-4">
            👥 10,000+ Members
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-none">
            FitTrack{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Share your journey, learn from others, and find support from thousands on the same path.
          </p>
        </motion.div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">

        {/* ── LEFT FEED ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Create post button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-green-500/30 rounded-2xl px-5 py-4 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <FiPlus size={16} className="text-white" />
            </div>
            <span className="text-gray-500 group-hover:text-gray-300 transition-colors text-sm flex-1 text-left">
              Share something with the community...
            </span>
            <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20">
              Post
            </span>
          </motion.button>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const meta = CATEGORY_META[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-md shadow-green-500/20'
                      : `${meta.pill} hover:opacity-80`
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Posts */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-4"
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
              ) : filtered.length > 0 ? (
                filtered.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onOpen={setOpenPost}
                    onLike={handleLike}
                    onSave={handleSave}
                  />
                ))
              ) : (
                <motion.div variants={fadeUp} className="text-center py-16">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-white font-bold mb-1">No posts in this category yet</p>
                  <p className="text-gray-500 text-sm">Be the first to post!</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">

          {/* Community stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5"
          >
            <h3 className="text-white font-bold mb-4">Community Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Members',   value: '10,234', color: 'text-green-400',  icon: '👥' },
                { label: 'Posts Shared',    value: '5,621',  color: 'text-blue-400',   icon: '📝' },
                { label: 'Active Today',    value: '892',    color: 'text-orange-400', icon: '🔥' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <span>{s.icon}</span> {s.label}
                  </span>
                  <span className={`font-black text-sm ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top contributors */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5"
          >
            <h3 className="text-white font-bold mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {TOP_CONTRIBUTORS.map((u, i) => (
                <div key={u.name} className="flex items-center gap-3">
                  <span className="text-gray-600 text-xs w-4 text-right">{i + 1}</span>
                  <Avatar name={u.name} gradient={u.color} size="w-8 h-8" text="text-xs" />
                  <span className="text-gray-300 text-sm flex-1">{u.name}</span>
                  <span className="text-gray-500 text-xs">{u.posts} posts</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trending topics */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5"
          >
            <h3 className="text-white font-bold mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-gray-700/50 border border-gray-600/30 text-gray-300 text-xs hover:border-green-500/30 hover:text-green-400 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {openPost && (
          <PostModal
            key="post-modal"
            post={posts.find((p) => p._id === openPost._id) || openPost}
            onClose={() => setOpenPost(null)}
            onLike={handleLike}
          />
        )}
        {showCreate && (
          <CreatePostModal
            key="create-modal"
            onClose={() => setShowCreate(false)}
            onRefresh={fetchPosts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
