import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiSearch, FiClock, FiBookmark, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFire, FaBookmark } from 'react-icons/fa';
import { CATEGORY_COLORS } from '../utils/mockData';
import { exerciseAPI } from '../utils/api';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORIES  = ['all', 'cardio', 'strength', 'flexibility', 'balance', 'yoga', 'diabetes_friendly'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];
const PER_PAGE     = 6;

const DIFF_COLORS = {
  beginner:     'bg-green-500/15 text-green-400 border border-green-500/20',
  intermediate: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  advanced:     'bg-red-500/15 text-red-400 border border-red-500/20',
};

function ExerciseCard({ ex, saved, onToggleSave }) {
  const cat = CATEGORY_COLORS[ex.category] || CATEGORY_COLORS.cardio;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={ex.imageUrl}
          alt={ex.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
        <button
          onClick={(e) => { e.preventDefault(); onToggleSave(ex.id); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 ${
            saved ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 'bg-gray-900/70 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {saved ? <FaBookmark size={13} /> : <FiBookmark size={13} />}
        </button>
        <span className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.pill}`}>
          {cat.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-1.5 line-clamp-1">{ex.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{ex.description}</p>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="flex items-center gap-1.5 text-gray-400 text-xs">
            <FiClock size={12} className="text-green-400" /> {ex.duration} min
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 text-xs">
            <FaFire size={12} className="text-orange-400" /> {ex.caloriesBurn} kcal
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${DIFF_COLORS[ex.difficulty]}`}>
            {ex.difficulty}
          </span>
        </div>

        <Link
          to={`/exercises/${ex.id}`}
          className="block w-full text-center py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-green-500/20"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

export default function Exercises() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDiff]   = useState('all');
  const [sort, setSort]         = useState('latest');
  const [page, setPage]         = useState(1);
  const [saved, setSaved]       = useState(new Set());
  const [exercises, setExercises] = useState([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, sort };
      if (search.trim())     params.search     = search.trim();
      if (category !== 'all') params.category  = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      const { data: res } = await exerciseAPI.getAll(params);
      setExercises(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch {
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, difficulty, sort]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const go = (setter, val) => { setter(val); setPage(1); };
  const toggleSave = (id) => setSaved((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600"
          alt="Exercise library"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-900/65 to-gray-950" />
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-3">
              💪 500+ Workouts
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
              Exercise{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Library
              </span>
            </h1>
            <p className="text-gray-300 text-lg">Workouts for every fitness level and health goal</p>
          </motion.div>
        </div>
      </div>

      {/* ── STICKY FILTERS ── */}
      <div className="sticky top-16 z-30 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 py-4 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => go(setSearch, e.target.value)}
              placeholder="Search exercises by name or keyword..."
              className="w-full pl-11 pr-4 py-3 bg-gray-800/70 border border-gray-700/50 rounded-full text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => go(setCategory, cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    category === cat
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/25'
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                  }`}
                >
                  {cat === 'diabetes_friendly' ? 'Diabetes Friendly' : cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <FiFilter size={13} className="text-gray-500 flex-shrink-0" />
              <select
                value={difficulty}
                onChange={(e) => go(setDiff, e.target.value)}
                className="bg-gray-800/70 border border-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-gray-800 capitalize">
                    {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="bg-gray-800/70 border border-gray-700/50 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50"
              >
                <option value="latest"   className="bg-gray-800">Latest</option>
                <option value="calories" className="bg-gray-800">Most Calories</option>
                <option value="duration" className="bg-gray-800">Shortest First</option>
              </select>
            </div>
          </div>

          <p className="text-gray-500 text-xs">
            {loading ? 'Loading...' : <><span className="text-green-400 font-semibold">{total}</span> exercises found</>}
            {search && !loading && <> for &ldquo;<span className="text-white">{search}</span>&rdquo;</>}
          </p>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : exercises.length > 0 ? (
            <motion.div
              key={`page-${page}-${category}-${difficulty}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {exercises.map((ex) => (
                <ExerciseCard key={ex._id} ex={{ ...ex, id: ex._id }} saved={saved.has(ex._id)} onToggleSave={toggleSave} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="text-7xl mb-4">🏋️</div>
              <h3 className="text-white font-bold text-xl mb-2">No exercises found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearch(''); setCategory('all'); setDiff('all'); setPage(1); }}
                className="px-6 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/20 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-green-500/50 hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              <FiChevronLeft size={16} /> Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                    p === page
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-green-500/50 hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
