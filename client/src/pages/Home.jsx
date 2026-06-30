import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiPlay, FiArrowDown, FiCheck,
  FiUser, FiTarget, FiClipboard, FiBarChart2,
  FiActivity, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import {
  FaDumbbell, FaAppleAlt, FaChartLine, FaUsers,
  FaCalculator, FaHospital, FaFire, FaHeart,
  FaQuoteLeft, FaStar, FaCheckCircle,
} from 'react-icons/fa';
import { exerciseAPI, mealAPI } from '../utils/api';

/* ─── Animated counter ─── */
function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const duration = 1800;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── BMI helpers ─── */
function getBmiCategory(bmi) {
  const v = parseFloat(bmi);
  if (v < 18.5) return { label: 'Underweight', color: 'text-blue-400', bar: 'bg-blue-400', pct: 15 };
  if (v < 25)   return { label: 'Normal',       color: 'text-green-400', bar: 'bg-green-400', pct: 42 };
  if (v < 30)   return { label: 'Overweight',   color: 'text-yellow-400', bar: 'bg-yellow-400', pct: 68 };
  return               { label: 'Obese',         color: 'text-red-400', bar: 'bg-red-400', pct: 90 };
}

/* ─── Featured category maps ─── */
const EX_CAT_COLOR = {
  cardio:            'bg-blue-500/20 text-blue-300',
  strength:          'bg-green-500/20 text-green-300',
  yoga:              'bg-purple-500/20 text-purple-300',
  flexibility:       'bg-pink-500/20 text-pink-300',
  diabetes_friendly: 'bg-emerald-500/20 text-emerald-300',
  balance:           'bg-teal-500/20 text-teal-300',
};
const MP_LABEL = {
  weight_loss:         'Weight Loss',
  diabetes_management: 'Diabetes Diet',
  muscle_building:     'Muscle Building',
  weight_gain:         'Weight Gain',
  maintenance:         'Maintenance',
};
const MP_CAT_COLOR = {
  weight_loss:         'bg-orange-500/20 text-orange-300',
  diabetes_management: 'bg-blue-500/20 text-blue-300',
  muscle_building:     'bg-green-500/20 text-green-300',
  weight_gain:         'bg-purple-500/20 text-purple-300',
  maintenance:         'bg-gray-500/20 text-gray-300',
};

/* ─── Data ─── */
const FEATURES = [
  { icon: FaDumbbell,   bg: 'bg-green-500/10',  iconColor: 'text-green-400',  title: 'Personalized Exercise Plans',   desc: 'Tailored workouts for your fitness level and health condition.' },
  { icon: FaAppleAlt,   bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', title: 'Diabetes-Friendly Nutrition',    desc: 'Meal plans that help manage blood sugar naturally.' },
  { icon: FaChartLine,  bg: 'bg-blue-500/10',   iconColor: 'text-blue-400',   title: 'Progress Tracking',             desc: 'Monitor weight, BMI, blood sugar, and fitness milestones.' },
  { icon: FaCalculator, bg: 'bg-purple-500/10', iconColor: 'text-purple-400', title: 'BMI Calculator',                desc: 'Instant health assessment with personalized recommendations.' },
  { icon: FaUsers,      bg: 'bg-pink-500/10',   iconColor: 'text-pink-400',   title: 'Support Community',             desc: 'Connect with others on the same health journey.' },
  { icon: FaHospital,   bg: 'bg-orange-500/10', iconColor: 'text-orange-400', title: 'Expert Guidance',               desc: 'Evidence-based content reviewed by health professionals.' },
];

const STEPS = [
  { icon: FiUser,      num: '01', title: 'Create Account',   desc: 'Sign up and complete your health profile in minutes.' },
  { icon: FiTarget,    num: '02', title: 'Set Your Goals',   desc: 'Tell us about your fitness goals and health conditions.' },
  { icon: FiClipboard, num: '03', title: 'Follow Your Plan', desc: 'Get personalized exercise and meal plans.' },
  { icon: FiBarChart2, num: '04', title: 'Track Progress',   desc: 'Monitor your journey and celebrate milestones.' },
];

const EXERCISES = [
  { img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', category: 'Cardio',    categoryColor: 'bg-blue-500/20 text-blue-300',   title: 'Brisk Walking',     dur: '30 min', diff: 'Beginner',     desc: 'A simple low-impact exercise perfect for managing blood sugar levels.' },
  { img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', category: 'Yoga',      categoryColor: 'bg-purple-500/20 text-purple-300', title: 'Chair Yoga Flow',   dur: '45 min', diff: 'Beginner',     desc: 'Gentle yoga adapted for people with mobility limitations or diabetes.' },
  { img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', category: 'Strength',  categoryColor: 'bg-green-500/20 text-green-300',   title: 'Full Body Strength', dur: '60 min', diff: 'Intermediate', desc: 'Build lean muscle mass to improve insulin sensitivity and metabolism.' },
];

const MEAL_PLANS = [
  { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', category: 'Weight Loss',       categoryColor: 'bg-orange-500/20 text-orange-300', title: 'Calorie-Deficit Plan',    calories: '1,400 kcal/day', duration: '4 weeks' },
  { img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', category: 'Diabetes Diet',     categoryColor: 'bg-blue-500/20 text-blue-300',     title: 'Low-GI Diabetes Plan',    calories: '1,600 kcal/day', duration: '8 weeks' },
  { img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', category: 'Muscle Building',   categoryColor: 'bg-green-500/20 text-green-300',   title: 'High-Protein Muscle Plan', calories: '2,200 kcal/day', duration: '6 weeks' },
];

const TESTIMONIALS = [
  { name: 'Ayesha Khan',  age: 34, city: 'Lahore',     color: 'from-pink-500 to-rose-600',    rating: 5, text: 'FitTrack helped me manage my Type 2 diabetes through exercise. My blood sugar levels are now in the normal range!' },
  { name: 'Ahmed Ali',    age: 28, city: 'Karachi',    color: 'from-blue-500 to-cyan-600',    rating: 5, text: 'Lost 15kg in 3 months following FitTrack\'s personalized plan. Best fitness app ever!' },
  { name: 'Sarah Malik',  age: 45, city: 'Islamabad',  color: 'from-purple-500 to-violet-600',rating: 5, text: 'As a diabetic, I was scared to exercise. FitTrack\'s guides made it safe and fun for me.' },
];

/* ─── Section wrapper ─── */
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };

function Section({ children, className = '' }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ staggerChildren: 0.12 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ══════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════ */
export default function Home() {
  /* BMI */
  const [height, setHeight]   = useState('');
  const [weight, setWeight]   = useState('');
  const [bmiVal, setBmiVal]   = useState(null);

  const calcBmi = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) setBmiVal((w / (h * h)).toFixed(1));
  };

  /* Testimonials carousel */
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveIdx((p) => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* Featured exercises + meal plans from API */
  const [featuredExercises, setFeaturedExercises] = useState(EXERCISES);
  const [featuredMeals, setFeaturedMeals]         = useState(MEAL_PLANS);

  useEffect(() => {
    exerciseAPI.getFeatured()
      .then(({ data: res }) => {
        if (res.data?.length) {
          setFeaturedExercises(res.data.map((ex) => ({
            img:           ex.imageUrl,
            category:      ex.category.replace(/_/g, ' '),
            categoryColor: EX_CAT_COLOR[ex.category] || 'bg-green-500/20 text-green-300',
            title:         ex.title,
            dur:           `${ex.duration} min`,
            diff:          ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1),
            desc:          ex.description,
          })));
        }
      })
      .catch(() => {});

    mealAPI.getFeatured()
      .then(({ data: res }) => {
        if (res.data?.length) {
          setFeaturedMeals(res.data.map((mp) => ({
            img:           mp.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
            category:      MP_LABEL[mp.category] || mp.category,
            categoryColor: MP_CAT_COLOR[mp.category] || 'bg-gray-500/20 text-gray-300',
            title:         mp.title,
            calories:      `${(mp.totalCalories || 0).toLocaleString()} kcal/day`,
            duration:      mp.duration,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const bmiCat = bmiVal ? getBmiCategory(bmiVal) : null;

  return (
    <div className="overflow-x-hidden">

      {/* ══ SECTION 1: HERO ══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG Image */}
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600"
          alt="Gym"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-900/80 to-gray-950/85" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                🏋️ #1 Fitness Platform for Diabetes Management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-5xl md:text-7xl font-black leading-none mb-6 text-white"
            >
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Health Journey
              </span>
              <br />
              With FitTrack
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed max-w-xl"
            >
              Personalized fitness plans, diabetes-friendly workouts, and expert nutrition guidance — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-14"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg rounded-full shadow-xl shadow-green-500/30 transition-all duration-200 hover:scale-105"
              >
                Start Free Today <FiArrowRight />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 hover:border-white/60 text-white font-semibold text-lg rounded-full backdrop-blur-sm transition-all duration-200"
              >
                <FiPlay size={16} /> Watch How It Works
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {[
                { end: 10000, suffix: '+', label: 'Active Members' },
                { end: 500,   suffix: '+', label: 'Exercise Guides' },
                { end: 200,   suffix: '+', label: 'Meal Plans' },
                { end: 95,    suffix: '%', label: 'Success Rate' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-white">
                    <AnimatedCounter end={s.end} suffix={s.suffix} />
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Floating cards (desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 items-end">
            {[
              {
                icon: <FaCalculator className="text-green-400" size={20} />,
                label: 'BMI Check',
                sub: 'Your health score',
                badge: 'Normal',
                badgeColor: 'bg-green-500/20 text-green-400',
                delay: 0.5,
              },
              {
                icon: <FaFire className="text-orange-400" size={20} />,
                label: "Today's Workout",
                sub: '45 min Full Body',
                badge: 'Active',
                badgeColor: 'bg-orange-500/20 text-orange-400',
                delay: 0.65,
              },
              {
                icon: <FaHeart className="text-pink-400" size={20} />,
                label: 'Blood Sugar',
                sub: 'Normal Range ✓',
                badge: 'Safe',
                badgeColor: 'bg-pink-500/20 text-pink-400',
                delay: 0.8,
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: card.delay, duration: 0.5 }}
                className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 w-64 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm">{card.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{card.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll arrow */}
        <motion.a
          href="#features"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-green-400 transition-colors z-10"
        >
          <FiArrowDown size={24} />
        </motion.a>
      </section>

      {/* ══ SECTION 2: FEATURES ══ */}
      <Section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-green-600 text-sm font-semibold uppercase tracking-widest">Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                Stay Healthy
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Powerful tools designed specifically for people who want to get fit and manage their health conditions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="group bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-green-200 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                    <Icon className={`${f.iconColor} text-2xl`} />
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ══ SECTION 3: HOW IT WORKS ══ */}
      <Section id="how-it-works" className="py-24 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">Process</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">
              How FitTrack{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Get started in minutes. Your transformation begins with just four simple steps.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-green-500/20 via-green-500/50 to-green-500/20 z-0" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  transition={{ delay: i * 0.12 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center shadow-xl shadow-green-500/25 mb-5">
                    <span className="text-green-200 text-xs font-bold tracking-widest mb-1">{step.num}</span>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ══ SECTION 4: DIABETES SPOTLIGHT ══ */}
      <Section className="py-24 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 to-emerald-500/0 rounded-3xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800"
              alt="Diabetes management"
              className="relative rounded-2xl w-full h-80 lg:h-[500px] object-cover border border-gray-800/50 shadow-2xl"
              loading="lazy"
            />
          </motion.div>

          {/* Content */}
          <div>
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6"
            >
              🩺 Special Focus: Diabetes Management
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Fitness Solutions Built for Diabetics
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed mb-8">
              Living with diabetes doesn&apos;t mean giving up on fitness. FitTrack provides safe, evidence-based exercise
              programs and meal plans specifically designed to help manage blood sugar levels while improving overall health.
            </motion.p>

            <div className="space-y-4 mb-10">
              {[
                'Low-impact exercise routines safe for diabetics',
                'Blood sugar monitoring and tracking tools',
                'Diabetes-friendly meal plans and recipes',
                'Expert tips for exercising with diabetes',
              ].map((item) => (
                <motion.div key={item} variants={fadeUp} className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <Link
                to="/exercises"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:from-green-400 hover:to-emerald-500 transition-all duration-200"
              >
                Explore Diabetes Resources <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ══ SECTION 5: EXERCISES PREVIEW ══ */}
      <Section className="py-24 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">Library</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">Popular Exercise Guides</h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              From beginner-friendly cardio to strength training — find workouts that match your level.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {featuredExercises.map((ex, i) => (
              <motion.div
                key={ex.title}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
              >
                <div className="overflow-hidden h-52">
                  <img
                    src={ex.img}
                    alt={ex.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ex.categoryColor}`}>
                      {ex.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700/50 text-gray-300">
                      {ex.diff}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{ex.title}</h3>
                  <p className="text-green-400 text-xs mb-3">⏱ {ex.dur}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{ex.desc}</p>
                  <Link
                    to="/exercises"
                    className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors"
                  >
                    View Exercise <FiArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center">
            <Link
              to="/exercises"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-green-500/40 hover:border-green-400 text-green-400 hover:text-green-300 rounded-xl font-semibold text-sm transition-all duration-200"
            >
              View All Exercises <FiArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ══ SECTION 6: MEAL PLANS PREVIEW ══ */}
      <Section className="py-24 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-green-600 text-sm font-semibold uppercase tracking-widest">Nutrition</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">Nutrition Plans That Work</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Science-backed meal plans designed by nutrition experts to fuel your workouts and manage health conditions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {featuredMeals.map((mp, i) => (
              <motion.div
                key={mp.title}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-green-100"
              >
                <div className="overflow-hidden h-48">
                  <img
                    src={mp.img}
                    alt={mp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mp.categoryColor} mb-3 inline-block`}>
                    {mp.category}
                  </span>
                  <h3 className="text-gray-900 font-bold text-lg mb-2">{mp.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                    <span>🔥 {mp.calories}</span>
                    <span>📅 {mp.duration}</span>
                  </div>
                  <Link
                    to="/meal-plans"
                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-500 text-sm font-semibold transition-colors"
                  >
                    View Plan <FiArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center">
            <Link
              to="/meal-plans"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-green-500 hover:bg-green-500/5 text-green-600 rounded-xl font-semibold text-sm transition-all duration-200"
            >
              View All Meal Plans <FiArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ══ SECTION 7: BMI CALCULATOR ══ */}
      <Section className="py-24 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Calculator widget */}
          <motion.div variants={fadeUp} className="bg-gray-900/80 border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <FaCalculator className="text-green-400" size={18} />
              </div>
              <h3 className="text-white font-bold text-xl">BMI Calculator</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 170"
                  value={height}
                  onChange={(e) => { setHeight(e.target.value); setBmiVal(null); }}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); setBmiVal(null); }}
                  className="input-dark"
                />
              </div>
            </div>

            <button
              onClick={calcBmi}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:from-green-400 hover:to-emerald-500 transition-all duration-200 mb-6"
            >
              Calculate BMI
            </button>

            {/* Result */}
            <AnimatePresence>
              {bmiVal && bmiCat && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-800/50 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Your BMI</span>
                    <span className={`text-3xl font-black ${bmiCat.color}`}>{bmiVal}</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${bmiCat.bar} text-white mb-4`}>
                    {bmiCat.label}
                  </span>
                  {/* Scale bar */}
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bmiCat.pct}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${bmiCat.bar}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right — Content */}
          <div>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">
              🧮 Health Assessment
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Know Your BMI{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Instantly</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed mb-8">
              Body Mass Index (BMI) is a key indicator of your overall health. Understanding your BMI helps you set
              realistic goals and take informed steps toward a healthier lifestyle.
            </motion.p>

            <div className="space-y-5 mb-10">
              {[
                { title: 'Track Over Time', desc: 'Log your BMI regularly to see your progress trending in the right direction.' },
                { title: 'Diabetes Connection', desc: 'BMI directly correlates with Type 2 diabetes risk — knowing yours is the first step.' },
                { title: 'Personalized Plans', desc: 'FitTrack uses your BMI to customize exercise and nutrition recommendations.' },
              ].map((pt) => (
                <motion.div key={pt.title} variants={fadeUp} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-green-400" size={14} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{pt.title}</p>
                    <p className="text-gray-500 text-sm">{pt.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <Link
                to="/bmi-calculator"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Open Full BMI Tool <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ══ SECTION 8: TESTIMONIALS ══ */}
      <Section className="py-24 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">Community</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">
              Success Stories from Our Community
            </h2>
          </motion.div>

          {/* Carousel */}
          <motion.div variants={fadeUp} className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="bg-gray-800/60 border border-gray-700/50 rounded-3xl p-8 md:p-10"
              >
                <FaQuoteLeft className="text-green-500/30 text-5xl mb-6" />
                <p className="text-white text-xl md:text-2xl leading-relaxed font-medium mb-8">
                  &ldquo;{TESTIMONIALS[activeIdx].text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${TESTIMONIALS[activeIdx].color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {TESTIMONIALS[activeIdx].name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold">{TESTIMONIALS[activeIdx].name}</p>
                      <p className="text-gray-400 text-sm">
                        {TESTIMONIALS[activeIdx].age} years · {TESTIMONIALS[activeIdx].city}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: TESTIMONIALS[activeIdx].rating }).map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" size={16} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={() => setActiveIdx((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full border border-gray-700 hover:border-green-500/50 flex items-center justify-center text-gray-400 hover:text-green-400 transition-all"
              >
                <FiChevronLeft size={18} />
              </button>

              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === activeIdx ? 'bg-green-400 w-6' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveIdx((p) => (p + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full border border-gray-700 hover:border-green-500/50 flex items-center justify-center text-gray-400 hover:text-green-400 transition-all"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ══ SECTION 9: CTA ══ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1600"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />

        {/* Glow orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">
            🚀 Start Your Journey Today
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Ready to Transform{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Your Life?
            </span>
          </h2>
          <p className="text-gray-400 text-xl mb-12">
            Join 10,000+ members already living healthier lives with FitTrack.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-full shadow-2xl shadow-green-500/30 hover:from-green-400 hover:to-emerald-500 hover:scale-105 transition-all duration-200"
            >
              Create Free Account <FiArrowRight />
            </Link>
            <Link
              to="/exercises"
              className="inline-flex items-center gap-2 px-10 py-4 border border-white/20 hover:border-white/50 text-white font-semibold text-lg rounded-full backdrop-blur-sm transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
