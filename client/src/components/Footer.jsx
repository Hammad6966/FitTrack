import { Link } from 'react-router-dom';
import {
  FaDumbbell, FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaEnvelope, FaMapMarkerAlt, FaClock,
} from 'react-icons/fa';

const quickLinks = [
  { to: '/',               label: 'Home' },
  { to: '/exercises',      label: 'Exercises' },
  { to: '/meal-plans',     label: 'Meal Plans' },
  { to: '/bmi-calculator', label: 'BMI Calculator' },
  { to: '/community',      label: 'Community' },
];

const healthLinks = [
  { to: '/diabetes-diet', label: 'Diabetes Guide' },
  { to: '/weight-plans',  label: 'Weight Management' },
  { to: '/exercises',     label: 'Exercise Library' },
  { to: '/meal-plans',    label: 'Nutrition Tips' },
];

const socials = [
  { icon: <FaFacebook size={18} />,  href: '#', label: 'Facebook' },
  { icon: <FaTwitter  size={18} />,  href: '#', label: 'Twitter' },
  { icon: <FaInstagram size={18} />, href: '#', label: 'Instagram' },
  { icon: <FaYoutube  size={18} />,  href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      {/* Gradient top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <FaDumbbell className="text-white text-sm" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Fit<span className="text-green-400">Track</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Your all-in-one fitness companion. Track workouts, plan meals, and monitor your health journey — all in one place.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 hover:text-green-400 hover:bg-gray-700 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm hover:text-green-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-green-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Health Resources */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Health Resources</h3>
            <ul className="space-y-2.5">
              {healthLinks.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm hover:text-green-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-green-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaEnvelope className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>support@fittrack.pk</span>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>Lahore, Pakistan</span>
              </li>
              <li className="flex items-start gap-3">
                <FaClock className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>Mon–Fri, 9 AM – 6 PM PKT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>&copy; {new Date().getFullYear()} FitTrack. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
