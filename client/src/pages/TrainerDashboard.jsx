import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiPlus, FiX, FiEdit2, FiTrash2, FiSend,
  FiUser, FiMail, FiActivity,
} from 'react-icons/fi';
import { FaDumbbell, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { exerciseAPI, mealAPI } from '../utils/api';

/* ── static mock data for students (no students API yet) ── */
const MY_STUDENTS = [
  { id: 1, name: 'Kamran Ali',   email: 'kamran@mail.com',   avatar: 'from-cyan-500 to-blue-600',     goal: 'Lose Weight',  bmi: 27.7, lastLog: '2 hours ago', workouts: 5, streak: 12 },
  { id: 2, name: 'Ayesha Noor',  email: 'ayesha@mail.com',   avatar: 'from-purple-500 to-violet-600', goal: 'Maintain',     bmi: 22.1, lastLog: '1 day ago',   workouts: 3, streak: 4 },
  { id: 3, name: 'Bilal Ahmed',  email: 'bilal@mail.com',    avatar: 'from-orange-500 to-amber-600',  goal: 'Build Muscle', bmi: 24.8, lastLog: '3 days ago', workouts: 2, streak: 1 },
  { id: 4, name: 'Zara Sheikh',  email: 'zara@mail.com',     avatar: 'from-teal-500 to-cyan-600',     goal: 'Lose Weight',  bmi: 29.3, lastLog: 'Just now',    workouts: 6, streak: 21 },
  { id: 5, name: 'Hassan Raza',  email: 'hassan@mail.com',   avatar: 'from-indigo-500 to-purple-600', goal: 'Maintain',     bmi: 23.5, lastLog: '2 days ago', workouts: 4, streak: 7 },
];

const CATEGORY_COLORS = {
  diabetes_friendly:   'bg-green-500/15 text-green-400 border-green-500/20',
  diabetes_management: 'bg-green-500/15 text-green-400 border-green-500/20',
  cardio:              'bg-orange-500/15 text-orange-400 border-orange-500/20',
  strength:            'bg-blue-500/15 text-blue-400 border-blue-500/20',
  yoga:                'bg-purple-500/15 text-purple-400 border-purple-500/20',
  flexibility:         'bg-pink-500/15 text-pink-400 border-pink-500/20',
  balance:             'bg-teal-500/15 text-teal-400 border-teal-500/20',
  weight_loss:         'bg-red-500/15 text-red-400 border-red-500/20',
  muscle_building:     'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  weight_gain:         'bg-orange-500/15 text-orange-400 border-orange-500/20',
  maintenance:         'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const TABS = [
  { id: 'content',  label: 'My Content',    icon: FiActivity },
  { id: 'exercise', label: 'Add Exercise',  icon: FaDumbbell },
  { id: 'meal',     label: 'Add Meal Plan', icon: FaUtensils },
  { id: 'students', label: 'My Students',   icon: FiUser },
];

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32 } } };

function Avatar({ name, gradient, size = 'w-9 h-9', text = 'text-sm' }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Spinner({ size = 'w-4 h-4' }) {
  return <div className={`${size} border-2 border-white/30 border-t-white rounded-full animate-spin`} />;
}

/* ── FOOD ROWS ── */
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

/* ── EXERCISE EDIT MODAL ── */
function ExerciseModal({ exercise, onClose, onSuccess }) {
  const [form, setForm] = useState({
    ...exercise,
    instructions: exercise.instructions?.length ? exercise.instructions : [''],
    tags: Array.isArray(exercise.tags) ? exercise.tags.join(', ') : (exercise.tags || ''),
  });
  const [saving, setSaving] = useState(false);

  const updateInstruction = (i, val) => { const arr = [...form.instructions]; arr[i] = val; setForm({ ...form, instructions: arr }); };
  const addInstruction    = () => setForm({ ...form, instructions: [...form.instructions, ''] });
  const removeInstruction = (i) => form.instructions.length > 1 && setForm({ ...form, instructions: form.instructions.filter((_, idx) => idx !== i) });

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
      const { data: res } = await exerciseAPI.update(exercise._id, payload);
      toast.success('Exercise updated!');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update exercise');
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
        className="bg-gray-900 border border-gray-700/60 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-white font-black text-lg">Edit Exercise</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <FiX size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark" required />
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-dark" />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Calories Burn</label>
              <input type="number" value={form.caloriesBurn} onChange={(e) => setForm({ ...form, caloriesBurn: e.target.value })} className="input-dark" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-300 text-xs font-medium">Instructions</label>
              <button type="button" onClick={addInstruction} className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs transition-colors">
                <FiPlus size={11} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.instructions.map((inst, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <input value={inst} onChange={(e) => updateInstruction(i, e.target.value)} className="input-dark flex-1" />
                  {form.instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(i)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <FiX size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
            {saving ? <Spinner /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── MEAL EDIT MODAL ── */
const BLANK_ITEM = { name: '', calories: '' };

function MealEditModal({ plan, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title:         plan.title || '',
    description:   plan.description || '',
    category:      plan.category || 'diabetes_management',
    totalCalories: plan.totalCalories || '',
    duration:      plan.duration || '7 days',
    breakfast: plan.meals?.breakfast?.length ? plan.meals.breakfast : [{ ...BLANK_ITEM }],
    lunch:     plan.meals?.lunch?.length     ? plan.meals.lunch     : [{ ...BLANK_ITEM }],
    dinner:    plan.meals?.dinner?.length    ? plan.meals.dinner    : [{ ...BLANK_ITEM }],
    snacks:    plan.meals?.snacks?.length    ? plan.meals.snacks    : [{ ...BLANK_ITEM }],
  });
  const [saving, setSaving] = useState(false);

  const SECTIONS = [
    { key: 'breakfast', emoji: '🌅' }, { key: 'lunch', emoji: '☀️' },
    { key: 'dinner', emoji: '🌙' },    { key: 'snacks', emoji: '🍎' },
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
        meals: {
          breakfast: mapItems(form.breakfast),
          lunch:     mapItems(form.lunch),
          dinner:    mapItems(form.dinner),
          snacks:    mapItems(form.snacks),
        },
      };
      const { data: res } = await mealAPI.update(plan._id, payload);
      toast.success('Meal plan updated!');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update meal plan');
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
        className="bg-gray-900 border border-gray-700/60 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-white font-black text-lg">Edit Meal Plan</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <FiX size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-dark" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-dark" />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Total Calories / Day</label>
              <input type="number" value={form.totalCalories} onChange={(e) => setForm({ ...form, totalCalories: e.target.value })} className="input-dark" />
            </div>
          </div>
          {SECTIONS.map(({ key, emoji }) => (
            <div key={key} className="bg-gray-800/40 rounded-xl p-4">
              <h4 className="text-white font-bold text-xs capitalize mb-3">{emoji} {key}</h4>
              <FoodRows items={form[key]} onChange={(updated) => setForm({ ...form, [key]: updated })} />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
            {saving ? <Spinner /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── BLANK FORM STATES ── */
const blankExercise = () => ({
  title: '', description: '', category: 'cardio', difficulty: 'beginner',
  duration: '', caloriesBurn: '', imageUrl: '',
  instructions: [''],
  tags: '',
});

const blankMeal = () => ({
  title: '', description: '', category: 'diabetes_management',
  totalCalories: '', duration: '',
  breakfast: [{ name: '', calories: '' }],
  lunch:     [{ name: '', calories: '' }],
  dinner:    [{ name: '', calories: '' }],
  snacks:    [{ name: '', calories: '' }],
});

/* ══ TAB: MY CONTENT ══ */
function MyContentTab({ exercises, mealPlans, loadingContent, onEditEx, onDeleteEx, onEditMeal, onDeleteMeal }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-8">

      {/* Exercises */}
      <div>
        <h2 className="text-white font-black text-lg mb-4">
          My Exercises <span className="text-gray-600 font-normal text-sm">({exercises.length})</span>
        </h2>
        {loadingContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-52 bg-gray-800/40 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {exercises.map((ex) => (
              <motion.div key={ex._id} variants={fadeUp} className="group bg-gray-800/50 border border-gray-700/40 hover:border-green-500/20 rounded-2xl overflow-hidden transition-all">
                <div className="relative h-36 overflow-hidden">
                  <img src={ex.imageUrl} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${CATEGORY_COLORS[ex.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                    {(ex.category || '').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm mb-1 truncate">{ex.title}</h3>
                  <p className="text-gray-500 text-xs mb-3">
                    {ex.difficulty} · {ex.duration} min · {ex.caloriesBurn} kcal
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => onEditEx(ex)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-all">
                      <FiEdit2 size={11} /> Edit
                    </button>
                    <button onClick={() => onDeleteEx(ex._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all">
                      <FiTrash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {exercises.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-600">
                <FaDumbbell size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No exercises yet. Add your first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meal Plans */}
      <div>
        <h2 className="text-white font-black text-lg mb-4">
          My Meal Plans <span className="text-gray-600 font-normal text-sm">({mealPlans.length})</span>
        </h2>
        {loadingContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-52 bg-gray-800/40 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {mealPlans.map((mp) => (
              <motion.div key={mp._id} variants={fadeUp} className="group bg-gray-800/50 border border-gray-700/40 hover:border-green-500/20 rounded-2xl overflow-hidden transition-all">
                <div className="relative h-36 overflow-hidden">
                  <img src={mp.imageUrl} alt={mp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${CATEGORY_COLORS[mp.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                    {(mp.category || '').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm mb-1 truncate">{mp.title}</h3>
                  <p className="text-gray-500 text-xs mb-3">{mp.totalCalories} kcal/day · {mp.duration}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onEditMeal(mp)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-all">
                      <FiEdit2 size={11} /> Edit
                    </button>
                    <button onClick={() => onDeleteMeal(mp._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all">
                      <FiTrash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {mealPlans.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-600">
                <FaUtensils size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No meal plans yet. Add your first one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ══ TAB: ADD EXERCISE ══ */
function AddExerciseTab({ onAdded }) {
  const [form, setForm]     = useState(blankExercise);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const updateInstruction = (i, val) => {
    const arr = [...form.instructions]; arr[i] = val; setForm({ ...form, instructions: arr });
  };
  const addInstruction    = () => setForm({ ...form, instructions: [...form.instructions, ''] });
  const removeInstruction = (i) => form.instructions.length > 1 && setForm({ ...form, instructions: form.instructions.filter((_, idx) => idx !== i) });

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.duration)           e.duration    = 'Duration is required';
    if (!form.caloriesBurn)       e.caloriesBurn = 'Calories is required';
    const filled = form.instructions.filter((s) => s.trim());
    if (filled.length === 0)      e.instructions = 'At least one instruction required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        title:        form.title,
        description:  form.description,
        category:     form.category,
        difficulty:   form.difficulty,
        duration:     +form.duration,
        caloriesBurn: +form.caloriesBurn,
        imageUrl:     form.imageUrl || '',
        instructions: form.instructions.filter((s) => s.trim()),
        tags:         form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      const { data: res } = await exerciseAPI.create(payload);
      onAdded(res.data);
      setForm(blankExercise());
      setErrors({});
      toast.success('Exercise added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add exercise');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, extra = {}) => (
    <div>
      <label className="block text-gray-300 text-xs font-medium mb-1.5">{label}</label>
      <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`input-dark ${errors[key] ? 'border-red-500/50' : ''}`} {...extra} />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-2xl">
        <h2 className="text-white font-black text-xl mb-6">Add New Exercise</h2>
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-6 space-y-5">
          {field('Title *', 'title', { placeholder: 'e.g. Morning Brisk Walk' })}

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Description *</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the exercise..."
              className={`input-dark resize-none ${errors.description ? 'border-red-500/50' : ''}`} />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Duration (min) *</label>
              <input type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="30" className={`input-dark ${errors.duration ? 'border-red-500/50' : ''}`} />
              {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Calories Burn *</label>
              <input type="number" min="1" value={form.caloriesBurn} onChange={(e) => setForm({ ...form, caloriesBurn: e.target.value })}
                placeholder="150" className={`input-dark ${errors.caloriesBurn ? 'border-red-500/50' : ''}`} />
              {errors.caloriesBurn && <p className="text-red-400 text-xs mt-1">{errors.caloriesBurn}</p>}
            </div>
          </div>

          {field('Image URL', 'imageUrl', { placeholder: 'https://images.unsplash.com/...' })}
          {field('Tags (comma-separated)', 'tags', { placeholder: 'cardio, diabetes, low-impact' })}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-300 text-xs font-medium">Instructions *</label>
              <button type="button" onClick={addInstruction} className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors">
                <FiPlus size={11} /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {form.instructions.map((inst, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <input value={inst} onChange={(e) => updateInstruction(i, e.target.value)}
                    placeholder={`Step ${i + 1}...`}
                    className={`input-dark flex-1 ${errors.instructions && i === 0 ? 'border-red-500/50' : ''}`} />
                  {form.instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(i)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <FiX size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.instructions && <p className="text-red-400 text-xs mt-1">{errors.instructions}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-sm">
            {loading ? <Spinner /> : <FiSend size={14} />}
            {loading ? 'Adding...' : 'Add Exercise'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* ══ TAB: ADD MEAL PLAN ══ */
function AddMealPlanTab({ onAdded }) {
  const [form, setForm]     = useState(blankMeal);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const MEAL_SECTIONS = ['breakfast', 'lunch', 'dinner', 'snacks'];

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.totalCalories)      e.totalCalories = 'Total calories is required';
    if (!form.duration.trim())    e.duration    = 'Duration is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const mapItems = (items) =>
        (items || []).filter((i) => i.name?.trim()).map((i) => ({
          name: i.name, calories: +i.calories || 0, protein: 0, carbs: 0, fat: 0,
        }));
      const payload = {
        title:         form.title,
        description:   form.description,
        category:      form.category,
        totalCalories: +form.totalCalories,
        duration:      form.duration,
        imageUrl:      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300',
        meals: {
          breakfast: mapItems(form.breakfast),
          lunch:     mapItems(form.lunch),
          dinner:    mapItems(form.dinner),
          snacks:    mapItems(form.snacks),
        },
      };
      const { data: res } = await mealAPI.create(payload);
      onAdded(res.data);
      setForm(blankMeal());
      setErrors({});
      toast.success('Meal plan added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-2xl">
        <h2 className="text-white font-black text-xl mb-6">Add New Meal Plan</h2>
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 7-Day Diabetes Meal Plan"
              className={`input-dark ${errors.title ? 'border-red-500/50' : ''}`} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1.5">Description *</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief overview of this meal plan..."
              className={`input-dark resize-none ${errors.description ? 'border-red-500/50' : ''}`} />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-dark">
                {['diabetes_management','weight_loss','muscle_building','weight_gain','maintenance'].map((c) => (
                  <option key={c} value={c} className="bg-gray-800 capitalize">{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Duration *</label>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 7 days, 4 weeks"
                className={`input-dark ${errors.duration ? 'border-red-500/50' : ''}`} />
              {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1.5">Total Calories / Day *</label>
              <input type="number" min="500" value={form.totalCalories} onChange={(e) => setForm({ ...form, totalCalories: e.target.value })}
                placeholder="e.g. 1400"
                className={`input-dark ${errors.totalCalories ? 'border-red-500/50' : ''}`} />
              {errors.totalCalories && <p className="text-red-400 text-xs mt-1">{errors.totalCalories}</p>}
            </div>
          </div>

          {MEAL_SECTIONS.map((meal) => (
            <div key={meal} className="bg-gray-900/40 rounded-xl p-4">
              <h4 className="text-white font-bold text-sm capitalize mb-3 flex items-center gap-2">
                <span>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍎'}</span>
                {meal}
              </h4>
              <FoodRows items={form[meal]} onChange={(updated) => setForm({ ...form, [meal]: updated })} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-sm">
            {loading ? <Spinner /> : <FiSend size={14} />}
            {loading ? 'Adding...' : 'Add Meal Plan'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* ══ TAB: MY STUDENTS ══ */
function StudentsTab() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="space-y-4">
      <motion.div variants={fadeUp}>
        <h2 className="text-white font-black text-xl mb-1">My Students</h2>
        <p className="text-gray-500 text-sm mb-5">{MY_STUDENTS.length} assigned students</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MY_STUDENTS.map((s) => (
          <motion.div key={s.id} variants={fadeUp}
            className="bg-gray-800/50 border border-gray-700/40 hover:border-green-500/20 rounded-2xl p-5 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={s.name} gradient={s.avatar} size="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{s.name}</p>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <FiMail size={10} /> {s.email}
                </p>
              </div>
              <span className="text-gray-500 text-xs">Last: {s.lastLog}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'BMI',      value: s.bmi,         color: s.bmi < 25 ? 'text-green-400' : s.bmi < 30 ? 'text-yellow-400' : 'text-red-400' },
                { label: 'Workouts', value: `${s.workouts}/wk`, color: 'text-blue-400' },
                { label: 'Streak',   value: `${s.streak}d`,    color: 'text-orange-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-700/30 rounded-xl p-3 text-center">
                  <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600/30 text-gray-300 text-xs">
                Goal: {s.goal}
              </span>
              <button onClick={() => toast.success(`Message sent to ${s.name}!`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-medium transition-all">
                <FiSend size={11} /> Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══ MAIN ══ */
export default function TrainerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab,     setActiveTab]     = useState('content');
  const [exercises,     setExercises]     = useState([]);
  const [mealPlans,     setMealPlans]     = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [editEx,        setEditEx]        = useState(null);
  const [editMeal,      setEditMeal]      = useState(null);

  const fetchExercises = useCallback(async () => {
    try {
      const { data: res } = await exerciseAPI.getAll({ limit: 50, createdBy: 'me' });
      setExercises(res.data || []);
    } catch { /* ignore */ }
  }, []);

  const fetchMeals = useCallback(async () => {
    try {
      const { data: res } = await mealAPI.getAll({ limit: 50 });
      setMealPlans(res.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setLoadingContent(true);
    Promise.all([fetchExercises(), fetchMeals()]).finally(() => setLoadingContent(false));
  }, [fetchExercises, fetchMeals]);

  if (!isAuthenticated || (user?.role !== 'trainer' && user?.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  const handleDeleteEx = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await exerciseAPI.delete(id);
      setExercises((prev) => prev.filter((e) => e._id !== id));
      toast.success('Exercise deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete exercise');
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Delete this meal plan?')) return;
    try {
      await mealAPI.delete(id);
      setMealPlans((prev) => prev.filter((m) => m._id !== id));
      toast.success('Meal plan deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete meal plan');
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'content':
        return (
          <MyContentTab
            exercises={exercises}
            mealPlans={mealPlans}
            loadingContent={loadingContent}
            onEditEx={setEditEx}
            onDeleteEx={handleDeleteEx}
            onEditMeal={setEditMeal}
            onDeleteMeal={handleDeleteMeal}
          />
        );
      case 'exercise':
        return (
          <AddExerciseTab
            onAdded={(ex) => { setExercises((p) => [ex, ...p]); setActiveTab('content'); }}
          />
        );
      case 'meal':
        return (
          <AddMealPlanTab
            onAdded={(mp) => { setMealPlans((p) => [mp, ...p]); setActiveTab('content'); }}
          />
        );
      case 'students':
        return <StudentsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      {/* ── HEADER ── */}
      <div className="bg-gray-900 border-b border-gray-800/60 px-5 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white">
              Trainer{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name || 'Trainer'} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
              {(user?.name || 'T').split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-xs font-semibold">{user?.name || 'Trainer'}</p>
              <p className="text-gray-500 text-xs capitalize">{user?.role || 'trainer'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-gray-900/60 border-b border-gray-800/60 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <div key={activeTab}>{renderTab()}</div>
        </AnimatePresence>
      </div>

      {/* ── EDIT MODALS ── */}
      <AnimatePresence>
        {editEx && (
          <ExerciseModal
            key="ex-edit"
            exercise={editEx}
            onClose={() => setEditEx(null)}
            onSuccess={(saved) => { setExercises((prev) => prev.map((e) => e._id === saved._id ? saved : e)); setEditEx(null); }}
          />
        )}
        {editMeal && (
          <MealEditModal
            key="meal-edit"
            plan={editMeal}
            onClose={() => setEditMeal(null)}
            onSuccess={(saved) => { setMealPlans((prev) => prev.map((m) => m._id === saved._id ? saved : m)); setEditMeal(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
