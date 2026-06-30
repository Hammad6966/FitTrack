import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiInfo, FiTrash2 } from 'react-icons/fi';
import { FaRulerVertical, FaWeight, FaUser, FaChartLine } from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

/* ── helpers ── */
const getBmiCat = (bmi) => {
  const v = parseFloat(bmi);
  if (v < 18.5) return { label: 'Underweight', color: 'text-blue-400',   bg: 'bg-blue-400',    border: 'border-blue-500/30',   pct: Math.max(4, ((v - 10) / 8.5) * 23),          advice: 'You may need to gain weight. Focus on nutrient-dense foods and add strength training to build lean mass.' };
  if (v < 25)   return { label: 'Normal Weight', color: 'text-green-400', bg: 'bg-green-400',   border: 'border-green-500/30',  pct: 23 + ((v - 18.5) / 6.5) * 30,                advice: 'Great job! Maintain your healthy weight with regular exercise and a balanced, whole-foods diet.' };
  if (v < 30)   return { label: 'Overweight',  color: 'text-yellow-400', bg: 'bg-yellow-400',  border: 'border-yellow-500/30', pct: 53 + ((v - 25) / 5) * 25,                     advice: 'Consider gradually reducing caloric intake and increasing physical activity to 150+ minutes per week.' };
  return               { label: 'Obese',       color: 'text-red-400',    bg: 'bg-red-400',     border: 'border-red-500/30',    pct: Math.min(96, 78 + (v - 30) * 2),              advice: 'Please consult a healthcare provider for a safe, personalized weight management plan.' };
};

const healthyRange = (h) => ({ min: (18.5 * (h / 100) ** 2).toFixed(1), max: (24.9 * (h / 100) ** 2).toFixed(1) });

/* ── Animated BMI number ── */
function AnimBmi({ value }) {
  const [disp, setDisp] = useState('0.0');
  useEffect(() => {
    if (!value) return;
    let start = null;
    const target = parseFloat(value);
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 700, 1);
      setDisp(((1 - Math.pow(1 - p, 3)) * target).toFixed(1));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{disp}</span>;
}

/* ── BMI Scale bar ── */
function ScaleBar({ bmi }) {
  const clamp = Math.min(Math.max(parseFloat(bmi), 10), 42);
  const pct   = ((clamp - 10) / 32) * 100;
  return (
    <div>
      <div
        className="relative h-5 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(to right, #60a5fa 0%, #34d399 22%, #22c55e 42%, #facc15 62%, #f97316 80%, #ef4444 100%)' }}
      >
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `calc(${pct}% - 10px)` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xl border-2 border-gray-100"
          style={{ boxShadow: '0 0 0 3px rgba(34,197,94,0.35)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1.5 px-0.5">
        <span>10</span>
        <span className="text-blue-400">18.5</span>
        <span className="text-green-400">25</span>
        <span className="text-yellow-400">30</span>
        <span>42+</span>
      </div>
      <div className="flex justify-between text-xs mt-0.5 px-0.5">
        <span className="text-blue-400/60 text-xs">Under</span>
        <span className="text-green-400/60 text-xs ml-3">Normal</span>
        <span className="text-yellow-400/60 text-xs">Over</span>
        <span className="text-red-400/60 text-xs">Obese</span>
      </div>
    </div>
  );
}

const TIPS = [
  { icon: FaRulerVertical, title: 'Stand Tall',           desc: 'Measure height without shoes, standing straight against a wall with heels together.' },
  { icon: FaWeight,        title: 'Morning Weight',       desc: 'Weigh yourself in the morning after using the bathroom, before eating or drinking.' },
  { icon: FaUser,          title: 'Consistent Clothing',  desc: 'Wear minimal, similar clothing each time you weigh yourself for consistent results.' },
  { icon: FaChartLine,     title: 'Track Weekly',         desc: 'Weigh weekly rather than daily — normal fluctuations of 1–2 kg per day are expected.' },
];

const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function BMICalculator() {
  const [unit, setUnit]       = useState('metric');
  const [height, setHeight]   = useState('');
  const [hFt, setHFt]         = useState('');
  const [hIn, setHIn]         = useState('');
  const [weight, setWeight]   = useState('');
  const [age, setAge]         = useState('');
  const [gender, setGender]   = useState('male');
  const [bmi, setBmi]         = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fittrack_bmi_history') || '[]'); }
    catch { return []; }
  });
  const resultRef = useRef(null);

  const cat   = bmi ? getBmiCat(bmi) : null;
  const range = (unit === 'metric' && height) ? healthyRange(parseFloat(height)) : null;

  const handleCalc = () => {
    let val;
    if (unit === 'metric') {
      const h = parseFloat(height) / 100, w = parseFloat(weight);
      if (!h || !w || h <= 0 || w <= 0) return;
      val = (w / (h * h)).toFixed(1);
    } else {
      const totalIn = parseFloat(hFt) * 12 + parseFloat(hIn || 0);
      const w = parseFloat(weight);
      if (!totalIn || !w) return;
      val = ((w * 703) / (totalIn * totalIn)).toFixed(1);
    }
    setBmi(val);
    const entry = { date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short' }), bmi: parseFloat(val) };
    const next  = [...history, entry].slice(-10);
    setHistory(next);
    localStorage.setItem('fittrack_bmi_history', JSON.stringify(next));
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const reset = () => { setHeight(''); setWeight(''); setHFt(''); setHIn(''); setAge(''); setBmi(null); };

  const nextSteps = bmi
    ? [
        { show: parseFloat(bmi) < 18.5,                                    color: 'from-blue-500 to-cyan-600',     title: 'Gain Weight Plan',    icon: '📈', desc: 'Increase calorie intake with nutrient-dense foods. Add strength training to build lean muscle mass.' },
        { show: parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25,           color: 'from-green-500 to-emerald-600', title: 'Maintain Weight Plan', icon: '✅', desc: 'Keep up your healthy habits with balanced nutrition and at least 150 minutes of exercise per week.' },
        { show: parseFloat(bmi) >= 25,                                       color: 'from-orange-500 to-red-500',    title: 'Lose Weight Plan',    icon: '📉', desc: 'Start a moderate calorie deficit diet combined with cardio and strength training for best results.' },
      ].filter((s) => s.show)
    : [];

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-green-950">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-4">
            🧮 Health Assessment Tool
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none">
            BMI{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="text-gray-400 text-xl max-w-lg mx-auto">
            Understand your body composition and get personalized health insights.
          </p>
        </motion.div>
      </div>

      {/* ── CALCULATOR ── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
          >
            {/* Unit toggle */}
            <div className="flex bg-gray-900/60 rounded-xl p-1 mb-8 w-fit">
              {['metric', 'imperial'].map((u) => (
                <button
                  key={u}
                  onClick={() => { setUnit(u); reset(); }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                    unit === u
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {u === 'metric' ? 'Metric (cm/kg)' : 'Imperial (ft/lbs)'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Height */}
              <div className={unit === 'imperial' ? 'sm:col-span-2' : ''}>
                <label className="block text-gray-300 text-sm font-medium mb-2">Height</label>
                {unit === 'metric' ? (
                  <div className="relative">
                    <input
                      type="number" value={height}
                      onChange={(e) => { setHeight(e.target.value); setBmi(null); }}
                      placeholder="170" className="input-dark pr-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">cm</span>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input type="number" value={hFt} onChange={(e) => { setHFt(e.target.value); setBmi(null); }} placeholder="5" className="input-dark pr-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ft</span>
                    </div>
                    <div className="relative flex-1">
                      <input type="number" value={hIn} onChange={(e) => { setHIn(e.target.value); setBmi(null); }} placeholder="8" className="input-dark pr-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">in</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Weight</label>
                <div className="relative">
                  <input
                    type="number" value={weight}
                    onChange={(e) => { setWeight(e.target.value); setBmi(null); }}
                    placeholder={unit === 'metric' ? '70' : '155'} className="input-dark pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    {unit === 'metric' ? 'kg' : 'lbs'}
                  </span>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Age <span className="text-gray-600 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number" value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25" className="input-dark pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">yrs</span>
                </div>
              </div>

              {/* Gender */}
              <div className="sm:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Gender</label>
                <div className="flex gap-3">
                  {[['male', '♂ Male'], ['female', '♀ Female']].map(([g, label]) => (
                    <button
                      key={g} onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                        gender === g
                          ? 'bg-green-500/15 border-green-500/40 text-green-400'
                          : 'bg-gray-700/30 border-gray-600/40 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCalc}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
            >
              Calculate My BMI
            </button>
          </motion.div>

          {/* ── RESULT ── */}
          <AnimatePresence>
            {bmi && cat && (
              <motion.div
                ref={resultRef}
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`mt-6 bg-gray-800/50 border ${cat.border} rounded-3xl p-8 shadow-2xl`}
              >
                <div className="text-center mb-8">
                  <p className="text-gray-400 text-sm mb-2">Your BMI</p>
                  <p className={`text-8xl font-black mb-4 leading-none ${cat.color}`}>
                    <AnimBmi value={bmi} />
                  </p>
                  <span className={`inline-block px-6 py-2.5 rounded-full text-sm font-black text-white ${cat.bg} shadow-lg`}>
                    {cat.label}
                  </span>
                </div>

                <div className="mb-7">
                  <ScaleBar bmi={bmi} />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-700/30 rounded-xl mb-5">
                  <FiInfo className={`flex-shrink-0 mt-0.5 ${cat.color}`} size={15} />
                  <p className="text-gray-300 text-sm leading-relaxed">{cat.advice}</p>
                </div>

                {range && (
                  <p className="text-center text-gray-400 text-sm">
                    Healthy weight range for your height:{' '}
                    <span className="text-green-400 font-bold">{range.min} – {range.max} kg</span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── CATEGORIES TABLE ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.08 }}
        className="py-16 px-4 bg-gray-900"
      >
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl font-black text-white text-center mb-8">
            BMI Categories & Health Risk
          </motion.h2>
          <motion.div variants={fadeUp} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="text-left px-6 py-4 text-gray-400 text-xs uppercase tracking-wider">BMI Range</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-xs uppercase tracking-wider">Health Risk</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: '< 18.5',    label: 'Underweight',     risk: 'Moderate',  color: 'text-blue-400',   dot: 'bg-blue-400' },
                  { range: '18.5–24.9', label: 'Normal Weight',   risk: 'Minimal',   color: 'text-green-400',  dot: 'bg-green-400' },
                  { range: '25.0–29.9', label: 'Overweight',      risk: 'Increased', color: 'text-yellow-400', dot: 'bg-yellow-400' },
                  { range: '30.0–34.9', label: 'Obese Class I',   risk: 'High',      color: 'text-orange-400', dot: 'bg-orange-400' },
                  { range: '35.0+',     label: 'Obese Class II+', risk: 'Very High', color: 'text-red-400',    dot: 'bg-red-400' },
                ].map((row, i) => (
                  <tr key={row.range} className={i % 2 === 0 ? 'bg-gray-900/20' : ''}>
                    <td className={`px-6 py-4 font-bold ${row.color}`}>{row.range}</td>
                    <td className="px-6 py-4 text-white">
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.dot}`} /> {row.label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${row.color}`}>{row.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </motion.section>

      {/* ── DIABETES CONNECTION ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
        transition={{ staggerChildren: 0.1 }}
        className="py-16 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">BMI & Diabetes Risk</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Your BMI is one of the strongest predictors of Type 2 diabetes. Understanding your risk empowers better choices.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { range: 'BMI 18.5 – 24.9', risk: 'Low Risk',      bg: 'border-green-500/20 bg-green-500/5',    badge: 'bg-green-500/15 text-green-400',    desc: 'Normal weight carries the lowest diabetes risk. Sustain it with regular exercise and a low-GI diet.' },
              { range: 'BMI 25 – 29.9',   risk: 'Moderate Risk', bg: 'border-yellow-500/20 bg-yellow-500/5',  badge: 'bg-yellow-500/15 text-yellow-400',  desc: 'Overweight individuals have 3× higher diabetes risk. Losing 5–10% of body weight dramatically lowers it.' },
              { range: 'BMI 30+',         risk: 'High Risk',     bg: 'border-red-500/20 bg-red-500/5',        badge: 'bg-red-500/15 text-red-400',        desc: 'Obesity is the strongest modifiable risk factor for Type 2 diabetes. Seek medical guidance for a safe plan.' },
            ].map((c) => (
              <motion.div key={c.range} variants={fadeUp} className={`border rounded-2xl p-6 ${c.bg}`}>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${c.badge}`}>{c.risk}</span>
                <h3 className="text-white font-bold mb-2">{c.range}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── NEXT STEPS (conditional on result) ── */}
      <AnimatePresence>
        {nextSteps.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 px-4 bg-gray-900"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-white text-center mb-8">Your Next Steps</h2>
              <div className="flex justify-center gap-5 flex-wrap">
                {nextSteps.map((step) => (
                  <div key={step.title} className={`bg-gradient-to-br ${step.color} p-px rounded-2xl flex-1 min-w-[260px] max-w-sm`}>
                    <div className="bg-gray-950 rounded-2xl p-6 h-full">
                      <p className="text-4xl mb-3">{step.icon}</p>
                      <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-5">{step.desc}</p>
                      <Link
                        to="/exercises"
                        className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${step.color} text-white text-sm font-semibold rounded-xl shadow-lg`}
                      >
                        Get Started <FiArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── HISTORY ── */}
      {history.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Your BMI History</h2>
              <button
                onClick={() => { setHistory([]); localStorage.removeItem('fittrack_bmi_history'); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs hover:bg-red-500/20 transition-colors"
              >
                <FiTrash2 size={12} /> Clear
              </button>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-6">
              {history.length >= 2 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, color: '#f9fafb', fontSize: 12 }} />
                    <Line type="monotone" dataKey="bmi" stroke="#22c55e" strokeWidth={2.5}
                      dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#4ade80' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">Calculate BMI at least twice to see your trend chart.</p>
              )}
              <div className="mt-4 space-y-2">
                {[...history].reverse().map((entry, i) => {
                  const c = getBmiCat(entry.bmi);
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                      <span className="text-gray-500 text-xs">{entry.date}</span>
                      <span className={`font-bold text-sm ${c.color}`}>{entry.bmi}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full text-white ${c.bg}`}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TIPS ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
        className="py-16 px-4 bg-gray-900"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl font-black text-white text-center mb-10">
            Tips for Accurate Measurement
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  variants={fadeUp}
                  className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <Icon className="text-green-400" size={18} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{tip.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
