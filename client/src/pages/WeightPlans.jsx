import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCheck, FiArrowRight, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { FaFire, FaDumbbell, FaHeartbeat, FaBrain, FaAppleAlt } from 'react-icons/fa';

/* ── DATA ── */
const LOSE_PLANS = [
  {
    id: 'lose-basic',
    tier: 'Basic',
    tierColor: 'text-gray-300',
    badge:    'bg-gray-700/50 text-gray-300',
    gradient: 'from-gray-700 to-gray-600',
    border:   'border-gray-700/50',
    highlight: false,
    duration: '4 Weeks',
    deficit:  '300–400 kcal/day',
    targetLoss: '1–2 kg',
    description: 'A gentle introduction to healthy eating with a modest calorie deficit. Perfect for beginners building sustainable habits.',
    features: [
      'Daily 1,400–1,600 kcal target',
      '3 balanced meals + 1 snack per day',
      'Simple, easy-to-prepare recipes',
      'Basic hunger management guide',
      'Weekly weigh-in tracker sheet',
    ],
    schedule: {
      Mon: 'Cardio',  Tue: 'Rest',     Wed: 'Cardio',  Thu: 'Rest',
      Fri: 'Cardio',  Sat: 'Walk',     Sun: 'Rest',
    },
  },
  {
    id: 'lose-standard',
    tier: 'Standard',
    tierColor: 'text-green-400',
    badge:    'bg-green-500/15 text-green-400',
    gradient: 'from-green-500 to-emerald-600',
    border:   'border-green-500/30',
    highlight: true,
    duration: '8 Weeks',
    deficit:  '500–600 kcal/day',
    targetLoss: '4–6 kg',
    description: 'The most popular plan combining diet and exercise for healthy, consistent fat loss with energy and muscle preservation.',
    features: [
      'Daily 1,200–1,400 kcal target',
      'Structured meal timing protocol',
      'Intermittent fasting option (16:8)',
      '3× cardio + 2× strength per week',
      'Weekly progress check-in system',
    ],
    schedule: {
      Mon: 'Cardio',    Tue: 'Strength', Wed: 'Cardio',   Thu: 'Rest',
      Fri: 'Strength',  Sat: 'Cardio',   Sun: 'Rest',
    },
  },
  {
    id: 'lose-advanced',
    tier: 'Advanced',
    tierColor: 'text-orange-400',
    badge:    'bg-orange-500/15 text-orange-400',
    gradient: 'from-orange-500 to-red-500',
    border:   'border-orange-500/30',
    highlight: false,
    duration: '12 Weeks',
    deficit:  '700–800 kcal/day',
    targetLoss: '8–12 kg',
    description: 'Aggressive fat loss with metabolic cycling, advanced training, and precision nutrition for experienced individuals.',
    features: [
      'Carb cycling (low/medium/high days)',
      'HIIT + strength training combined',
      'Macro tracking with targets per meal',
      'Refeed days to prevent adaptation',
      'Advanced body recomposition protocol',
    ],
    schedule: {
      Mon: 'HIIT',     Tue: 'Strength', Wed: 'HIIT',    Thu: 'Strength',
      Fri: 'HIIT',     Sat: 'Strength', Sun: 'Rest',
    },
  },
];

const GAIN_PLANS = [
  {
    id: 'gain-basic',
    tier: 'Starter',
    tierColor: 'text-gray-300',
    badge:    'bg-gray-700/50 text-gray-300',
    gradient: 'from-gray-700 to-gray-600',
    border:   'border-gray-700/50',
    highlight: false,
    duration: '4 Weeks',
    surplus:  '+200–300 kcal/day',
    targetGain: '0.5–1 kg',
    description: 'Gentle lean bulk to help underweight individuals gain healthy weight with whole foods and light activity.',
    features: [
      'Daily 2,000–2,200 kcal target',
      'Focus on nutrient-dense calorie sources',
      '3 meals + 2 high-calorie snacks',
      'Light resistance training 2×/week',
      'Sleep & recovery optimization guide',
    ],
    schedule: {
      Mon: 'Strength', Tue: 'Rest',     Wed: 'Cardio',  Thu: 'Rest',
      Fri: 'Strength', Sat: 'Walk',     Sun: 'Rest',
    },
  },
  {
    id: 'gain-standard',
    tier: 'Lean Bulk',
    tierColor: 'text-blue-400',
    badge:    'bg-blue-500/15 text-blue-400',
    gradient: 'from-blue-500 to-cyan-600',
    border:   'border-blue-500/30',
    highlight: true,
    duration: '8 Weeks',
    surplus:  '+400–500 kcal/day',
    targetGain: '2–3 kg',
    description: 'The classic lean bulk — controlled surplus with progressive overload training to build quality muscle with minimal fat gain.',
    features: [
      'Daily 2,400–2,600 kcal target',
      'High-protein (180–200g/day) diet',
      '4× progressive strength training',
      'Pre/post-workout nutrition protocol',
      'Monthly measurement tracking system',
    ],
    schedule: {
      Mon: 'Strength',  Tue: 'Strength', Wed: 'Rest',    Thu: 'Strength',
      Fri: 'Strength',  Sat: 'Cardio',   Sun: 'Rest',
    },
  },
  {
    id: 'gain-advanced',
    tier: 'Mass Builder',
    tierColor: 'text-purple-400',
    badge:    'bg-purple-500/15 text-purple-400',
    gradient: 'from-purple-500 to-violet-600',
    border:   'border-purple-500/30',
    highlight: false,
    duration: '12 Weeks',
    surplus:  '+600–800 kcal/day',
    targetGain: '4–6 kg',
    description: 'Maximum hypertrophy protocol with aggressive calorie surplus, periodized training, and advanced nutrient timing.',
    features: [
      'Daily 2,800–3,200 kcal target',
      'Periodized hypertrophy training (5-day split)',
      'Strategic carb loading around workouts',
      'Creatine & supplement protocol guide',
      'Bi-weekly body composition assessment',
    ],
    schedule: {
      Mon: 'Strength',  Tue: 'Strength', Wed: 'Cardio',  Thu: 'Strength',
      Fri: 'Strength',  Sat: 'Strength', Sun: 'Rest',
    },
  },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_COLORS = {
  Cardio:   'bg-green-500/20 text-green-400 border-green-500/20',
  HIIT:     'bg-orange-500/20 text-orange-400 border-orange-500/20',
  Strength: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  Walk:     'bg-teal-500/20 text-teal-400 border-teal-500/20',
  Rest:     'bg-gray-700/30 text-gray-500 border-gray-700/30',
};

const TIPS = [
  { icon: FaFire,     title: 'Track Calories',  desc: 'Use an app to log food daily. Awareness is the most powerful tool for changing eating habits.' },
  { icon: FaDumbbell, title: 'Lift Weights',     desc: 'Strength training preserves muscle during weight loss and builds it during a surplus — essential for both goals.' },
  { icon: FaHeartbeat,title: 'Prioritize Sleep', desc: 'Poor sleep disrupts hunger hormones (ghrelin/leptin) and makes fat loss nearly impossible. Aim for 7–9 hours.' },
  { icon: FaBrain,    title: 'Stay Consistent',  desc: 'Results come from weeks and months of consistent effort, not perfect days. Small daily wins compound.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

/* ── PLAN CARD ── */
function PlanCard({ plan, isLose, selectedId, onSelect }) {
  const isSelected = selectedId === plan.id;
  const surplus    = 'surplus' in plan;

  return (
    <motion.div
      variants={fadeUp}
      className={`relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden ${
        plan.highlight
          ? `${plan.border} shadow-2xl shadow-green-500/10`
          : `${plan.border}`
      } ${isSelected ? 'ring-2 ring-green-500/50' : ''}`}
    >
      {/* Popular badge */}
      {plan.highlight && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <span className={`px-5 py-1 text-xs font-black text-white rounded-b-xl bg-gradient-to-r ${plan.gradient}`}>
            ⭐ Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className={`px-6 pt-${plan.highlight ? '9' : '6'} pb-5 bg-gradient-to-br ${plan.gradient} bg-opacity-10 border-b border-gray-700/30`}
        style={{ paddingTop: plan.highlight ? '2.25rem' : '1.5rem' }}
      >
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${plan.badge}`}>
          {plan.tier}
        </span>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Duration</p>
            <p className="text-white font-black text-2xl">{plan.duration}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-0.5">{surplus ? 'Surplus' : 'Deficit'}</p>
            <p className={`font-bold text-sm ${plan.tierColor}`}>{plan.surplus || plan.deficit}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1 bg-gray-900/40">
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{plan.description}</p>

        {/* Target */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 bg-gradient-to-r ${plan.gradient} bg-opacity-10`}
          style={{ background: undefined }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 border ${plan.border} bg-gray-800/30`}
        >
          {isLose ? <FiTrendingDown className={plan.tierColor} size={14} /> : <FiTrendingUp className={plan.tierColor} size={14} />}
          <span className="text-gray-400 text-xs">Target:</span>
          <span className={`font-bold text-sm ${plan.tierColor}`}>
            {isLose ? `-${plan.targetLoss}` : `+${plan.targetGain}`} total
          </span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br ${plan.gradient}`}>
                <FiCheck size={10} className="text-white" />
              </div>
              <span className="text-gray-300 text-sm">{f}</span>
            </li>
          ))}
        </ul>

        {/* Progress timeline */}
        <div className="mb-5">
          <p className="text-gray-500 text-xs mb-2">Progress Timeline</p>
          <div className="relative flex items-center">
            <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-3" />
            {['Week 1', 'Week 2', plan.duration.includes('4') ? 'Week 4' : plan.duration.includes('8') ? 'Week 8' : 'Week 12'].map((wk, i, arr) => (
              <div key={wk} className="relative flex-1 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                  i === 0 ? 'bg-gray-800 border-gray-600 text-gray-400' :
                  i === arr.length - 1 ? `bg-gradient-to-br ${plan.gradient} border-transparent text-white` :
                  'bg-gray-800 border-gray-600 text-gray-400'
                }`}>
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-gray-600 text-xs mt-1">{wk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => toast('Please log in to start a weight management plan!', { icon: '🔐' })}
            className={`flex-1 py-3 bg-gradient-to-r ${plan.gradient} text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] text-sm`}
          >
            Start Plan
          </button>
          <button
            onClick={() => onSelect(plan.id)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
              isSelected
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── WEEKLY SCHEDULE ── */
function WeeklySchedule({ plan }) {
  if (!plan) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-6"
    >
      <h3 className="text-white font-bold mb-5">
        Weekly Schedule —{' '}
        <span className={plan.tierColor}>{plan.tier} Plan</span>
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day) => {
          const activity = plan.schedule[day] || 'Rest';
          const colors   = DAY_COLORS[activity] || DAY_COLORS.Rest;
          return (
            <div key={day} className="flex flex-col items-center gap-2">
              <span className="text-gray-500 text-xs font-semibold">{day}</span>
              <div className={`w-full min-h-[60px] rounded-xl border flex items-center justify-center p-2 text-center ${colors}`}>
                <span className="text-xs font-semibold leading-tight">{activity}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(DAY_COLORS).map(([type, cls]) => (
          <span key={type} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" /> {type}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ══ MAIN ══ */
export default function WeightPlans() {
  const [activeTab, setActiveTab]   = useState('lose');
  const [selectedId, setSelectedId] = useState(null);

  const plans = activeTab === 'lose' ? LOSE_PLANS : GAIN_PLANS;
  const selectedPlan = plans.find((p) => p.id === selectedId) || null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative h-72 md:h-80 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1600"
          alt="Weight management"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-900/65 to-gray-950" />
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-3">
              ⚖️ Science-Based Plans
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
              Weight{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Management Plans
              </span>
            </h1>
            <p className="text-gray-300 text-lg">Evidence-based programs for every body composition goal</p>
          </motion.div>
        </div>
      </div>

      {/* ── TAB TOGGLE ── */}
      <div className="py-8 px-4 bg-gray-950 border-b border-gray-800/50">
        <div className="flex justify-center">
          <div className="flex bg-gray-800/60 border border-gray-700/50 rounded-2xl p-1.5 gap-1">
            <button
              onClick={() => handleTabChange('lose')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black transition-all duration-200 ${
                activeTab === 'lose'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiTrendingDown size={16} /> Lose Weight
            </button>
            <button
              onClick={() => handleTabChange('gain')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black transition-all duration-200 ${
                activeTab === 'gain'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiTrendingUp size={16} /> Gain Weight
            </button>
          </div>
        </div>

        <motion.p
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 text-sm mt-4"
        >
          {activeTab === 'lose'
            ? '🔥 Lose fat, preserve muscle, and build sustainable healthy habits'
            : '💪 Build lean muscle mass and reach a healthy body weight with science-backed nutrition'}
        </motion.p>
      </div>

      {/* ── PLAN CARDS ── */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isLose={activeTab === 'lose'}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── WEEKLY SCHEDULE (shows when a plan is previewed) ── */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              key={selectedPlan.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <WeeklySchedule plan={selectedPlan} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TIPS ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-black text-white text-center mb-8"
          >
            {activeTab === 'lose' ? '🔥 Tips for Successful Weight Loss' : '💪 Tips for Healthy Weight Gain'}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  variants={fadeUp}
                  className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 hover:border-green-500/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                    <Icon className="text-green-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-2">{tip.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── BOTTOM CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <div className="inline-block bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-3xl px-10 py-8 max-w-xl">
            <p className="text-3xl mb-3">🎯</p>
            <h3 className="text-white font-black text-xl mb-2">Not sure which plan is right for you?</h3>
            <p className="text-gray-400 text-sm mb-5">Calculate your BMI first to get a personalized recommendation based on your current health status.</p>
            <a
              href="/bmi-calculator"
              className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:from-green-400 hover:to-emerald-500 transition-all text-sm"
            >
              Calculate My BMI <FiArrowRight size={13} />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
