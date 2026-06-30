import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaBars, FaTimes, FaChevronDown, FaUser, FaChartLine, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = [
  { to: '/',              label: 'Home' },
  { to: '/exercises',     label: 'Exercises' },
  { to: '/meal-plans',    label: 'Meal Plans' },
  { to: '/bmi-calculator',label: 'BMI Calculator' },
  { to: '/community',     label: 'Community' },
];

function UserInitials({ name }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-500/30">
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [pathname]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dropdownItems = [
    { to: '/profile',  label: 'My Profile',  icon: <FaUser size={13} /> },
    { to: '/progress', label: 'Progress',     icon: <FaChartLine size={13} /> },
    ...(user?.role === 'admin'   ? [{ to: '/admin',   label: 'Admin Panel',      icon: <FaShieldAlt size={13} /> }] : []),
    ...(user?.role === 'trainer' ? [{ to: '/trainer', label: 'Trainer Dashboard', icon: <FaShieldAlt size={13} /> }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        bg-gray-900/90 backdrop-blur-md border-b border-gray-800/60
        ${scrolled ? 'shadow-xl shadow-black/40' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-shadow">
              <FaDumbbell className="text-white text-sm" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Fit<span className="text-green-400">Track</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                   ${isActive
                    ? 'text-green-400 bg-green-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <UserInitials name={user?.name} />
                  <span className="text-sm text-gray-300 max-w-[100px] truncate">{user?.name}</span>
                  <FaChevronDown
                    size={10}
                    className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {dropdownItems.map(({ to, label, icon }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <span className="text-gray-500">{icon}</span>
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                        >
                          <FaSignOutAlt size={13} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-1 bg-gray-900/95 backdrop-blur-md">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                     ${isActive
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="border-t border-gray-800 pt-3 mt-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      <UserInitials name={user?.name} />
                      <div>
                        <p className="text-sm text-white font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                    </div>
                    {dropdownItems.map(({ to, label, icon }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <span className="text-gray-500">{icon}</span>
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 rounded-xl transition-colors mt-1"
                    >
                      <FaSignOutAlt size={13} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" className="block px-4 py-2.5 text-center text-sm text-gray-300 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors">
                      Login
                    </Link>
                    <Link to="/register" className="block px-4 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
