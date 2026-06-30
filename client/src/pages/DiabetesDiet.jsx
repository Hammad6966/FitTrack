import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiChevronDown, FiPlus, FiCheck } from 'react-icons/fi';
import { FaUtensils, FaClock, FaFireAlt } from 'react-icons/fa';

const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ── MEAL FOODS DATA ── */
const MEAL_FOODS = {
  breakfast: [
    { name: 'Oatmeal',             cal: 150, carbs: 27, protein: 5,  fat: 3  },
    { name: 'Greek Yogurt',        cal: 100, carbs: 10, protein: 17, fat: 0  },
    { name: 'Boiled Eggs (2)',      cal: 140, carbs: 0,  protein: 12, fat: 10 },
    { name: 'Whole Wheat Toast',   cal: 80,  carbs: 15, protein: 3,  fat: 1  },
    { name: 'Avocado (½)',         cal: 120, carbs: 6,  protein: 1,  fat: 11 },
  ],
  lunch: [
    { name: 'Grilled Chicken',     cal: 180, carbs: 0,  protein: 35, fat: 4  },
    { name: 'Brown Rice (½ cup)',   cal: 108, carbs: 22, protein: 2,  fat: 1  },
    { name: 'Mixed Green Salad',   cal: 80,  carbs: 10, protein: 2,  fat: 5  },
    { name: 'Lentil Soup',         cal: 230, carbs: 40, protein: 18, fat: 1  },
    { name: 'Quinoa (½ cup)',       cal: 111, carbs: 20, protein: 4,  fat: 2  },
  ],
  dinner: [
    { name: 'Baked Fish',          cal: 200, carbs: 0,  protein: 40, fat: 5  },
    { name: 'Steamed Vegetables',  cal: 60,  carbs: 12, protein: 3,  fat: 0  },
    { name: 'Whole Grain Pasta',   cal: 180, carbs: 36, protein: 7,  fat: 1  },
    { name: 'Turkey Stir-fry',     cal: 250, carbs: 15, protein: 30, fat: 8  },
    { name: 'Bean Curry',          cal: 280, carbs: 45, protein: 14, fat: 6  },
  ],
  snacks: [
    { name: 'Almonds (30g)',       cal: 164, carbs: 6,  protein: 6,  fat: 14 },
    { name: 'Apple',               cal: 95,  carbs: 25, protein: 0,  fat: 0  },
    { name: 'Hummus + Veggies',    cal: 120, carbs: 12, protein: 5,  fat: 6  },
    { name: 'Protein Bar',         cal: 180, carbs: 20, protein: 15, fat: 5  },
    { name: 'Green Tea',           cal: 2,   carbs: 0,  protein: 0,  fat: 0  },
  ],
};

const MEAL_META = {
  breakfast: { label: 'Breakfast', icon: '🌅', time: '7:00 – 9:00 AM', target: 400 },
  lunch:     { label: 'Lunch',     icon: '☀️', time: '12:00 – 1:30 PM', target: 500 },
  dinner:    { label: 'Dinner',    icon: '🌙', time: '6:30 – 8:00 PM',  target: 450 },
  snacks:    { label: 'Snacks',    icon: '🍎', time: 'Between meals',    target: 200 },
};

const GI_DATA = [
  { gi: 'Low GI (< 55)',    items: [{ name: 'Apple',         gi: 38, serving: '1 medium', rec: '✅ Excellent choice' }, { name: 'Lentils',      gi: 29, serving: '½ cup cooked', rec: '✅ Daily staple' }, { name: 'Chickpeas',    gi: 28, serving: '½ cup',        rec: '✅ Great protein source' }, { name: 'Nuts',         gi: 14, serving: '30g handful',  rec: '✅ Healthy snack' }, { name: 'Full-fat dairy', gi: 34, serving: '1 cup',       rec: '✅ In moderation' }], color: 'border-green-500/20 bg-green-500/5', badge: 'bg-green-500/15 text-green-400', dot: 'bg-green-500' },
  { gi: 'Medium GI (55–69)', items: [{ name: 'Whole Wheat Bread', gi: 69, serving: '1 slice',      rec: '⚠️ Limit portions' }, { name: 'Brown Rice',      gi: 55, serving: '½ cup cooked', rec: '⚠️ Moderate amounts' }, { name: 'Sweet Potato',    gi: 63, serving: 'Medium boiled', rec: '⚠️ Better than white' }], color: 'border-yellow-500/20 bg-yellow-500/5', badge: 'bg-yellow-500/15 text-yellow-400', dot: 'bg-yellow-500' },
  { gi: 'High GI (70+)',    items: [{ name: 'White Bread',  gi: 73, serving: '1 slice',   rec: '❌ Avoid or minimize' }, { name: 'White Rice',  gi: 72, serving: '½ cup',     rec: '❌ Choose brown rice' }, { name: 'Watermelon',  gi: 76, serving: '1 cup',     rec: '❌ Small portions only' }, { name: 'Cornflakes',  gi: 81, serving: '1 cup',     rec: '❌ Poor choice' }], color: 'border-red-500/20 bg-red-500/5', badge: 'bg-red-500/15 text-red-400', dot: 'bg-red-500' },
];

const FAQS = [
  { q: 'When should diabetics eat?', a: 'Aim for 3 regular meals and 1–2 healthy snacks daily at consistent times. Eating at the same times each day helps regulate blood sugar. Avoid skipping meals, especially breakfast, as this can cause blood sugar swings. Eat every 3–4 hours to keep levels stable.' },
  { q: 'How many carbs per day for diabetics?', a: 'Most adults with Type 2 diabetes benefit from 45–60 grams of carbohydrates per meal (135–180g/day). However, this varies significantly by individual. Work with a registered dietitian to personalize your carb goal based on your medications, weight, and blood sugar targets.' },
  { q: 'Can diabetics eat fruit?', a: 'Yes! Whole fruits are generally fine in moderation. Choose lower-GI fruits like berries, apples, pears, and citrus. Aim for 1–2 servings per day. Pair fruit with protein or healthy fat to slow glucose absorption. Avoid fruit juices which lack fiber and spike blood sugar rapidly.' },
  { q: 'What to eat before exercise?', a: 'If your blood sugar is below 5.6 mmol/L (100 mg/dL) before exercise, eat a small snack with 15–30g of fast-acting carbs (e.g., an apple or 1 slice of toast). If above that range, you can typically exercise without eating. Always check blood sugar before and after exercise.' },
  { q: 'How to read food labels for diabetes management?', a: 'Focus on: Total Carbohydrates (not just "sugars"), serving size, fiber content (more is better — aim for 3g+ per serving), and ingredients list (avoid added sugars in the first 3 ingredients). Look for "whole grain" as the first ingredient. Check sodium too — diabetics have higher cardiovascular risk.' },
];

/* ── Meal Planner Component ── */
function MealSection({ mealKey, selected, onToggle }) {
  const meta  = MEAL_META[mealKey];
  const foods = MEAL_FOODS[mealKey];
  const selList = selected[mealKey] || [];
  const secCal  = selList.reduce((s, f) => s + f.cal, 0);

  return (
    <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h4 className="text-white font-bold">{meta.label}</h4>
            <p className="text-gray-500 text-xs">{meta.time}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${secCal > meta.target ? 'text-red-400' : 'text-green-400'}`}>
            {secCal} kcal
          </p>
          <p className="text-gray-600 text-xs">target: {meta.target}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {foods.map((food) => {
          const isSelected = selList.some((f) => f.name === food.name);
          return (
            <button
              key={food.name}
              onClick={() => onToggle(mealKey, food)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                  : 'bg-gray-700/40 border border-gray-600/40 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              {isSelected ? <FiCheck size={11} /> : <FiPlus size={11} />}
              {food.name}
              <span className="text-gray-500 text-xs">{food.cal}kcal</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DiabetesDiet() {
  /* Meal planner state */
  const [selected, setSelected] = useState({ breakfast: [], lunch: [], dinner: [], snacks: [] });
  /* FAQ accordion */
  const [openFaq, setOpenFaq]   = useState(null);

  const toggleFood = (meal, food) => {
    setSelected((prev) => ({
      ...prev,
      [meal]: prev[meal].some((f) => f.name === food.name)
        ? prev[meal].filter((f) => f.name !== food.name)
        : [...prev[meal], food],
    }));
  };

  const totals = useMemo(() => {
    const all = Object.values(selected).flat();
    return {
      cal:     all.reduce((s, f) => s + f.cal,     0),
      carbs:   all.reduce((s, f) => s + f.carbs,   0),
      protein: all.reduce((s, f) => s + f.protein, 0),
      fat:     all.reduce((s, f) => s + f.fat,     0),
    };
  }, [selected]);

  const TARGET_CAL = 1600;

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── HERO ── */}
      <div className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600"
          alt="Diabetes diet"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-900/65 to-gray-950" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
              🩺 Medically Informed Content
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">
              Diabetes-Friendly{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Nutrition Guide
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Evidence-based dietary strategies to manage blood sugar, reduce medication needs, and live healthier with diabetes.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── SECTION 1: BASICS ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
        transition={{ staggerChildren: 0.12 }}
        className="py-16 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Blood Sugar Basics</h2>
            <p className="text-gray-400">Know what to eat, what to avoid, and how to keep your levels stable.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Foods to Eat */}
            <motion.div variants={fadeUp} className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-green-400 font-bold text-lg mb-4">Foods to Eat</h3>
              <ul className="space-y-2">
                {['Leafy greens (spinach, kale)', 'Whole grains (oats, quinoa)', 'Lean proteins (chicken, fish)', 'Berries (blueberries, strawberries)', 'Nuts and seeds', 'Avocado', 'Sweet potato (small portions)'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">•</span> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Foods to Avoid */}
            <motion.div variants={fadeUp} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">❌</div>
              <h3 className="text-red-400 font-bold text-lg mb-4">Foods to Avoid</h3>
              <ul className="space-y-2">
                {['White bread and white rice', 'Sugary drinks (soda, juices)', 'Candy and sweets', 'Fried fast food', 'Processed snacks (chips, crackers)', 'High-sugar breakfast cereals'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Tips */}
            <motion.div variants={fadeUp} className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-blue-400 font-bold text-lg mb-4">Blood Sugar Tips</h3>
              <ul className="space-y-2">
                {['Eat smaller, frequent meals', 'Stay hydrated (8+ glasses/day)', 'Exercise 30 min daily', 'Monitor levels regularly', "Don't skip meals", 'Read food labels carefully', 'Pair carbs with protein or fat'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 2: MEAL PLANS ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        transition={{ staggerChildren: 0.12 }}
        className="py-16 px-4 bg-gray-900"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-2">7-Day Diabetes Meal Plans</h2>
            <p className="text-gray-400">Professionally designed plans to manage blood sugar through nutrition.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                img:      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
                badge:    'Days 1–7',
                category: 'Low Carb',
                catColor: 'bg-green-500/20 text-green-400',
                title:    'Classic Diabetic Control Plan',
                cal:      '1,400–1,600 kcal/day',
                macros:   { carbs: 40, protein: 30, fat: 30 },
              },
              {
                img:      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
                badge:    'Days 1–7',
                category: 'Mediterranean',
                catColor: 'bg-blue-500/20 text-blue-400',
                title:    'Mediterranean Diabetes Diet',
                cal:      '1,600–1,800 kcal/day',
                macros:   { carbs: 45, protein: 25, fat: 30 },
              },
              {
                img:      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
                badge:    'Days 1–7',
                category: 'High Protein',
                catColor: 'bg-purple-500/20 text-purple-400',
                title:    'Protein-Rich Blood Sugar Plan',
                cal:      '1,500–1,700 kcal/day',
                macros:   { carbs: 30, protein: 40, fat: 30 },
              },
            ].map((plan) => (
              <motion.div
                key={plan.title}
                variants={fadeUp}
                className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-green-500/20 transition-all duration-300"
              >
                <div className="h-44 overflow-hidden">
                  <img src={plan.img} alt={plan.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${plan.catColor}`}>{plan.category}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-700/50 text-gray-400">{plan.badge}</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">{plan.title}</h3>
                  <p className="text-green-400 text-xs mb-4">🔥 {plan.cal}</p>
                  {/* Macro bar */}
                  <div className="mb-4">
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-yellow-400" style={{ width: `${plan.macros.carbs}%` }} title={`Carbs ${plan.macros.carbs}%`} />
                      <div className="bg-green-400" style={{ width: `${plan.macros.protein}%` }} title={`Protein ${plan.macros.protein}%`} />
                      <div className="bg-blue-400"  style={{ width: `${plan.macros.fat}%` }} title={`Fat ${plan.macros.fat}%`} />
                    </div>
                    <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Carbs {plan.macros.carbs}%</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Protein {plan.macros.protein}%</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Fat {plan.macros.fat}%</span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 border border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-xl text-sm font-semibold transition-colors">
                    View Full Plan
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 3: MEAL PLANNER ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        transition={{ staggerChildren: 0.1 }}
        className="py-16 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Build Your Daily Meal Plan</h2>
            <p className="text-gray-400">Click foods to add them to your plan and track daily calories and macros.</p>
          </motion.div>

          <div className="space-y-4 mb-8">
            {Object.keys(MEAL_FOODS).map((mealKey) => (
              <motion.div key={mealKey} variants={fadeUp}>
                <MealSection mealKey={mealKey} selected={selected} onToggle={toggleFood} />
              </motion.div>
            ))}
          </div>

          {/* Daily totals */}
          <motion.div variants={fadeUp} className={`rounded-2xl border p-6 ${totals.cal > TARGET_CAL ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <FaFireAlt className={totals.cal > TARGET_CAL ? 'text-red-400' : 'text-green-400'} size={16} />
              Daily Totals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Calories',  value: `${totals.cal} kcal`,  color: totals.cal > TARGET_CAL ? 'text-red-400' : 'text-green-400' },
                { label: 'Carbs',     value: `${totals.carbs}g`,    color: 'text-yellow-400' },
                { label: 'Protein',   value: `${totals.protein}g`,  color: 'text-blue-400' },
                { label: 'Fat',       value: `${totals.fat}g`,      color: 'text-purple-400' },
              ].map((t) => (
                <div key={t.label} className="text-center bg-gray-800/40 rounded-xl py-3 px-2">
                  <p className={`text-lg font-black ${t.color}`}>{t.value}</p>
                  <p className="text-gray-500 text-xs">{t.label}</p>
                </div>
              ))}
            </div>
            {/* Calorie progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>0 kcal</span>
                <span className={totals.cal > TARGET_CAL ? 'text-red-400' : 'text-green-400'}>
                  {totals.cal} / {TARGET_CAL} kcal target
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min((totals.cal / TARGET_CAL) * 100, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${totals.cal > TARGET_CAL ? 'bg-red-500' : 'bg-green-500'}`}
                />
              </div>
            </div>
            {totals.cal > TARGET_CAL && (
              <p className="text-red-400 text-xs text-center mb-4">⚠️ Over daily target by {totals.cal - TARGET_CAL} kcal</p>
            )}
            <button
              onClick={() => toast('Log in to save your personalized meal plan!', { icon: '🔐' })}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-sm hover:from-green-400 hover:to-emerald-500 transition-all"
            >
              Save My Plan
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ── SECTION 4: GLYCEMIC INDEX ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        transition={{ staggerChildren: 0.12 }}
        className="py-16 px-4 bg-gray-900"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-2">Glycemic Index Guide</h2>
            <p className="text-gray-400">The GI rating tells you how quickly a food raises blood sugar. Lower is better for diabetics.</p>
          </motion.div>
          <div className="space-y-6">
            {GI_DATA.map((group) => (
              <motion.div key={group.gi} variants={fadeUp} className={`border rounded-2xl overflow-hidden ${group.color}`}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-current/10">
                  <span className={`w-3 h-3 rounded-full ${group.dot}`} />
                  <span className={`font-bold text-sm ${group.badge.split(' ')[1]}`}>{group.gi}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {group.items.map((item) => (
                        <tr key={item.name} className="border-b border-gray-700/20 last:border-0">
                          <td className="px-5 py-3 text-white font-medium">{item.name}</td>
                          <td className="px-5 py-3 text-gray-400">GI: {item.gi}</td>
                          <td className="px-5 py-3 text-gray-400">{item.serving}</td>
                          <td className="px-5 py-3 text-gray-300 text-xs">{item.rec}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── SECTION 5: FAQ ACCORDION ── */}
      <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
        transition={{ staggerChildren: 0.1 }}
        className="py-16 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-400">Answers to common nutrition questions from our diabetes community.</p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-gray-800/40 border border-gray-700/40 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0 text-green-400"
                  >
                    <FiChevronDown size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-700/40 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
