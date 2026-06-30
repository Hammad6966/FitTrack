import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiGrid, FiUsers, FiActivity, FiBookOpen, FiMessageSquare,
  FiBarChart2, FiSettings, FiLogOut, FiX, FiPlus, FiEdit2,
  FiTrash2, FiSearch, FiTrendingUp, FiTrendingDown, FiCheck,
  FiToggleLeft, FiToggleRight, FiStar,
} from 'react-icons/fi';
import { FaDumbbell, FaUtensils, FaFileAlt } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { adminAPI, exerciseAPI } from '../utils/api';

const GREEN = '#22c55e';
const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ROLE_COLORS = {
  admin:   'bg-red-500/15 text-red-400 border-red-500/20',
  trainer: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  user:    'bg-gray-500/15 text-gray-400 border-gray-500/20',
};
const CAT_COLORS = {
  diabetes_friendly: 'bg-green-500/15 text-green-400 border-green-500/20',
  cardio:            'bg-orange-500/15 text-orange-400 border-orange-500/20',
  strength:          'bg-blue-500/15 text-blue-400 border-blue-500/20',
  yoga:              'bg-purple-500/15 text-purple-400 border-purple-500/20',
  flexibility:       'bg-pink-500/15 text-pink-400 border-pink-500/20',
};
const POST_CAT_COLORS = {
  success_story: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  diabetes:      'bg-blue-500/15 text-blue-400 border-blue-500/20',
  nutrition:     'bg-green-500/15 text-green-400 border-green-500/20',
  exercise:      'bg-orange-500/15 text-orange-400 border-orange-500/20',
  general:       'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

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

function Avatar({ name, gradient, size = 'w-8 h-8', text = 'text-xs' }) {
  const initials = (name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradient || 'from-gray-500 to-gray-700'} flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
      {initials}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

/* ── EXERCISE MODAL ── */
function ExerciseModal({ exercise, onClose, onSave }) {
  const [form, setForm] = useState(exercise ? {
    ...exercise,
    instructions: exercise.instructions?.length ? exercise.instructions : [''],
    tags: Array.isArray(exercise.tags) ? exercise.tags.join(', ') : (exercise.tags || ''),
  } : {
    title: '', description: '', category: 'cardio', difficulty: 'beginner',
    duration: '', caloriesBurn: '', imageUrl: '', instructions: [''], tags: '',
  });

  const updateInstruction = (i, val) => { const arr = [...form.instructions]; arr[i] = val; setForm({ ...form, instructions: arr }); };
  const addInstruction    = () => setForm({ ...form, instructions: [...form.instructions, ''] });
  const removeInstruction = (i) => setForm({ ...form, instructions: form.instructions.filter((_, idx) => idx !== i) });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    onSave({ ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] });
    toast.success(exercise ? 'Exercise updated!' : 'Exercise added!');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
        className="bg-gray-900 border border-gray-700/60 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-white font-black text-lg">{exercise ? 'Edit Exercise' : 'Add Exercise'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <FiX size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark" placeholder="Exercise title" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark resize-none" placeholder="Brief description..." />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-dark">
                {['cardio','strength','yoga','flexibility','diabetes_friendly','balance'].map((c) => (
                  <option key={c} value={c} className="bg-gray-800 capitalize">{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-dark">
                {['beginner','intermediate','advanced'].map((d) => (
                  <option key={d} value={d} className="bg-gray-800 capitalize">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Duration (min)</label>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-dark" placeholder="30" />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Calories Burn</label>
              <input type="number" value={form.caloriesBurn} onChange={(e) => setForm({ ...form, caloriesBurn: e.target.value })} className="input-dark" placeholder="200" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input-dark" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-dark" placeholder="cardio, diabetes, low-impact" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-300 text-xs font-medium">Instructions</label>
              <button type="button" onClick={addInstruction} className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors">
                <FiPlus size={12} /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {form.instructions.map((inst, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-2">{i + 1}</span>
                  <input value={inst} onChange={(e) => updateInstruction(i, e.target.value)} className="input-dark flex-1" placeholder={`Step ${i + 1}...`} />
                  {form.instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(i)} className="mt-2 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-sm">
            {exercise ? 'Save Changes' : 'Add Exercise'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── DASHBOARD TAB ── */
function DashboardTab({ data, loading }) {
  if (loading) return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-gray-700/60 mb-3" />
          <div className="h-6 w-20 bg-gray-700/60 rounded mb-1" />
          <div className="h-3 w-28 bg-gray-700/40 rounded" />
        </div>
      ))}
    </div>
  );

  const stats = [
    { label: 'Total Users',     value: (data?.totalUsers     || 0).toLocaleString(), trend: `+${data?.newUsersThisWeek || 0} this week`, up: true,  icon: FiUsers,        color: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Total Exercises', value: (data?.totalExercises || 0).toLocaleString(), trend: 'exercises',                                  up: true,  icon: FaDumbbell,     color: 'text-green-400',  bg: 'bg-green-500/10' },
    { label: 'Meal Plans',      value: (data?.totalMealPlans || 0).toLocaleString(), trend: 'plans',                                      up: true,  icon: FaUtensils,     color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Community Posts', value: (data?.totalPosts     || 0).toLocaleString(), trend: 'approved posts',                             up: true,  icon: FiMessageSquare,color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={s.color} size={18} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                  {s.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />} {s.trend}
                </span>
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700/30">
            <h3 className="text-white font-bold text-sm">Recent Users</h3>
          </div>
          <div className="divide-y divide-gray-700/20">
            {(data?.recentUsers || []).map((u) => (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={u.name} gradient={nameToGradient(u.name)} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{u.name}</p>
                  <p className="text-gray-500 text-xs truncate">{u.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[u.role] || ROLE_COLORS.user} capitalize`}>{u.role}</span>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.isActive !== false ? 'bg-green-400' : 'bg-gray-600'}`} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Posts */}
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700/30">
            <h3 className="text-white font-bold text-sm">Recent Posts</h3>
          </div>
          <div className="divide-y divide-gray-700/20">
            {(data?.recentPosts || []).map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{p.title}</p>
                  <p className="text-gray-500 text-xs">{p.author?.name || '—'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${POST_CAT_COLORS[p.category] || POST_CAT_COLORS.general}`}>
                  {(p.category || '').replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${p.isApproved ? 'bg-green-400' : 'bg-yellow-400'}`} title={p.isApproved ? 'Approved' : 'Pending'} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Exercise',  icon: FaDumbbell, color: 'from-green-500 to-emerald-600' },
            { label: 'Add Meal Plan', icon: FaUtensils, color: 'from-orange-500 to-amber-600' },
            { label: 'View Reports',  icon: FaFileAlt,  color: 'from-blue-500 to-indigo-600' },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={() => toast.success(`${a.label} clicked!`)}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${a.color} text-white font-bold rounded-xl shadow-lg text-xs transition-all hover:scale-[1.03]`}>
                <Icon size={13} /> {a.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── USERS TAB ── */
function UsersTab() {
  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage]             = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'all') params.role = roleFilter;
      const { data: res } = await adminAPI.getUsers(params);
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setTotal((t) => t - 1);
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-5">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="input-dark pl-9" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-dark sm:w-40">
          <option value="all" className="bg-gray-800">All Roles</option>
          <option value="user" className="bg-gray-800">User</option>
          <option value="trainer" className="bg-gray-800">Trainer</option>
          <option value="admin" className="bg-gray-800">Admin</option>
        </select>
      </motion.div>

      {loading ? (
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading users...</p>
        </div>
      ) : (
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-700/30 flex items-center justify-between">
            <p className="text-gray-400 text-xs">{total} users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/60">
                  {['User', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={i % 2 === 0 ? 'bg-gray-900/10' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} gradient={nameToGradient(u.name)} />
                        <div>
                          <p className="text-white text-xs font-semibold">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(u._id)} className={`transition-colors ${u.isActive !== false ? 'text-green-400 hover:text-green-300' : 'text-gray-600 hover:text-gray-400'}`}>
                        {u.isActive !== false ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteUser(u._id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all">
                        <FiTrash2 size={11} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-600 py-10 text-sm">No users match your search.</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── EXERCISES TAB ── */
function ExercisesTab() {
  const [exercises,  setExercises]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await exerciseAPI.getAll({ limit: 50 });
      setExercises(res.data || []);
    } catch {
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (ex) => { setEditTarget(ex); setModalOpen(true); };

  const toggleFeatured = async (id) => {
    try {
      await exerciseAPI.toggleFeatured(id);
      setExercises((prev) => prev.map((e) => e._id === id ? { ...e, isFeatured: !e.isFeatured } : e));
      toast.success('Featured status updated');
    } catch {
      toast.error('Failed to update featured status');
    }
  };

  const deleteEx = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await exerciseAPI.delete(id);
      setExercises((prev) => prev.filter((e) => e._id !== id));
      toast.success('Exercise deleted');
    } catch {
      toast.error('Failed to delete exercise');
    }
  };

  const handleSave = async (form) => {
    try {
      if (editTarget) {
        const { data: res } = await exerciseAPI.update(editTarget._id, form);
        setExercises((prev) => prev.map((e) => e._id === editTarget._id ? res.data : e));
      } else {
        const { data: res } = await exerciseAPI.create(form);
        setExercises((prev) => [res.data, ...prev]);
      }
    } catch {
      toast.error('Failed to save exercise');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-5">
      <motion.div variants={fadeUp} className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">{exercises.length} exercises</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 text-xs transition-all hover:scale-[1.03]">
          <FiPlus size={13} /> Add Exercise
        </button>
      </motion.div>

      {loading ? (
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading exercises...</p>
        </div>
      ) : (
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/60">
                  {['Exercise', 'Category', 'Difficulty', 'Duration', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {exercises.map((ex, i) => (
                  <motion.tr key={ex._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={i % 2 === 0 ? 'bg-gray-900/10' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={ex.imageUrl} alt={ex.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-700" />
                        <span className="text-white text-xs font-medium">{ex.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${CAT_COLORS[ex.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                        {(ex.category || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs capitalize">{ex.difficulty}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{ex.duration} min</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(ex._id)}
                        className={`transition-colors ${ex.isFeatured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-400'}`}>
                        <FiStar size={15} fill={ex.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(ex)}
                          className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all">
                          <FiEdit2 size={11} />
                        </button>
                        <button onClick={() => deleteEx(ex._id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all">
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {exercises.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No exercises found.</p>}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && <ExerciseModal key="ex-modal" exercise={editTarget} onClose={() => setModalOpen(false)} onSave={handleSave} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── ANALYTICS TAB ── */
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data: res }) => setAnalytics(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const regData  = analytics?.monthlyRegistrations || [];
  const catData  = analytics?.exerciseCategories   || [];
  const postData = analytics?.postCategories       || [];

  const pieData = postData.length ? postData.map((c) => ({ name: c.name.replace('_', ' '), value: c.count })) : [
    { name: 'Diabetes', value: 30 }, { name: 'Nutrition', value: 25 },
    { name: 'Exercise', value: 25 }, { name: 'General', value: 20 },
  ];

  if (loading) return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5 animate-pulse">
          <div className="h-4 w-40 bg-gray-700/60 rounded mb-5" />
          <div className="h-56 bg-gray-700/30 rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1 text-sm">User Registrations</h3>
          <p className="text-gray-500 text-xs mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={regData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="users" stroke={GREEN} strokeWidth={2.5} name="Users" dot={false} activeDot={{ r: 5, fill: '#4ade80', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1 text-sm">Exercise Categories</h3>
          <p className="text-gray-500 text-xs mb-4">By count</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill={GREEN} radius={[6, 6, 0, 0]} name="Exercises" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-1 text-sm">Post Categories</h3>
        <p className="text-gray-500 text-xs mb-4">Distribution of community posts</p>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => v} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12 }} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 md:w-64 flex-shrink-0">
            {pieData.map((g, i) => (
              <div key={g.name} className="bg-gray-700/30 rounded-xl p-3">
                <div className="w-3 h-3 rounded-full mb-1" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <p className="text-white font-black text-lg">{g.value}</p>
                <p className="text-gray-500 text-xs capitalize">{g.name}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── NAV ── */
const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: FiGrid },
  { id: 'users',     label: 'Users',      icon: FiUsers },
  { id: 'exercises', label: 'Exercises',  icon: FiActivity },
  { id: 'meals',     label: 'Meal Plans', icon: FiBookOpen },
  { id: 'community', label: 'Community',  icon: FiMessageSquare },
  { id: 'analytics', label: 'Analytics',  icon: FiBarChart2 },
  { id: 'settings',  label: 'Settings',   icon: FiSettings },
];

/* ══ MAIN ══ */
export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [active, setActive]         = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashData, setDashData]     = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data: res }) => setDashData(res.data))
      .catch(() => {})
      .finally(() => setDashLoading(false));
  }, []);

  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <DashboardTab data={dashData} loading={dashLoading} />;
      case 'users':     return <UsersTab />;
      case 'exercises': return <ExercisesTab />;
      case 'analytics': return <AnalyticsTab />;
      default: return (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-4">🚧</p>
          <h3 className="text-white font-black text-xl mb-2 capitalize">{active} Management</h3>
          <p className="text-gray-500 text-sm">This section is under development.</p>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-950/70 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-gray-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <FaDumbbell className="text-white" size={14} />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">FitTrack</p>
              <p className="text-green-400 text-xs font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800/60">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <Avatar name={user?.name || 'Admin'} gradient="from-red-500 to-rose-600" size="w-8 h-8" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email || 'admin@fittrack.com'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/60 px-5 py-4 flex items-center gap-4 lg:hidden sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400">
            <FiGrid size={15} />
          </button>
          <span className="text-white font-black text-sm">Admin Dashboard</span>
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-black text-white capitalize">
              {NAV.find((n) => n.id === active)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'} — manage your FitTrack platform
            </p>
          </div>
          <AnimatePresence mode="wait">
            <div key={active}>{renderContent()}</div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
