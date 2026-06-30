import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaDumbbell, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

function getPasswordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 6)               score++;
  if (pw.length >= 10)              score++;
  if (/[A-Z]/.test(pw))            score++;
  if (/[0-9]/.test(pw))            score++;
  if (/[^A-Za-z0-9]/.test(pw))     score++;
  if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    textColor: 'text-red-400',    width: 'w-1/3' };
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400', width: 'w-2/3' };
  return           { label: 'Strong', color: 'bg-green-500',  textColor: 'text-green-400',  width: 'w-full' };
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]               = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 3) e.name = 'Name must be at least 3 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email))        e.email = 'Enter a valid email';
    if (form.password.length < 6)                  e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)    e.confirmPassword = 'Passwords do not match';
    if (!agreed)                                   e.terms = 'You must accept the terms';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to FitTrack! 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left — Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
          alt="Fitness"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-emerald-900/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Join 10,000+ Members
            </p>
            <h2 className="text-white text-2xl font-bold leading-tight mb-4">
              Start your transformation today with FitTrack
            </h2>
            <div className="flex flex-col gap-2">
              {['Personalized workout plans', 'Diabetes-friendly diet guides', 'Community support & motivation'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                  <FaCheckCircle className="text-green-400 flex-shrink-0" size={13} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 group w-fit">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <FaDumbbell className="text-white text-base" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Fit<span className="text-green-400">Track</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-400 mb-7">Free forever. No credit card required.</p>

          {errors.general && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" autoComplete="name"
                  className={`input-dark pl-11 ${errors.name ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  className={`input-dark pl-11 ${errors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password + strength */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  className={`input-dark pl-11 pr-11 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: strength.width === 'w-1/3' ? '33%' : strength.width === 'w-2/3' ? '66%' : '100%' }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${strength.color}`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${strength.textColor}`}>Password strength: {strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" autoComplete="new-password"
                  className={`input-dark pl-11 pr-11 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showConfirm ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, terms: '' })); }}
                  className="mt-0.5 w-4 h-4 rounded border-gray-600 text-green-500 bg-gray-800 focus:ring-green-500/30 flex-shrink-0"
                />
                <span className="text-sm text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-green-400 hover:text-green-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-green-400 hover:text-green-300">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <p className="text-red-400 text-xs mt-1.5">{errors.terms}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
