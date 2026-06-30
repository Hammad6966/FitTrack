import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiTrash2, FiDownload, FiPlus, FiX } from 'react-icons/fi';
import { FaFire, FaDumbbell, FaWeight, FaHeartbeat } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { progressAPI } from '../utils/api';

const fmtDate  = (iso) => new Date(iso).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
const todayISO = () => new Date().toISOString().split('T')[0];

const MOODS = [
  { value: 'excellent', emoji: '😁', label: 'Excellent' },
  { value: 'good',      emoji: '😊', label: 'Good' },
  { value: 'neutral',   emoji: '😐', label: 'Neutral' },
  { value: 'bad',       emoji: '😔', label: 'Bad' },
  { value: 'terrible',  emoji: '😢', label: 'Terrible' },
];

function Trend({ val, invert = false }) {
  if (val === 0) return <FiMinus className="text-gray-500" size={14} />;
  const up   = val > 0;
  const good = invert ? !up : up;
  return up
    ? <FiTrendingUp   className={good ? 'text-green-400' : 'text-red-400'} size={14} />
    : <FiTrendingDown className={good ? 'text-green-400' : 'text-red-400'} size={14} />;
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  );
};

const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

export default function ProgressTracker() {
  const { isAuthenticated, user } = useAuth();

  const [entries,   setEntries]   = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({
    date: todayISO(), weight: '', bloodSugar: '', mood: 'good', caloriesBurned: '', notes: '',
  });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [entRes, stRes] = await Promise.all([
        progressAPI.getAll(),
        progressAPI.getStats(),
      ]);
      setEntries(entRes.data?.data || []);
      setStats(stRes.data?.data   || null);
    } catch {
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: { pathname: '/progress' } }} replace />;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.weight) { toast.error('Please enter your weight'); return; }
    try {
      await progressAPI.create({
        date:           form.date,
        weight:         parseFloat(form.weight),
        bloodSugar:     form.bloodSugar ? parseInt(form.bloodSugar) : null,
        caloriesBurned: form.caloriesBurned ? parseInt(form.caloriesBurned) : 0,
        mood:           form.mood,
        notes:          form.notes.trim(),
      });
      setForm({ date: todayISO(), weight: '', bloodSugar: '', mood: 'good', caloriesBurned: '', notes: '' });
      setShowForm(false);
      toast.success('Progress logged! 🎉');
      refresh();
    } catch {
      toast.error('Failed to log progress');
    }
  }, [form, refresh]);

  const deleteEntry = async (id) => {
    try {
      await progressAPI.delete(id);
      toast.success('Entry deleted');
      refresh();
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const exportCSV = () => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const header = 'Date,Weight (kg),BMI,Blood Sugar (mg/dL),Calories Burned,Mood,Notes';
    const rows   = sorted.map((e) =>
      `${e.date},${e.weight},${e.bmi ?? ''},${e.bloodSugar ?? ''},${e.caloriesBurned || 0},${e.mood},"${e.notes || ''}"`
    );
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'fittrack-progress.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const moodEmoji = (val) => MOODS.find((m) => m.value === val)?.emoji ?? '😐';

  const weightTrend  = stats?.weightTrend  ?? 0;
  const bmiTrend     = stats?.bmiTrend     ?? 0;
  const weekWorkouts = stats?.weekWorkouts ?? 0;
  const weekCals     = stats?.weekCals     ?? 0;
  const weightData   = stats?.weightData   || [];
  const barData      = stats?.caloriesData || [];

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              My Progress{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Athlete'} 👋</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 text-sm transition-all hover:scale-[1.02]"
          >
            {showForm ? <FiX size={14} /> : <FiPlus size={14} />}
            {showForm ? 'Cancel' : 'Log Today'}
          </button>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: FaWeight,    label: 'Current Weight',       value: stats ? `${stats.currentWeight} kg` : '— kg', trend: weightTrend,  invert: true,  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
            { icon: FaHeartbeat, label: 'BMI',                  value: stats ? `${stats.currentBMI}`        : '—',    trend: bmiTrend,     invert: true,  color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: FaDumbbell,  label: 'Workouts This Week',   value: `${weekWorkouts} sessions`,                                          invert: false, color: 'text-green-400',  bg: 'bg-green-500/10' },
            { icon: FaFire,      label: 'Calories Burned (7d)', value: `${weekCals.toLocaleString()} kcal`,                                  invert: false, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <Icon className={s.color} size={18} />
                  </div>
                  {s.trend !== undefined && <Trend val={s.trend} invert={s.invert} />}
                </div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                {s.trend !== undefined && s.trend !== 0 && (
                  <p className={`text-xs mt-1 ${s.trend > 0 === !s.invert ? 'text-green-400' : 'text-red-400'}`}>
                    {s.trend > 0 ? '+' : ''}{s.trend} from yesterday
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── LOG FORM ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-800/50 border border-green-500/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-black text-lg mb-5">Log Today&apos;s Progress</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1.5">Date</label>
                      <input
                        type="date" value={form.date} max={todayISO()}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1.5">Weight (kg) *</label>
                      <input
                        type="number" step="0.1" min="20" max="300"
                        value={form.weight} placeholder="e.g. 75.5"
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        className="input-dark" required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1.5">
                        Blood Sugar (mg/dL) <span className="text-gray-600">optional</span>
                      </label>
                      <input
                        type="number" min="50" max="400"
                        value={form.bloodSugar} placeholder="e.g. 110"
                        onChange={(e) => setForm({ ...form, bloodSugar: e.target.value })}
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs font-medium mb-1.5">Calories Burned</label>
                      <input
                        type="number" min="0"
                        value={form.caloriesBurned} placeholder="e.g. 350"
                        onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
                        className="input-dark"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-gray-300 text-xs font-medium mb-1.5">Today&apos;s Mood</label>
                      <div className="flex gap-2 flex-wrap">
                        {MOODS.map((m) => (
                          <button
                            key={m.value} type="button"
                            onClick={() => setForm({ ...form, mood: m.value })}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                              form.mood === m.value
                                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                                : 'bg-gray-700/30 border-gray-600/30 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <span className="text-base">{m.emoji}</span> {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-gray-300 text-xs font-medium mb-1.5">Notes</label>
                    <textarea
                      rows={2} value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="How did today feel? Any observations..."
                      className="input-dark resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-sm"
                  >
                    Save Entry
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CHARTS ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5 animate-pulse">
                <div className="h-4 w-32 bg-gray-700/60 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-700/40 rounded mb-5" />
                <div className="h-48 bg-gray-700/30 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-1">Weight Over Time</h3>
              <p className="text-gray-500 text-xs mb-5">Last 30 entries (kg)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone" dataKey="Weight" stroke="#22c55e" strokeWidth={2.5} name="Weight" unit=" kg"
                    dot={false} activeDot={{ r: 5, fill: '#4ade80', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-1">Calories Burned</h3>
              <p className="text-gray-500 text-xs mb-5">Last 7 days (kcal)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Calories" fill="#22c55e" radius={[6, 6, 0, 0]} name="Calories" unit=" kcal" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* ── HISTORY TABLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Progress History</h2>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:border-green-500/30 hover:text-green-400 rounded-xl text-xs font-medium transition-all"
            >
              <FiDownload size={13} /> Export CSV
            </button>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900/60">
                    {['Date', 'Weight', 'BMI', 'Blood Sugar', 'Calories', 'Mood', 'Notes', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {entries.slice(0, 10).map((entry, i) => (
                      <motion.tr
                        key={entry._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-gray-700/20 last:border-0 ${i % 2 === 0 ? 'bg-gray-900/10' : ''}`}
                      >
                        <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap font-medium">{fmtDate(entry.date)}</td>
                        <td className="px-4 py-3 text-white font-bold text-xs">{entry.weight} kg</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${
                            entry.bmi < 18.5 ? 'text-blue-400' :
                            entry.bmi < 25   ? 'text-green-400' :
                            entry.bmi < 30   ? 'text-yellow-400' : 'text-red-400'
                          }`}>{entry.bmi ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs">
                          {entry.bloodSugar ? `${entry.bloodSugar} mg/dL` : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-orange-400 text-xs font-medium">
                          {entry.caloriesBurned ? `${entry.caloriesBurned} kcal` : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xl">{moodEmoji(entry.mood)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px]">
                          <span className="line-clamp-1">{entry.notes || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteEntry(entry._id)}
                            className="text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {entries.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-600">
                        No progress logged yet. Click &ldquo;Log Today&rdquo; to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {entries.length > 10 && (
            <p className="text-gray-600 text-xs text-center mt-3">
              Showing 10 most recent entries of {entries.length} total
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
