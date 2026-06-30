require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Exercise = require('../models/Exercise');
const MealPlan = require('../models/MealPlan');
const Post     = require('../models/Post');

/* ─────────────────── USERS ─────────────────── */
const USERS = [
  {
    name: 'Admin',
    email: 'admin@fittrack.com',
    password: 'Admin@123',
    role: 'admin',
    profile: {
      age: 35,
      gender: 'male',
      height: 175,
      weight: 75,
      fitnessLevel: 'advanced',
      fitnessGoal: 'maintain',
      diabetesStatus: false,
      diabetesType: 'none',
    },
  },
  {
    name: 'Dr. Sarah Khan',
    email: 'trainer@fittrack.com',
    password: 'Trainer@123',
    role: 'trainer',
    profile: {
      age: 32,
      gender: 'female',
      height: 165,
      weight: 60,
      fitnessLevel: 'advanced',
      fitnessGoal: 'maintain',
      diabetesStatus: false,
      diabetesType: 'none',
    },
  },
  {
    name: 'Kamran Ali',
    email: 'user@fittrack.com',
    password: 'User@12345',
    role: 'user',
    profile: {
      age: 47,
      gender: 'male',
      height: 172,
      weight: 82,
      fitnessLevel: 'beginner',
      fitnessGoal: 'lose_weight',
      diabetesStatus: true,
      diabetesType: 'type2',
    },
  },
];

/* ─────────────────── EXERCISES ─────────────────── */
const EXERCISES = [
  {
    title: 'Brisk Walking',
    description: 'Low-impact cardiovascular exercise ideal for beginners and people with diabetes. Helps regulate blood sugar and improves heart health.',
    category: 'diabetes_friendly',
    difficulty: 'beginner',
    duration: 30,
    caloriesBurn: 150,
    instructions: [
      'Wear comfortable, supportive shoes.',
      'Start at a comfortable pace for 5 minutes to warm up.',
      'Increase to a brisk pace — you should be able to talk but not sing.',
      'Maintain good posture: head up, shoulders relaxed, arms swinging naturally.',
      'Walk for 20–30 minutes at this brisk pace.',
      'Cool down with a 5-minute slow walk and light stretching.',
    ],
    tags: ['cardio', 'diabetes', 'low-impact', 'outdoor'],
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
  },
  {
    title: 'Chair Yoga for Diabetes',
    description: 'Gentle yoga poses adapted for chairs, perfect for people with limited mobility or diabetes. Reduces stress and helps blood sugar control.',
    category: 'diabetes_friendly',
    difficulty: 'beginner',
    duration: 20,
    caloriesBurn: 60,
    instructions: [
      'Sit tall in a sturdy chair with feet flat on the floor.',
      'Seated Cat-Cow: inhale, arch your back; exhale, round your spine. Repeat 8 times.',
      'Seated Spinal Twist: right hand on left knee, twist gently left. Hold 5 breaths, switch sides.',
      'Seated Forward Fold: hinge at the hips and fold forward over your thighs. Hold 5 breaths.',
      'Ankle Rolls: lift one foot and rotate the ankle 10 times each direction.',
      'End with 2 minutes of seated deep breathing.',
    ],
    tags: ['yoga', 'diabetes', 'flexibility', 'chair', 'stress-relief'],
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
  },
  {
    title: 'Barbell Squat',
    description: 'The king of compound movements. Builds overall lower body strength and engages the core, glutes, quads, and hamstrings simultaneously.',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 45,
    caloriesBurn: 300,
    instructions: [
      'Set the barbell on a squat rack at shoulder height.',
      'Step under the bar and rest it across your upper traps.',
      'Grip the bar slightly wider than shoulder-width.',
      'Unrack the bar, step back, feet shoulder-width apart, toes slightly out.',
      'Take a deep breath, brace your core, and descend by pushing knees out and hips back.',
      'Lower until thighs are parallel to the floor or below.',
      'Drive through your heels to stand back up.',
      'Complete 3–5 sets of 5–8 reps.',
    ],
    tags: ['legs', 'compound', 'glutes', 'quads'],
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600',
  },
  {
    title: 'Push-Up',
    description: 'A foundational bodyweight exercise that builds chest, shoulder, and tricep strength with no equipment needed.',
    category: 'strength',
    difficulty: 'beginner',
    duration: 20,
    caloriesBurn: 100,
    instructions: [
      'Start in a high plank: hands slightly wider than shoulder-width, body in a straight line.',
      'Lower your chest to just above the floor, elbows at a 45° angle to your torso.',
      'Push through your palms to return to the start position.',
      'Keep your core braced throughout — no sagging hips.',
      'Exhale on the way up, inhale on the way down.',
      'Aim for 3 sets of 10–20 reps with 60 seconds rest between sets.',
    ],
    tags: ['chest', 'shoulders', 'triceps', 'bodyweight'],
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a16?w=600',
  },
  {
    title: 'Running',
    description: 'High-impact cardiovascular exercise that builds endurance, burns calories efficiently, and strengthens the heart and lungs.',
    category: 'cardio',
    difficulty: 'intermediate',
    duration: 30,
    caloriesBurn: 300,
    instructions: [
      'Warm up with 5 minutes of brisk walking.',
      'Begin jogging at a comfortable, conversational pace.',
      'Maintain an upright posture, looking ahead not down.',
      'Land mid-foot and roll through to push off with your toes.',
      'Keep arms at 90°, relaxed, swinging forward and back.',
      'Run for your target duration, then cool down with 5 minutes of walking and stretch.',
    ],
    tags: ['cardio', 'endurance', 'outdoor', 'calorie-burn'],
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600',
  },
  {
    title: 'Plank',
    description: 'Isometric core exercise that builds deep abdominal strength, improves posture, and stabilizes the entire trunk.',
    category: 'strength',
    difficulty: 'beginner',
    duration: 15,
    caloriesBurn: 50,
    instructions: [
      'Start face-down with forearms on the floor, elbows directly below shoulders.',
      'Lift your body so only forearms and toes touch the floor.',
      'Create a straight line from head to heels — squeeze glutes and brace core.',
      'Keep hips level — do not let them sag or pike up.',
      'Hold for 20–60 seconds, breathing steadily.',
      'Rest 30 seconds and repeat 3 times.',
    ],
    tags: ['core', 'isometric', 'abs', 'bodyweight'],
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600',
  },
  {
    title: 'Sun Salutation (Surya Namaskar)',
    description: 'A flowing sequence of 12 yoga poses that warms the whole body, improves flexibility, and calms the mind.',
    category: 'yoga',
    difficulty: 'beginner',
    duration: 20,
    caloriesBurn: 80,
    instructions: [
      'Stand in Mountain Pose — feet together, arms at sides.',
      'Inhale: raise arms overhead (Urdhva Hastasana).',
      'Exhale: fold forward (Uttanasana).',
      'Inhale: half-lift, lengthen spine (Ardha Uttanasana).',
      'Exhale: step or jump back to Plank Pose, then lower to Chaturanga.',
      'Inhale: Upward-Facing Dog.',
      'Exhale: Downward-Facing Dog — hold 5 breaths.',
      'Step feet to hands, inhale half-lift, exhale fold, then sweep arms up and return to Mountain Pose.',
      'Repeat 5–10 rounds.',
    ],
    tags: ['yoga', 'flexibility', 'full-body', 'mindfulness'],
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
  },
  {
    title: 'Resistance Band Row',
    description: 'Targets the upper back and biceps with minimal joint stress. Safe for all levels including those managing blood pressure with diabetes.',
    category: 'diabetes_friendly',
    difficulty: 'beginner',
    duration: 25,
    caloriesBurn: 120,
    instructions: [
      'Sit on the floor with legs extended and loop a resistance band around your feet.',
      'Hold one end in each hand, arms extended forward, palms facing each other.',
      'Brace your core and pull the band toward your torso, squeezing shoulder blades together.',
      'Keep elbows close to your body as you pull.',
      'Slowly return to the start — do not let the band snap back.',
      'Complete 3 sets of 12–15 reps.',
    ],
    tags: ['back', 'biceps', 'resistance-band', 'diabetes', 'low-impact'],
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
  },
  {
    title: 'HIIT Cardio Blast',
    description: 'High-intensity interval training alternating 40 seconds of work with 20 seconds rest. Burns maximum calories in minimum time.',
    category: 'cardio',
    difficulty: 'advanced',
    duration: 25,
    caloriesBurn: 380,
    instructions: [
      'Warm up with 3 minutes of jumping jacks and arm circles.',
      'Round 1: Jump squats — 40 sec work, 20 sec rest.',
      'Round 2: Burpees — 40 sec work, 20 sec rest.',
      'Round 3: Mountain climbers — 40 sec work, 20 sec rest.',
      'Round 4: High knees — 40 sec work, 20 sec rest.',
      'Repeat the circuit 4 times total.',
      'Cool down with 3 minutes of walking and deep stretching.',
    ],
    tags: ['HIIT', 'cardio', 'fat-burn', 'no-equipment'],
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
  },
  {
    title: 'Dumbbell Deadlift',
    description: 'A compound posterior-chain exercise targeting glutes, hamstrings, and lower back. Builds functional strength for everyday movements.',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 35,
    caloriesBurn: 220,
    instructions: [
      'Stand with feet hip-width apart, a dumbbell in each hand in front of your thighs.',
      'Hinge at your hips, pushing them back as you lower the dumbbells along your shins.',
      'Keep your back flat and core braced throughout the movement.',
      'Lower until you feel a stretch in the hamstrings (about mid-shin level).',
      'Drive through your heels and squeeze glutes to return to standing.',
      'Complete 3–4 sets of 8–12 reps.',
    ],
    tags: ['hamstrings', 'glutes', 'lower-back', 'compound'],
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
  },
  {
    title: 'Swimming',
    description: 'Full-body, zero-impact cardiovascular exercise. Excellent for people with joint pain, obesity, or diabetes. Works every major muscle group.',
    category: 'diabetes_friendly',
    difficulty: 'beginner',
    duration: 45,
    caloriesBurn: 400,
    instructions: [
      'Start with a 5-minute easy warm-up lap using any stroke.',
      'Alternate between freestyle and breaststroke every 2 laps.',
      'Focus on controlled breathing — exhale underwater, inhale when turning your head.',
      'Aim for 20–30 continuous minutes of active swimming.',
      'If fatigued, use a kickboard and focus on leg kicks.',
      'Cool down with 2 easy laps and stretching poolside.',
    ],
    tags: ['swimming', 'full-body', 'zero-impact', 'diabetes', 'cardio'],
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=600',
  },
  {
    title: 'Stretching & Flexibility Routine',
    description: 'A full-body static stretching sequence to improve range of motion, reduce injury risk, and aid recovery after workouts.',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 20,
    caloriesBurn: 40,
    instructions: [
      'Neck rolls: slowly rotate head in a full circle, 5 times each direction.',
      'Chest opener: clasp hands behind back, squeeze shoulder blades, hold 30 sec.',
      'Standing quad stretch: pull one foot to glute, hold 30 sec each leg.',
      'Hamstring stretch: stand and hinge forward with straight legs, hold 30 sec.',
      'Hip flexor lunge stretch: one knee on ground, push hips forward, hold 30 sec each side.',
      'Seated spinal twist: sit on floor, one leg extended, twist toward bent knee. Hold 30 sec each side.',
      'Child\'s Pose: kneel and reach arms forward on the floor, hold 60 sec.',
    ],
    tags: ['flexibility', 'stretching', 'recovery', 'cool-down'],
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600',
  },
];

/* ─────────────────── MEAL PLANS ─────────────────── */
const MEAL_PLANS = [
  {
    title: 'Diabetes-Friendly 7-Day Meal Plan',
    description: 'A balanced, low-glycemic meal plan to keep blood sugar stable. Emphasizes whole grains, lean proteins, and plenty of vegetables.',
    category: 'diabetes_management',
    meals: {
      breakfast: [
        { name: 'Steel-cut oatmeal with cinnamon', calories: 180, protein: 6, carbs: 32, fat: 3 },
        { name: 'Boiled egg', calories: 70, protein: 6, carbs: 1, fat: 5 },
        { name: 'Fresh blueberries (½ cup)', calories: 40, protein: 1, carbs: 10, fat: 0 },
      ],
      lunch: [
        { name: 'Grilled chicken breast (120g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
        { name: 'Quinoa (½ cup cooked)', calories: 111, protein: 4, carbs: 20, fat: 2 },
        { name: 'Steamed broccoli + spinach salad', calories: 60, protein: 4, carbs: 10, fat: 1 },
        { name: 'Olive oil & lemon dressing (1 tbsp)', calories: 60, protein: 0, carbs: 0, fat: 7 },
      ],
      dinner: [
        { name: 'Baked salmon fillet (150g)', calories: 220, protein: 31, carbs: 0, fat: 10 },
        { name: 'Roasted sweet potato (small)', calories: 100, protein: 2, carbs: 23, fat: 0 },
        { name: 'Stir-fried green beans with garlic', calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      snacks: [
        { name: 'Unsweetened Greek yogurt (150g)', calories: 90, protein: 15, carbs: 6, fat: 0 },
        { name: 'Handful of almonds (15 nuts)', calories: 104, protein: 4, carbs: 4, fat: 9 },
      ],
    },
    totalCalories: 1250,
    duration: '7 days',
    tags: ['diabetes', 'low-glycemic', 'heart-healthy', 'balanced'],
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',
    isFeatured: true,
  },
  {
    title: 'Weight Loss Meal Plan',
    description: 'A calorie-controlled plan (~1400 kcal/day) with high protein to preserve muscle while losing fat.',
    category: 'weight_loss',
    meals: {
      breakfast: [
        { name: 'Scrambled eggs (2 large)', calories: 140, protein: 12, carbs: 2, fat: 10 },
        { name: 'Whole grain toast (1 slice)', calories: 80, protein: 4, carbs: 15, fat: 1 },
        { name: 'Black coffee or green tea', calories: 5, protein: 0, carbs: 1, fat: 0 },
      ],
      lunch: [
        { name: 'Turkey breast wrap (whole wheat tortilla)', calories: 280, protein: 28, carbs: 30, fat: 6 },
        { name: 'Side salad with balsamic vinegar', calories: 50, protein: 2, carbs: 8, fat: 1 },
      ],
      dinner: [
        { name: 'Lean beef stir-fry with vegetables', calories: 300, protein: 30, carbs: 15, fat: 12 },
        { name: 'Brown rice (½ cup cooked)', calories: 110, protein: 2, carbs: 23, fat: 1 },
      ],
      snacks: [
        { name: 'Apple with 1 tbsp peanut butter', calories: 130, protein: 3, carbs: 20, fat: 5 },
        { name: 'Protein shake (whey + water)', calories: 120, protein: 25, carbs: 3, fat: 1 },
      ],
    },
    totalCalories: 1415,
    duration: '4 weeks',
    tags: ['weight-loss', 'high-protein', 'calorie-deficit', 'lean'],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    isFeatured: true,
  },
  {
    title: 'Muscle Building Meal Plan',
    description: 'A high-calorie, protein-rich plan (~2800 kcal/day) designed to support muscle hypertrophy.',
    category: 'muscle_building',
    meals: {
      breakfast: [
        { name: 'Oatmeal with banana (1 cup cooked)', calories: 240, protein: 8, carbs: 48, fat: 4 },
        { name: 'Whole eggs (3) + egg whites (3)', calories: 270, protein: 27, carbs: 2, fat: 15 },
        { name: 'Whole milk (1 glass)', calories: 150, protein: 8, carbs: 12, fat: 8 },
      ],
      lunch: [
        { name: 'Chicken rice bowl (200g chicken, 1 cup rice)', calories: 580, protein: 50, carbs: 65, fat: 10 },
        { name: 'Avocado (½)', calories: 120, protein: 1, carbs: 6, fat: 11 },
      ],
      dinner: [
        { name: 'Grilled steak (200g sirloin)', calories: 400, protein: 44, carbs: 0, fat: 22 },
        { name: 'Baked potato (large)', calories: 200, protein: 5, carbs: 45, fat: 0 },
        { name: 'Roasted vegetables with olive oil', calories: 120, protein: 3, carbs: 15, fat: 6 },
      ],
      snacks: [
        { name: 'Mass gainer shake', calories: 400, protein: 30, carbs: 60, fat: 5 },
        { name: 'Mixed nuts and dried fruit (50g)', calories: 250, protein: 6, carbs: 20, fat: 17 },
      ],
    },
    totalCalories: 2730,
    duration: '12 weeks',
    tags: ['muscle-building', 'bulking', 'high-protein', 'high-calorie'],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
    isFeatured: false,
  },
  {
    title: 'Weight Maintenance Balanced Plan',
    description: 'A sustainable, balanced plan (~2000 kcal/day) following the 40/30/30 macro split for long-term healthy eating.',
    category: 'maintenance',
    meals: {
      breakfast: [
        { name: 'Greek yogurt parfait with granola', calories: 300, protein: 20, carbs: 40, fat: 6 },
        { name: 'Mixed berries (1 cup)', calories: 70, protein: 1, carbs: 17, fat: 0 },
      ],
      lunch: [
        { name: 'Lentil and vegetable soup (large bowl)', calories: 280, protein: 18, carbs: 40, fat: 4 },
        { name: 'Whole grain bread (2 slices)', calories: 160, protein: 8, carbs: 30, fat: 2 },
      ],
      dinner: [
        { name: 'Baked chicken thighs (2, skin-off)', calories: 280, protein: 38, carbs: 0, fat: 14 },
        { name: 'Quinoa pilaf (1 cup cooked)', calories: 220, protein: 8, carbs: 39, fat: 4 },
        { name: 'Steamed asparagus with lemon', calories: 40, protein: 3, carbs: 6, fat: 0 },
      ],
      snacks: [
        { name: 'Banana with almond butter (1 tbsp)', calories: 190, protein: 4, carbs: 30, fat: 8 },
        { name: 'Low-fat cheese stick + grapes', calories: 130, protein: 7, carbs: 15, fat: 5 },
      ],
    },
    totalCalories: 1970,
    duration: 'Ongoing',
    tags: ['maintenance', 'balanced', 'sustainable', 'whole-foods'],
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600',
    isFeatured: false,
  },
  {
    title: 'Vegetarian Diabetes Plan',
    description: 'A plant-based, low-glycemic meal plan for vegetarians managing diabetes. High in fiber, rich in plant proteins, and diabetes-friendly.',
    category: 'diabetes_management',
    meals: {
      breakfast: [
        { name: 'Besan (chickpea flour) chilla (2)', calories: 160, protein: 10, carbs: 22, fat: 4 },
        { name: 'Low-fat yogurt (1 cup)', calories: 100, protein: 11, carbs: 8, fat: 1 },
        { name: 'Green tea (unsweetened)', calories: 2, protein: 0, carbs: 0, fat: 0 },
      ],
      lunch: [
        { name: 'Dal (lentil soup, 1 cup)', calories: 180, protein: 13, carbs: 28, fat: 2 },
        { name: 'Brown rice (½ cup cooked)', calories: 110, protein: 2, carbs: 23, fat: 1 },
        { name: 'Sabzi (mixed vegetables, 1 cup)', calories: 80, protein: 3, carbs: 12, fat: 2 },
      ],
      dinner: [
        { name: 'Palak paneer (100g paneer, low fat)', calories: 220, protein: 14, carbs: 10, fat: 13 },
        { name: 'Whole wheat roti (2)', calories: 160, protein: 6, carbs: 32, fat: 2 },
        { name: 'Cucumber raita', calories: 60, protein: 4, carbs: 6, fat: 2 },
      ],
      snacks: [
        { name: 'Handful of walnuts + 1 apple', calories: 200, protein: 4, carbs: 22, fat: 12 },
        { name: 'Roasted chana (30g)', calories: 100, protein: 6, carbs: 15, fat: 2 },
      ],
    },
    totalCalories: 1372,
    duration: '7 days',
    tags: ['vegetarian', 'diabetes', 'plant-based', 'low-glycemic'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    isFeatured: true,
  },
  {
    title: 'Heart-Healthy Weight Loss Plan',
    description: 'A cardiologist-approved plan combining calorie deficit with heart-protective foods: omega-3s, soluble fiber, and antioxidants.',
    category: 'weight_loss',
    meals: {
      breakfast: [
        { name: 'Rolled oats with flaxseed (1 cup)', calories: 210, protein: 8, carbs: 36, fat: 5 },
        { name: 'Sliced strawberries (½ cup)', calories: 25, protein: 0, carbs: 6, fat: 0 },
        { name: 'Unsweetened almond milk (1 cup)', calories: 30, protein: 1, carbs: 1, fat: 2 },
      ],
      lunch: [
        { name: 'Tuna salad (canned in water, 100g)', calories: 120, protein: 27, carbs: 0, fat: 1 },
        { name: 'Mixed greens with olive oil (1 tsp)', calories: 50, protein: 2, carbs: 5, fat: 4 },
        { name: 'Whole grain crackers (5)', calories: 80, protein: 2, carbs: 14, fat: 2 },
      ],
      dinner: [
        { name: 'Baked cod with herbs (150g)', calories: 140, protein: 30, carbs: 0, fat: 2 },
        { name: 'Steamed broccoli + carrots (1 cup)', calories: 55, protein: 3, carbs: 11, fat: 0 },
        { name: 'Barley (½ cup cooked)', calories: 100, protein: 2, carbs: 22, fat: 0 },
      ],
      snacks: [
        { name: 'Celery sticks + hummus (2 tbsp)', calories: 70, protein: 3, carbs: 8, fat: 3 },
        { name: 'Orange (1 medium)', calories: 62, protein: 1, carbs: 15, fat: 0 },
      ],
    },
    totalCalories: 942,
    duration: '4 weeks',
    tags: ['heart-healthy', 'weight-loss', 'omega-3', 'low-sodium'],
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600',
    isFeatured: false,
  },
];

/* ─────────────────── POSTS ─────────────────── */
const POSTS_DATA = [
  {
    title: 'Lost 12kg in 3 months — here\'s exactly what worked for me',
    content: 'After struggling with weight for years and being diagnosed with pre-diabetes, I committed to FitTrack\'s diabetes-friendly meal plan. The key was consistency: 30-minute morning walk daily, swapped white rice for brown rice, and cut sugary drinks entirely. My blood sugar is now in normal range and I feel incredible. If you\'re just starting, don\'t try to be perfect — just be consistent.',
    category: 'success_story',
    tags: ['diabetes', 'weight-loss', 'success', 'consistency'],
    likesCount: 142,
    commentsCount: 28,
    isApproved: true,
    isPinned: true,
  },
  {
    title: 'Blood sugar spikes after exercise — is this normal?',
    content: 'I\'ve noticed my blood glucose actually rises right after intense workouts before coming down. After researching, I learned this is the stress hormone response — cortisol and adrenaline tell the liver to release glucose for energy. This is completely normal and usually resolves within an hour. The long-term insulin sensitivity benefits far outweigh this short-term spike. Has anyone else experienced this?',
    category: 'diabetes',
    tags: ['blood-sugar', 'exercise', 'type2', 'cortisol'],
    likesCount: 89,
    commentsCount: 34,
    isApproved: true,
    isPinned: false,
  },
  {
    title: '7 foods that actually helped lower my HbA1c',
    content: 'After 6 months of dietary changes, my HbA1c dropped from 8.2% to 6.4%. The foods that made the biggest difference: bitter melon twice a week, cinnamon in morning oatmeal, apple cider vinegar before meals, fenugreek seeds soaked overnight, berries instead of high-GI fruits, whole grain barley, and plenty of leafy greens. Combined with regular walking, the results have been remarkable.',
    category: 'nutrition',
    tags: ['nutrition', 'HbA1c', 'diabetes-diet', 'foods'],
    likesCount: 203,
    commentsCount: 47,
    isApproved: true,
    isPinned: false,
  },
  {
    title: 'Why resistance training is a must for Type 2 diabetics',
    content: 'Cardio gets all the attention but strength training is equally important for T2D management. Muscle tissue is the largest consumer of glucose in the body — more muscle means better blood sugar control. Studies show 2-3 sessions per week can reduce HbA1c by 0.5-1%. I started with resistance bands at home and progressed to dumbbells. No gym membership needed.',
    category: 'exercise',
    tags: ['strength-training', 'diabetes', 'resistance', 'type2'],
    likesCount: 76,
    commentsCount: 19,
    isApproved: true,
    isPinned: false,
  },
  {
    title: 'From 98kg to 78kg: My 8-month transformation',
    content: 'I started FitTrack after my doctor gave me a serious warning about my weight and blood sugar. 8 months later: lost 20kg, blood pressure normalized, HbA1c went from 9.1% to 5.9% (non-diabetic range!), and I completed my first 5K run. The FitTrack diabetes meal plans and exercise guides were crucial. If I can do this at 47 years old, anyone can.',
    category: 'success_story',
    tags: ['transformation', 'success', 'type2-reversal', 'motivation'],
    likesCount: 318,
    commentsCount: 65,
    isApproved: true,
    isPinned: true,
  },
];

/* ─────────────────── MAIN ─────────────────── */
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Exercise.deleteMany({});
    await MealPlan.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed users — use create() so the pre-save password hash hook runs
    const createdUsers = await User.create(USERS);
    const adminUser   = createdUsers[0];
    const trainerUser = createdUsers[1];
    const regularUser = createdUsers[2];
    console.log(`Created ${createdUsers.length} users:`);
    console.log(`  Admin   → ${adminUser.email}`);
    console.log(`  Trainer → ${trainerUser.email}`);
    console.log(`  User    → ${regularUser.email}`);

    // Seed exercises — assign createdBy to trainer
    const exercisesWithAuthor = EXERCISES.map((ex) => ({ ...ex, createdBy: trainerUser._id }));
    const createdExercises = await Exercise.create(exercisesWithAuthor);
    console.log(`Created ${createdExercises.length} exercises.`);

    // Seed meal plans — assign createdBy to admin
    const plansWithAuthor = MEAL_PLANS.map((mp) => ({ ...mp, createdBy: adminUser._id }));
    const createdPlans = await MealPlan.create(plansWithAuthor);
    console.log(`Created ${createdPlans.length} meal plans.`);

    // Seed posts — 3 from regular user, 2 from trainer
    const postsWithAuthor = POSTS_DATA.map((post, i) => ({
      ...post,
      author: i < 3 ? regularUser._id : trainerUser._id,
    }));
    const createdPosts = await Post.create(postsWithAuthor);
    console.log(`Created ${createdPosts.length} community posts.`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test credentials:');
    console.log('  Admin   → admin@fittrack.com    / Admin@123');
    console.log('  Trainer → trainer@fittrack.com  / Trainer@123');
    console.log('  User    → user@fittrack.com     / User@12345');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
