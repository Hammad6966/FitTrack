import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Exercises       from './pages/Exercises';
import ExerciseDetail  from './pages/ExerciseDetail';
import DiabetesDiet    from './pages/DiabetesDiet';
import BMICalculator   from './pages/BMICalculator';
import WeightPlans     from './pages/WeightPlans';
import MealPlanning    from './pages/MealPlanning';
import ProgressTracker from './pages/ProgressTracker';
import Community       from './pages/Community';
import Profile         from './pages/Profile';
import NewPost         from './pages/NewPost';
import AdminDashboard  from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import NotFound        from './pages/NotFound';

const NO_LAYOUT = ['/login', '/register'];

function AppContent() {
  const { pathname } = useLocation();
  const showLayout = !NO_LAYOUT.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {showLayout && <Navbar />}
      <main className={`flex-1 ${showLayout ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/exercises"      element={<Exercises />} />
          <Route path="/exercises/:id"  element={<ExerciseDetail />} />
          <Route path="/meal-plans"     element={<MealPlanning />} />
          <Route path="/meal-planning"  element={<MealPlanning />} />
          <Route path="/bmi-calculator" element={<BMICalculator />} />
          <Route path="/community"      element={<Community />} />
          <Route path="/diabetes-diet"  element={<DiabetesDiet />} />
          <Route path="/weight-plans"   element={<WeightPlans />} />

          {/* Protected: any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile"            element={<Profile />} />
            <Route path="/progress"           element={<ProgressTracker />} />
            <Route path="/community/new-post" element={<NewPost />} />
          </Route>

          {/* Trainer + Admin */}
          <Route element={<ProtectedRoute allowedRoles={['trainer', 'admin']} />}>
            <Route path="/trainer" element={<TrainerDashboard />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
              borderRadius: '12px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
