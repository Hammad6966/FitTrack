import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        {/* Animated icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center mx-auto mb-8"
        >
          <FaDumbbell className="text-green-400 text-3xl" />
        </motion.div>

        {/* 404 */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-8xl md:text-9xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4 leading-none"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-2 max-w-md mx-auto">
            Looks like this page skipped leg day — it&apos;s just not here.
          </p>
          <p className="text-gray-600 text-sm mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="btn-primary flex items-center gap-2 px-8"
            >
              <FaHome size={14} />
              Go Home
            </Link>
            <Link
              to="/exercises"
              className="px-8 py-3 border border-gray-700 text-gray-300 hover:border-green-500/50 hover:text-green-400 rounded-xl font-semibold text-sm transition-all duration-200"
            >
              Browse Exercises
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
