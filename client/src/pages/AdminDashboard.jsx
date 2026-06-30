import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiGrid, FiUsers, FiActivity, FiBookOpen, FiMessageSquare,
  FiBarChart2, FiSettings, FiLogOut, FiX, FiPlus, FiEdit2,
  FiTrash2, FiSearch, FiTrendingUp, FiTrendingDown, FiCheck,
  FiToggleLeft, FiToggleRight, FiStar, FiSave,
} from 'react-icons/fi';
import { FaDumbbell, FaUtensils, FaFileAlt } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { adminAPI, exerciseAPI, mealAPI, communityAPI } from '../utils/api';

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
  balance:           'bg-teal-500/15 text-teal-400 border-teal-500/20',
};
const MEAL_CAT_COLORS = {
  diabetes_management: 'bg-green-500/15 text-green-400 border-green-500/20',
  weight_loss:         'bg-red-500/15 text-red-400 border-red-500/20',
  muscle_building:     'bg-blue-500/15 text-blue-400 border-blue-500/20',
  weight_gain:         'bg-orange-500/15 text-orange-400 border-orange-500/20',
  maintenance:         'bg-gray-500/15 text-gray-400 border-gray-500/20',
};
const POST_CAT_COLORS = {
  success_story: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  diabetes:      'bg-blue-500/15 text-blue-400 border-blue-500/20',
  nutrition:     'bg-green-500/15 text-green-400 border-green-500/20',
  exercise:      'bg-orange-500/15 text-orange-400 border-orange-500/20',
  general:       'bg-gray-500/15 text-gray-400 border-gray-500/20',
  motivation:    'bg-purple-500/15 text-purple-400 border-purple-500/20',
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

function Spinner({ size = 'w-4 h-4' }) {
  return <div className={`${size} border-2 border-white/30 border-t-white rounded-full animate-spin`} />;
}

function LoadingBox() {
  return (
    <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-8 text-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
}

/* ── FOOD ROWS (meal items) ── */
function FoodRows({ items, onChange }) {
  const blank = { name: '', calories: '' };
  const update = (i, field, val) => { const n = [...items]; n[i] = { ...n[i], [field]: val }; onChange(n); };
  const add    = () => onChange([...items, { ...blank }]);
  const remove = (i) => items.length > 1 && onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item.name} onChange={(e) => update(i, 'name', e.target.value)}
            placeholder="Food name" className="input-dark flex-1 text-xs py-2" />
          <input type="number" value={item.calories} onChange={(e) => update(i, 'calories', e.target.value)}
            placeholder="kcal" className="input-dark w-20 text-xs py-2" />
          <button type="button" onClick={() => remove(i)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
            <FiX size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors">
        <FiPlus size={11} /> Add item
      </button>
    </div>
  );
}

/* ── EXERCISE MODAL ── */
function ExerciseModal({ exercise, onClose, onSuccess }) {
  const blankItem = { name: '', calories: '' };
  const [form, setForm] = useState(exercise ? {
    ...exercise,
    instructions: exercise.instructions?.length ? exercise.instructions : [''],
    tags: Array.isArray(exercise.tags) ? exercise.tags.join(', ') : (exercise.tags || ''),
  } : {
    title: '', description: '', category: 'cardio', difficulty: 'beginner',
    duration: '', caloriesBurn: '', imageUrl: '', instructions: [''], tags: '',
  });
  const [saving, setSaving] = useState(false);

  const updateInstruction = (i, val) => { const arr = [...form.instructions]; arr[i] = val; setForm({ ...form, instructions: arr }); };
  const addInstruction    = () => setForm({ ...form, instructions: [...form.instructions, ''] });
  const removeInstruction = (i) => setForm({ ...form, instructions: form.instructions.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: +form.duration || 0,
        caloriesBurn: +form.caloriesBurn || 0,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        instructions: form.instructions.filter((s) => s.trim()),
      };
      const { data: res } = exercise
        ? await exerciseAPI.update(exercise._id, payload)
        : await exerciseAPI.create(payload);
      toast.success(exercise ? 'Exercise updated!' : 'Exercise added!');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save exercise');
    } finally {
      setSaving(false);
    }
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
                  <option key={c} value={c} className="bg-gray-800 capitalize">{c.replace(/_/g, ' ')}</option>
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
          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-sm flex items-center justify-center gap-2">
            {saving ? <Spinner /> : null}
            {saving ? 'Saving...' : exercise ? 'Save Changes' : 'Add Exercise'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── MEAL MODAL ── */
const BLANK_MEAL_ITEM = { name: '', calories: '' };
const blankMealForm = () => ({
  title: '', description: '', category: 'diabetes_management',
  totalCalories: '', duration: '7 days', imageUrl: '', tags: '',
  breakfast: [{ ...BLANK_MEAL_ITEM }],
  lunch:     [{ ...BLANK_MEAL_ITEM }],
  dinner:    [{ ...BLANK_MEAL_ITEM }],
  snacks:    [{ ...BLANK_MEAL_ITEM }],
});

function MealModal({ plan, onClose, onSuccess }) {
  const [form, setForm] = useState(() => {
    if (!plan) return blankMealForm();
    return {
      title:         plan.title || '',
      description:   plan.description || '',
      category:      plan.category || 'diabetes_management',
      totalCalories: plan.totalCalories || '',
      duration:      plan.duration || '7 days',
      imageUrl:      plan.imageUrl || '',
      tags:          (plan.tags || []).join(', '),
      breakfast: plan.meals?.breakfast?.length ? plan.meals.breakfast : [{ ...BLANK_MEAL_ITEM }],
      lunch:     plan.meals?.lunch?.length     ? plan.meals.lunch     : [{ ...BLANK_MEAL_ITEM }],
      dinner:    plan.meals?.dinner?.length    ? plan.meals.dinner    : [{ ...BLANK_MEAL_ITEM }],
      snacks:    plan.meals?.snacks?.length    ? plan.meals.snacks    : [{ ...BLANK_MEAL_ITEM }],
    };
  });
  const [saving, setSaving] = useState(false);

  const MEAL_SECTIONS = [
    { key: 'breakfast', emoji: '🌅' },
    { key: 'lunch',     emoji: '☀️' },
    { key: 'dinner',    emoji: '🌙' },
    { key: 'snacks',    emoji: '🍎' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const mapItems = (items) =>
        (items || []).filter((i) => i.name?.trim()).map((i) => ({
          name: i.name, calories: +i.calories || 0, protein: 0, carbs: 0, fat: 0,
        }));
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        totalCalories: +form.totalCalories || 0,
        duration: form.duration,
        imageUrl: form.imageUrl,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        meals: {
          breakfast: mapItems(form.breakfast),
          lunch:     mapItems(form.lunch),
          dinner:    mapItems(form.dinner),
          snacks:    mapItems(form.snacks),
        },
      };
      const { data: res } = plan
        ? await mealAPI.update(plan._id, payload)
        : await mealAPI.create(payload);
      toast.success(plan ? 'Meal plan updated!' : 'Meal plan added!');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save meal plan');
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-white font-black text-lg">{plan ? 'Edit Meal Plan' : 'Add Meal Plan'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <FiX size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark" placeholder="Meal plan title" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark resize-none" placeholder="Brief description..." />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-dark">
                {['diabetes_management','weight_loss','muscle_building','weight_gain','maintenance'].map((c) => (
                  <option key={c} value={c} className="bg-gray-800 capitalize">{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Duration</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-dark" placeholder="7 days" />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Total Calories / Day</label>
              <input type="number" value={form.totalCalories} onChange={(e) => setForm({ ...form, totalCalories: e.target.value })} className="input-dark" placeholder="1400" />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-dark" placeholder="diabetes, low-carb" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input-dark" placeholder="https://..." />
            </div>
          </div>

          {MEAL_SECTIONS.map(({ key, emoji }) => (
            <div key={key} className="bg-gray-800/40 rounded-xl p-4">
              <h4 className="text-white font-bold text-xs capitalize mb-3 flex items-center gap-2">
                <span>{emoji}</span> {key}
              </h4>
              <FoodRows items={form[key]} onChange={(updated) => setForm({ ...form, [key]: updated })} />
            </div>
          ))}

          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-sm flex items-center justify-center gap-2">
            {saving ? <Spinner /> : null}
            {saving ? 'Saving...' : plan ? 'Save Changes' : 'Add Meal Plan'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── DASHBOARD TAB ── */
function DashboardTab({ data, loading, onNavigate }) {
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
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.isApproved ? 'bg-green-400' : 'bg-yellow-400'}`} title={p.isApproved ? 'Approved' : 'Pending'} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('exercises')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 text-xs transition-all hover:scale-[1.03]">
            <FaDumbbell size={13} /> Add Exercise
          </button>
          <button onClick={() => onNavigate('meals')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-xs transition-all hover:scale-[1.03]">
            <FaUtensils size={13} /> Add Meal Plan
          </button>
          <button onClick={() => onNavigate('community')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 text-xs transition-all hover:scale-[1.03]">
            <FiMessageSquare size={13} /> Moderate Posts
          </button>
          <button onClick={() => onNavigate('analytics')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 text-xs transition-all hover:scale-[1.03]">
            <FaFileAlt size={13} /> View Analytics
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── USERS TAB ── */
function UsersTab() {
  const { user: currentUser } = useAuth();
  const [users,       setUsers]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [page,        setPage]        = useState(1);
  const [editRoleId,  setEditRoleId]  = useState(null);
  const [pendingRole, setPendingRole] = useState('');
  const [busyId,      setBusyId]      = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim())      params.search = search.trim();
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

  const startEditRole = (u) => { setEditRoleId(u._id); setPendingRole(u.role); };
  const cancelEditRole = () => { setEditRoleId(null); setPendingRole(''); };

  const saveRole = async (id) => {
    setBusyId(id);
    try {
      await adminAPI.updateUserRole(id, pendingRole);
      toast.success('Role updated successfully');
      setEditRoleId(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (id) => {
    setBusyId(id);
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success('User status updated');
      await fetchUsers();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  const pages = Math.ceil(total / 10);

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

      {loading ? <LoadingBox /> : (
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
                {users.map((u, i) => {
                  const isBusy      = busyId === u._id;
                  const isEditRole  = editRoleId === u._id;
                  const isSelf      = u._id === currentUser?._id;
                  return (
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
                        {isEditRole ? (
                          <div className="flex items-center gap-1.5">
                            <select value={pendingRole} onChange={(e) => setPendingRole(e.target.value)}
                              className="bg-gray-700 border border-gray-600 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-green-500/50">
                              <option value="user">user</option>
                              <option value="trainer">trainer</option>
                              <option value="admin">admin</option>
                            </select>
                            <button onClick={() => saveRole(u._id)} disabled={isBusy}
                              className="w-6 h-6 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 flex items-center justify-center transition-all">
                              {isBusy ? <Spinner size="w-3 h-3" /> : <FiCheck size={11} />}
                            </button>
                            <button onClick={cancelEditRole}
                              className="w-6 h-6 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 flex items-center justify-center transition-all">
                              <FiX size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role}</span>
                            {!isSelf && (
                              <button onClick={() => startEditRole(u)}
                                className="w-5 h-5 rounded-md bg-gray-700/60 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 flex items-center justify-center transition-all">
                                <FiEdit2 size={9} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => !isSelf && toggleActive(u._id)} disabled={isBusy || isSelf}
                          className={`transition-colors ${isSelf ? 'opacity-30 cursor-not-allowed' : ''} ${u.isActive !== false ? 'text-green-400 hover:text-green-300' : 'text-gray-600 hover:text-gray-400'}`}>
                          {isBusy ? <Spinner size="w-4 h-4" /> : u.isActive !== false ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => !isSelf && deleteUser(u._id)} disabled={isBusy || isSelf}
                          className={`w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all ${isSelf ? 'opacity-30 cursor-not-allowed' : ''}`}>
                          {isBusy ? <Spinner size="w-3 h-3" /> : <FiTrash2 size={11} />}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No users match your search.</p>}
          </div>
          {pages > 1 && (
            <div className="px-5 py-3 border-t border-gray-700/30 flex items-center justify-between">
              <p className="text-gray-500 text-xs">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-xs rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-all">Prev</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-xs rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-all">Next</button>
              </div>
            </div>
          )}
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
  const [busyId,     setBusyId]     = useState(null);

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

  const handleSuccess = (saved) => {
    if (editTarget) {
      setExercises((prev) => prev.map((e) => e._id === saved._id ? saved : e));
    } else {
      setExercises((prev) => [saved, ...prev]);
    }
  };

  const toggleFeatured = async (id, current) => {
    setBusyId(id);
    try {
      await exerciseAPI.toggleFeatured(id);
      setExercises((prev) => prev.map((e) => e._id === id ? { ...e, isFeatured: !current } : e));
      toast.success(current ? 'Removed from featured' : 'Added to featured');
    } catch {
      toast.error('Failed to update featured status');
    } finally {
      setBusyId(null);
    }
  };

  const deleteEx = async (id) => {
    if (!window.confirm('Delete this exercise? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await exerciseAPI.delete(id);
      setExercises((prev) => prev.filter((e) => e._id !== id));
      toast.success('Exercise deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete exercise');
    } finally {
      setBusyId(null);
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

      {loading ? <LoadingBox /> : (
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
                {exercises.map((ex, i) => {
                  const isBusy = busyId === ex._id;
                  return (
                    <motion.tr key={ex._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className={i % 2 === 0 ? 'bg-gray-900/10' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={ex.imageUrl} alt={ex.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-700" />
                          <span className="text-white text-xs font-medium">{ex.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${CAT_COLORS[ex.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                          {(ex.category || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs capitalize">{ex.difficulty}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{ex.duration} min</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleFeatured(ex._id, ex.isFeatured)} disabled={isBusy}
                          className={`transition-colors ${ex.isFeatured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-400'}`}>
                          {isBusy ? <Spinner size="w-3.5 h-3.5" /> : <FiStar size={15} fill={ex.isFeatured ? 'currentColor' : 'none'} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(ex)}
                            className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all">
                            <FiEdit2 size={11} />
                          </button>
                          <button onClick={() => deleteEx(ex._id)} disabled={isBusy}
                            className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all">
                            {isBusy ? <Spinner size="w-3 h-3" /> : <FiTrash2 size={11} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {exercises.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No exercises found.</p>}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ExerciseModal key="ex-modal" exercise={editTarget} onClose={() => setModalOpen(false)} onSuccess={handleSuccess} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── MEAL PLANS TAB ── */
function MealPlansTab() {
  const [plans,      setPlans]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [busyId,     setBusyId]     = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await mealAPI.getAll({ limit: 50 });
      setPlans(res.data || []);
    } catch {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (p) => { setEditTarget(p); setModalOpen(true); };

  const handleSuccess = (saved) => {
    if (editTarget) {
      setPlans((prev) => prev.map((p) => p._id === saved._id ? saved : p));
    } else {
      setPlans((prev) => [saved, ...prev]);
    }
  };

  const toggleFeatured = async (id, current) => {
    setBusyId(id);
    try {
      const { data: res } = await mealAPI.update(id, { isFeatured: !current });
      setPlans((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: !current } : p));
      toast.success(current ? 'Removed from featured' : 'Added to featured');
    } catch {
      toast.error('Failed to update featured status');
    } finally {
      setBusyId(null);
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this meal plan? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await mealAPI.delete(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      toast.success('Meal plan deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete meal plan');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-5">
      <motion.div variants={fadeUp} className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">{plans.length} meal plans</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-xs transition-all hover:scale-[1.03]">
          <FiPlus size={13} /> Add Meal Plan
        </button>
      </motion.div>

      {loading ? <LoadingBox /> : (
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/60">
                  {['Meal Plan', 'Category', 'Calories/Day', 'Duration', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {plans.map((p, i) => {
                  const isBusy = busyId === p._id;
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className={i % 2 === 0 ? 'bg-gray-900/10' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-700" onError={(e) => { e.target.style.display = 'none'; }} />
                          <span className="text-white text-xs font-medium">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${MEAL_CAT_COLORS[p.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                          {(p.category || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{(p.totalCalories || 0).toLocaleString()} kcal</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{p.duration}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleFeatured(p._id, p.isFeatured)} disabled={isBusy}
                          className={`transition-colors ${p.isFeatured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-400'}`}>
                          {isBusy ? <Spinner size="w-3.5 h-3.5" /> : <FiStar size={15} fill={p.isFeatured ? 'currentColor' : 'none'} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)}
                            className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all">
                            <FiEdit2 size={11} />
                          </button>
                          <button onClick={() => deletePlan(p._id)} disabled={isBusy}
                            className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all">
                            {isBusy ? <Spinner size="w-3 h-3" /> : <FiTrash2 size={11} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {plans.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No meal plans found.</p>}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <MealModal key="meal-modal" plan={editTarget} onClose={() => setModalOpen(false)} onSuccess={handleSuccess} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── COMMUNITY TAB ── */
function CommunityTab() {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [busyId,   setBusyId]   = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await adminAPI.getPosts({ limit: 50 });
      setPosts(res.data || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const approvePost = async (id) => {
    setBusyId(id);
    try {
      await adminAPI.approvePost(id);
      setPosts((prev) => prev.map((p) => p._id === id ? { ...p, isApproved: true } : p));
      toast.success('Post approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve post');
    } finally {
      setBusyId(null);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await communityAPI.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-5">
      <motion.div variants={fadeUp} className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">{posts.length} posts</p>
        <button onClick={fetchPosts} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700/40 hover:border-green-500/30 text-gray-300 text-xs font-medium rounded-xl transition-all">
          ↻ Refresh
        </button>
      </motion.div>

      {loading ? <LoadingBox /> : (
        <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/60">
                  {['Title', 'Author', 'Category', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {posts.map((p, i) => {
                  const isBusy = busyId === p._id;
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className={i % 2 === 0 ? 'bg-gray-900/10' : ''}>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-white text-xs font-medium truncate">{p.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{p.author?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${POST_CAT_COLORS[p.category] || POST_CAT_COLORS.general}`}>
                          {(p.category || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.isApproved ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                          {p.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!p.isApproved && (
                            <button onClick={() => approvePost(p._id)} disabled={isBusy}
                              className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-all" title="Approve">
                              {isBusy ? <Spinner size="w-3 h-3" /> : <FiCheck size={11} />}
                            </button>
                          )}
                          <button onClick={() => deletePost(p._id)} disabled={isBusy}
                            className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all" title="Delete">
                            {isBusy ? <Spinner size="w-3 h-3" /> : <FiTrash2 size={11} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {posts.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">No posts found.</p>}
          </div>
        </motion.div>
      )}
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
];

/* ══ MAIN ══ */
export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [active,      setActive]      = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashData,    setDashData]    = useState(null);
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
      case 'dashboard': return <DashboardTab data={dashData} loading={dashLoading} onNavigate={setActive} />;
      case 'users':     return <UsersTab />;
      case 'exercises': return <ExercisesTab />;
      case 'meals':     return <MealPlansTab />;
      case 'community': return <CommunityTab />;
      case 'analytics': return <AnalyticsTab />;
      default: return null;
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
