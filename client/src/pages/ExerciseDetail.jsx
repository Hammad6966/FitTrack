import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiClock, FiShare2, FiBookmark } from 'react-icons/fi';
import { FaFire, FaDumbbell, FaCheckCircle, FaExclamationTriangle, FaBookmark } from 'react-icons/fa';
import { CATEGORY_COLORS } from '../utils/mockData';
import { exerciseAPI } from '../utils/api';

const DIFF_COLORS = {
  beginner:     'bg-green-500/15 text-green-400 border border-green-500/20',
  intermediate: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  advanced:     'bg-red-500/15 text-red-400 border border-red-500/20',
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function ExerciseDetail() {
  const { id }                    = useParams();
  const [saved, setSaved]         = useState(false);
  const [exercise, setExercise]   = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    exerciseAPI.getById(id)
      .then(async ({ data: res }) => {
        setExercise(res.data);
        try {
          const { data: rel } = await exerciseAPI.getAll({ category: res.data.category, limit: 4 });
          setRelated((rel.data || []).filter((e) => e._id !== res.data._id).slice(0, 3));
        } catch { /* ignore */ }
      })
      .catch(() => setExercise(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-7xl mb-2">🏋️</div>
        <h1 className="text-3xl font-black text-white">Exercise Not Found</h1>
        <p className="text-gray-400">The exercise you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/exercises" className="btn-primary px-6 mt-2">← Back to Library</Link>
      </div>
    );
  }

  const cat = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.cardio;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: exercise.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── BACK ── */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            to="/exercises"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm mb-6"
          >
            <FiArrowLeft size={14} /> Back to Exercise Library
          </Link>
        </motion.div>

        {/* ── HERO IMAGE ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden h-72 md:h-96 mb-8 shadow-2xl"
        >
          <img
            src={exercise.imageUrl}
            alt={exercise.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${cat.pill} mb-2`}>
                {cat.label}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{exercise.title}</h1>
            </div>
            {exercise.category === 'diabetes_friendly' && (
              <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-xs font-semibold">
                🩺 Diabetes Safe
              </span>
            )}
          </div>
        </motion.div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT (2/3) ── */}
          <motion.div
            initial="hidden" animate="visible"
            transition={{ staggerChildren: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Badges + description */}
            <motion.div variants={fadeUp}>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${DIFF_COLORS[exercise.difficulty]}`}>
                  {exercise.difficulty}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <FiClock size={13} className="text-green-400" /> {exercise.duration} minutes
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <FaFire size={13} className="text-orange-400" /> {exercise.caloriesBurn} kcal
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <FaDumbbell size={13} className="text-gray-500" /> {exercise.equipment}
                </span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{exercise.description}</p>
            </motion.div>

            {/* Diabetes badge (mobile) */}
            {exercise.category === 'diabetes_friendly' && (
              <motion.div variants={fadeUp} className="lg:hidden">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <span className="text-2xl">🩺</span>
                  <div>
                    <p className="text-green-400 font-bold text-sm">Diabetes-Friendly Exercise</p>
                    <p className="text-gray-400 text-xs">This exercise is safe and beneficial for people managing diabetes.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-black text-white mb-5">Step-by-Step Instructions</h2>
              <div className="space-y-3">
                {exercise.instructions.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4 bg-gray-800/40 border border-gray-700/40 rounded-xl p-4"
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-lg shadow-green-500/25">
                      {i + 1}
                    </span>
                    <p className="text-gray-300 text-sm leading-relaxed pt-1">{step}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Safety Tips */}
            {exercise.safetyTips && exercise.safetyTips.length > 0 && (
              <motion.div variants={fadeUp}>
                <h2 className="text-2xl font-black text-white mb-5 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-400" size={20} /> Safety Tips
                </h2>
                <div className="space-y-3">
                  {exercise.safetyTips.map((tip, i) => (
                    <div key={i} className="flex gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                      <FaExclamationTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={14} />
                      <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Diabetes info */}
            {exercise.category === 'diabetes_friendly' && (
              <motion.div variants={fadeUp} className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-400" size={16} />
                  <h3 className="text-green-400 font-bold">Why This is Great for Diabetics</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This exercise is specifically beneficial for people managing diabetes. It helps lower blood sugar by
                  increasing glucose uptake in muscles, improves insulin sensitivity, aids weight management,
                  and reduces cardiovascular risk factors associated with diabetes.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* ── RIGHT (1/3) ── */}
          <div className="space-y-5">

            {/* Quick stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-white font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Duration',    value: `${exercise.duration} min`,   color: 'text-green-400' },
                  { label: 'Calories',    value: `${exercise.caloriesBurn} kcal`, color: 'text-orange-400' },
                  { label: 'Difficulty',  value: exercise.difficulty,           color: `${DIFF_COLORS[exercise.difficulty].split(' ')[1]}` },
                  { label: 'Category',    value: cat.label,                     color: 'text-gray-300' },
                  { label: 'Equipment',   value: exercise.equipment,            color: 'text-gray-300' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                    <span className="text-gray-500 text-sm">{stat.label}</span>
                    <span className={`text-sm font-semibold capitalize ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <button className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-[1.02]">
                🚀 Start This Exercise
              </button>
              <button
                onClick={() => setSaved(!saved)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all border ${
                  saved
                    ? 'bg-green-500/15 border-green-500/40 text-green-400'
                    : 'border-gray-700 text-gray-300 hover:border-green-500/30 hover:text-green-400'
                }`}
              >
                {saved ? <FaBookmark size={13} /> : <FiBookmark size={13} />}
                {saved ? 'Saved!' : 'Save Exercise'}
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs border border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all"
              >
                <FiShare2 size={13} /> Share
              </button>
            </motion.div>

            {/* Related exercises */}
            {related.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-white font-bold mb-4">Related Exercises</h3>
                <div className="space-y-3">
                  {related.map((rel) => {
                    const relCat = CATEGORY_COLORS[rel.category] || CATEGORY_COLORS.cardio;
                    return (
                      <Link
                        key={rel._id}
                        to={`/exercises/${rel._id}`}
                        className="flex gap-3 bg-gray-800/40 border border-gray-700/40 hover:border-green-500/20 rounded-xl p-3 transition-all group"
                      >
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-green-400 transition-colors">
                            {rel.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">{rel.duration} min · {rel.caloriesBurn} kcal</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${relCat.pill}`}>
                            {relCat.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
