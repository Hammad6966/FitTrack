import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiPlus, FiX, FiEdit2, FiTrash2, FiSend,
  FiUser, FiMail, FiActivity,
} from 'react-icons/fi';
import { FaDumbbell, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

/* ── mock content ── */
const MY_EXERCISES = [
  { id: 1, title: 'Brisk Walking',     category: 'diabetes_friendly', difficulty: 'beginner',     duration: 30, calories: 150, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300' },
  { id: 2, title: 'Chair Yoga',        category: 'yoga',              difficulty: 'beginner',     duration: 20, calories: 60,  image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300' },
  { id: 3, title: 'Resistance Bands',  category: 'diabetes_friendly', difficulty: 'beginner',     duration: 25, calories: 120, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300' },
  { id: 4, title: 'Swimming',          category: 'cardio',            difficulty: 'intermediate', duration: 45, calories: 400, image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=300' },
];

const MY_MEAL_PLANS = [
  { id: 1, title: 'Diabetes-Friendly 7-Day Plan', category: 'diabetes_management', calories: 1250, duration: '7 days',   image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300' },
  { id: 2, title: 'Vegetarian Diabetes Plan',     category: 'diabetes_management', calories: 1372, duration: '7 days',   image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300' },
  { id: 3, title: 'Heart-Healthy Weight Loss',    category: 'weight_loss',         calories: 942,  duration: '4 weeks',  image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300' },
];

const MY_STUDENTS = [
  { id: 1, name: 'Kamran Ali',   email: 'kamran@mail.com',   avatar: 'from-cyan-500 to-blue-600',   goal: 'Lose Weight', bmi: 27.7, lastLog: '2 hours ago',  workouts: 5, streak: 12 },
  { id: 2, name: 'Ayesha Noor',  email: 'ayesha@mail.com',   avatar: 'from-purple-500 to-violet-600', goal: 'Maintain',   bmi: 22.1, lastLog: '1 day ago',    workouts: 3, streak: 4 },
  { id: 3, name: 'Bilal Ahmed',  email: 'bilal@mail.com',    avatar: 'from-orange-500 to-amber-600', goal: 'Build Muscle', bmi: 24.8, lastLog: '3 days ago',  workouts: 2, streak: 1 },
  { id: 4, name: 'Zara Sheikh',  email: 'zara@mail.com',     avatar: 'from-teal-500 to-cyan-600',   goal: 'Lose Weight', bmi: 29.3, lastLog: 'Just now',     workouts: 6, streak: 21 },
  { id: 5, name: 'Hassan Raza',  email: 'hassan@mail.com',   avatar: 'from-indigo-500 to-purple-600', goal: 'Maintain',  bmi: 23.5, lastLog: '2 days ago',   workouts: 4, streak: 7 },
];

const CATEGORY_COLORS = {
  diabetes_friendly:  'bg-green-500/15 text-green-400 border-green-500/20',
  diabetes_management:'bg-green-500/15 text-green-400 border-green-500/20',
  cardio:             'bg-orange-500/15 text-orange-400 border-orange-500/20',
  strength:           'bg-blue-500/15 text-blue-400 border-blue-500/20',
  yoga:               'bg-purple-500/15 text-purple-400 border-purple-500/20',
  weight_loss:        'bg-red-500/15 text-red-400 border-red-500/20',
  muscle_building:    'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  maintenance:        'bg-gray-500/15 text-gray-400 border-gray-500/20',
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

/* ── dynamic list helpers ── */
function FoodRows({ items, onChange }) {
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const add    = () => onChange([...items, { name: '', calories: '' }]);
  const remove = (i) => items.length > 1 && onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item.name} onChange={(e) => update(i, 'name', e.target.value)}
            placeholder="Food name" className="input-dark flex-1 text-xs py-2" />
          <input type="number" value={item.calories} onChange={(e) => update(i, 'calories', e.target.value)}
            placeholder="kcal" className="input-dark w-20 text-xs py-2" />
          <button type="button" onClick={() => remove(i)}
            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
            <FiX size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors">
        <FiPlus size={11} /> Add item
      </button>
    </div>
  );
}

/* ══ TAB: MY CONTENT ══ */
function MyContentTab({ exercises, setExercises, mealPlans, setMealPlans }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-8">
      {/* Exercises */}
      <div>
        <h2 className="text-white font-black text-lg mb-4">My Exercises <span className="text-gray-600 font-normal text-sm">({exercises.length})</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {exercises.map((ex) => (
            <motion.div key={ex.id} variants={fadeUp} className="group bg-gray-800/50 border border-gray-700/40 hover:border-green-500/20 rounded-2xl overflow-hidden transition-all">
              <div className="relative h-36 overflow-hidden">
                <img src={ex.image} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${CATEGORY_COLORS[ex.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                  {ex.category.replace('_', ' ')}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-1 truncate">{ex.title}</h3>
                <p className="text-gray-500 text-xs mb-3">
                  {ex.difficulty} · {ex.duration} min · {ex.calories} kcal
                </p>
                <div className="flex gap-2">
                  <button onClick={() => toast.success('Edit — backend integration coming')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-all">
                    <FiEdit2 size={11} /> Edit
                  </button>
                  <button onClick={() => { setExercises((p) => p.filter((e) => e.id !== ex.id)); toast.success('Exercise removed'); }}
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
      </div>

      {/* Meal Plans */}
      <div>
        <h2 className="text-white font-black text-lg mb-4">My Meal Plans <span className="text-gray-600 font-normal text-sm">({mealPlans.length})</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {mealPlans.map((mp) => (
            <motion.div key={mp.id} variants={fadeUp} className="group bg-gray-800/50 border border-gray-700/40 hover:border-green-500/20 rounded-2xl overflow-hidden transition-all">
              <div className="relative h-36 overflow-hidden">
                <img src={mp.image} alt={mp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${CATEGORY_COLORS[mp.category] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
                  {mp.category.replace('_', ' ')}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-1 truncate">{mp.title}</h3>
                <p className="text-gray-500 text-xs mb-3">{mp.calories} kcal/day · {mp.duration}</p>
                <div className="flex gap-2">
                  <button onClick={() => toast.success('Edit — backend integration coming')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-all">
                    <FiEdit2 size={11} /> Edit
                  </button>
                  <button onClick={() => { setMealPlans((p) => p.filter((m) => m.id !== mp.id)); toast.success('Meal plan removed'); }}
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
      </div>
    </motion.div>
  );
}

/* ══ TAB: ADD EXERCISE ══ */
function AddExerciseTab({ onAdded }) {
  const [form, setForm]       = useState(blankExercise);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const updateInstruction = (i, val) => {
    const arr = [...form.instructions];
    arr[i] = val;
    setForm({ ...form, instructions: arr });
  };
  const addInstruction    = () => setForm({ ...form, instructions: [...form.instructions, ''] });
  const removeInstruction = (i) => form.instructions.length > 1 && setForm({ ...form, instructions: form.instructions.filter((_, idx) => idx !== i) });

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title    = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.duration)           e.duration = 'Duration is required';
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
    await new Promise((r) => setTimeout(r, 700));
    const newEx = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      difficulty: form.difficulty,
      duration: +form.duration,
      calories: +form.caloriesBurn,
      image: form.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
    };
    onAdded(newEx);
    setForm(blankExercise());
    setErrors({});
    setLoading(false);
    toast.success('Exercise added to your content!');
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

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-300 text-xs font-medium">Instructions *</label>
              <button type="button" onClick={addInstruction}
                className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors">
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
                    <button type="button" onClick={() => removeInstruction(i)}
                      className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
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
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiSend size={14} />}
            {loading ? 'Saving...' : 'Add Exercise'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* ══ TAB: ADD MEAL PLAN ══ */
function AddMealPlanTab({ onAdded }) {
  const [form, setForm]       = useState(blankMeal);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const MEAL_SECTIONS = ['breakfast', 'lunch', 'dinner', 'snacks'];

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title       = 'Title is required';
    if (!form.description.trim())  e.description = 'Description is required';
    if (!form.totalCalories)       e.totalCalories = 'Total calories is required';
    if (!form.duration.trim())     e.duration    = 'Duration is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const newPlan = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      calories: +form.totalCalories,
      duration: form.duration,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300',
    };
    onAdded(newPlan);
    setForm(blankMeal());
    setErrors({});
    setLoading(false);
    toast.success('Meal plan added to your content!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-2xl">
        <h2 className="text-white font-black text-xl mb-6">Add New Meal Plan</h2>
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-6 space-y-5">
          {/* Basic info */}
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
                {['diabetes_management','weight_loss','muscle_building','maintenance'].map((c) => (
                  <option key={c} value={c} className="bg-gray-800 capitalize">{c.replace('_', ' ')}</option>
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

          {/* Meal sections */}
          {MEAL_SECTIONS.map((meal) => (
            <div key={meal} className="bg-gray-900/40 rounded-xl p-4">
              <h4 className="text-white font-bold text-sm capitalize mb-3 flex items-center gap-2">
                <span>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : meal === 'dinner' ? '🌙' : '🍎'}</span>
                {meal}
              </h4>
              <FoodRows
                items={form[meal]}
                onChange={(updated) => setForm({ ...form, [meal]: updated })}
              />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-sm">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiSend size={14} />}
            {loading ? 'Saving...' : 'Add Meal Plan'}
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
            {/* Header */}
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

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'BMI',      value: s.bmi,      color: s.bmi < 25 ? 'text-green-400' : s.bmi < 30 ? 'text-yellow-400' : 'text-red-400' },
                { label: 'Workouts', value: `${s.workouts}/wk`, color: 'text-blue-400' },
                { label: 'Streak',   value: `${s.streak}d`,    color: 'text-orange-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-700/30 rounded-xl p-3 text-center">
                  <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Goal + action */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-gray-700/50 border border-gray-600/30 text-gray-300 text-xs">
                Goal: {s.goal}
              </span>
              <button
                onClick={() => toast.success(`Message sent to ${s.name}! (Backend integration coming)`)}
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
  const [activeTab, setActiveTab] = useState('content');
  const [exercises, setExercises] = useState(MY_EXERCISES);
  const [mealPlans, setMealPlans] = useState(MY_MEAL_PLANS);

  if (!isAuthenticated || (user?.role !== 'trainer' && user?.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'content':  return <MyContentTab exercises={exercises} setExercises={setExercises} mealPlans={mealPlans} setMealPlans={setMealPlans} />;
      case 'exercise': return <AddExerciseTab onAdded={(ex) => { setExercises((p) => [ex, ...p]); setActiveTab('content'); }} />;
      case 'meal':     return <AddMealPlanTab onAdded={(mp) => { setMealPlans((p) => [mp, ...p]); setActiveTab('content'); }} />;
      case 'students': return <StudentsTab />;
      default:         return null;
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
          <div key={activeTab}>
            {renderTab()}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
