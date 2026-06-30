import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiX, FiClock, FiArrowRight } from 'react-icons/fi';
import { FaFire, FaLeaf, FaDrumstickBite, FaOilCan } from 'react-icons/fa';
import { mealAPI } from '../utils/api';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORY_META = {
  weight_loss:         { label: 'Weight Loss',        pill: 'bg-orange-500/20 text-orange-400 border-orange-500/20' },
  diabetes_management: { label: 'Diabetes Management', pill: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
  muscle_building:     { label: 'Muscle Building',     pill: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
  weight_gain:         { label: 'Weight Gain',         pill: 'bg-green-500/20 text-green-400 border-green-500/20' },
  maintenance:         { label: 'Maintenance',         pill: 'bg-gray-500/20 text-gray-400 border-gray-500/20' },
};

const TABS = [
  { key: 'all',                label: 'All Plans' },
  { key: 'weight_loss',        label: 'Weight Loss' },
  { key: 'weight_gain',        label: 'Weight Gain' },
  { key: 'diabetes_management',label: 'Diabetes' },
  { key: 'muscle_building',    label: 'Muscle Building' },
];

const MEAL_SECTIONS = [
  { key: 'breakfast', label: '🌅 Breakfast' },
  { key: 'lunch',     label: '☀️  Lunch' },
  { key: 'dinner',    label: '🌙 Dinner' },
  { key: 'snacks',    label: '🍎 Snacks' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function computeMacros(plan) {
  const allItems = [
    ...(plan.meals?.breakfast || []),
    ...(plan.meals?.lunch     || []),
    ...(plan.meals?.dinner    || []),
    ...(plan.meals?.snacks    || []),
  ];
  const totalP = allItems.reduce((s, i) => s + (i.protein || 0), 0);
  const totalC = allItems.reduce((s, i) => s + (i.carbs   || 0), 0);
  const totalF = allItems.reduce((s, i) => s + (i.fat     || 0), 0);
  const totalCal = totalP * 4 + totalC * 4 + totalF * 9;
  if (!totalCal) return { carbs: 40, protein: 35, fat: 25, totalP, totalC, totalF };
  return {
    carbs:   Math.round((totalC * 4 / totalCal) * 100),
    protein: Math.round((totalP * 4 / totalCal) * 100),
    fat:     Math.round((totalF * 9 / totalCal) * 100),
    totalP, totalC, totalF,
  };
}

function PlanModal({ plan, onClose }) {
  if (!plan) return null;
  const cat    = CATEGORY_META[plan.category] || CATEGORY_META.maintenance;
  const macros = computeMacros(plan);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900 border border-gray-700/60 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.pill} mb-1`}>
                {cat.label}
              </span>
              <h2 className="text-white font-black text-xl">{plan.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Image + stats */}
            <div className="grid sm:grid-cols-2 gap-5">
              <img
                src={plan.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'}
                alt={plan.title}
                className="w-full h-44 object-cover rounded-2xl"
                loading="lazy"
              />
              <div className="space-y-3">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Daily Nutrition</h3>
                {[
                  { label: 'Calories', value: `${plan.totalCalories} kcal`, color: 'text-orange-400' },
                  { label: 'Carbs',    value: `${macros.totalC}g`,          color: 'text-yellow-400' },
                  { label: 'Protein',  value: `${macros.totalP}g`,          color: 'text-blue-400' },
                  { label: 'Fat',      value: `${macros.totalF}g`,          color: 'text-purple-400' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-800/60 last:border-0">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <FiClock size={13} className="text-green-400" />
                  <span className="text-gray-400 text-sm">{plan.duration}</span>
                </div>
              </div>
            </div>

            {/* Macro bar */}
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Macro Split</h3>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                <div className="bg-yellow-400 rounded-l-full" style={{ width: `${macros.carbs}%` }} />
                <div className="bg-blue-400"                  style={{ width: `${macros.protein}%` }} />
                <div className="bg-purple-400 rounded-r-full" style={{ width: `${macros.fat}%` }} />
              </div>
              <div className="flex gap-5 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Carbs {macros.carbs}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"   /> Protein {macros.protein}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Fat {macros.fat}%</span>
              </div>
            </div>

            {/* Meal breakdown */}
            <div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Daily Meal Plan</h3>
              <div className="space-y-4">
                {MEAL_SECTIONS.map(({ key, label }) => {
                  const items = plan.meals?.[key] || [];
                  if (!items.length) return null;
                  return (
                    <div key={key} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-4">
                      <p className="text-green-400 font-bold text-sm mb-3">{label}</p>
                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-start justify-between gap-3">
                            <span className="text-gray-300 text-xs leading-relaxed flex-1">{item.name}</span>
                            <span className="text-orange-400 text-xs font-semibold flex-shrink-0">{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={() => toast('Please log in to save this meal plan to your profile!', { icon: '🔐' })}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 transition-all duration-200 hover:scale-[1.02]"
            >
              Save This Plan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MealCard({ plan, onViewPlan }) {
  const cat    = CATEGORY_META[plan.category] || CATEGORY_META.maintenance;
  const macros = computeMacros(plan);
  return (
    <motion.div
      variants={fadeUp}
      className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/20 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={plan.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'}
          alt={plan.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.pill}`}>
          {cat.label}
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900/70 text-gray-300 backdrop-blur-sm border border-gray-700/50">
          {plan.duration}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-bold text-lg mb-1.5 line-clamp-1">{plan.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{plan.description}</p>

        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center gap-1.5 text-orange-400 text-sm font-semibold">
            <FaFire size={12} /> {(plan.totalCalories || 0).toLocaleString()} kcal
          </span>
          <span className="text-gray-600">·</span>
          <FiClock size={12} className="text-gray-500" />
          <span className="text-gray-500 text-sm">{plan.duration}</span>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
            <FaLeaf size={9} /> C {macros.carbs}%
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <FaDrumstickBite size={9} /> P {macros.protein}%
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
            <FaOilCan size={9} /> F {macros.fat}%
          </span>
        </div>

        <button
          onClick={() => onViewPlan(plan)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-green-500/20 group-hover:shadow-green-500/30"
        >
          View Plan <FiArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

export default function MealPlanning() {
  const [activeTab, setActiveTab] = useState('all');
  const [modalPlan, setModalPlan] = useState(null);
  const [plans,     setPlans]     = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.category = activeTab;
      const { data: res } = await mealAPI.getAll(params);
      setPlans(res.data || []);
      setTotal(res.total || 0);
    } catch {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative h-72 md:h-80 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600"
          alt="Nutrition"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-900/65 to-gray-950" />
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-3">
              🥗 Expert Nutrition Plans
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
              Nutrition &{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Meal Plans
              </span>
            </h1>
            <p className="text-gray-300 text-lg">Professionally designed plans for every health goal</p>
          </motion.div>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="sticky top-16 z-30 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 py-4 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-center text-gray-600 text-xs mt-3">
            {loading
              ? 'Loading...'
              : <>Showing <span className="text-green-400 font-semibold">{total}</span> plans</>
            }
          </p>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : plans.length > 0 ? (
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {plans.map((plan) => (
                <MealCard key={plan._id} plan={plan} onViewPlan={setModalPlan} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="text-7xl mb-4">🥗</div>
              <h3 className="text-white font-bold text-xl mb-2">No plans found</h3>
              <p className="text-gray-500 mb-6">Try a different category or check back later</p>
              <button
                onClick={() => setActiveTab('all')}
                className="px-6 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-colors"
              >
                Show all plans
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODAL ── */}
      {modalPlan && <PlanModal plan={modalPlan} onClose={() => setModalPlan(null)} />}
    </div>
  );
}
