import { FaUser, FaEdit } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400 mb-8">Manage your account and fitness preferences.</p>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || <FaUser />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 px-3 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Fitness Level',  value: user?.profile?.fitnessLevel  || 'Not set' },
              { label: 'Fitness Goal',   value: user?.profile?.fitnessGoal?.replace('_', ' ') || 'Not set' },
              { label: 'Height',         value: user?.profile?.height ? `${user.profile.height} cm` : 'Not set' },
              { label: 'Weight',         value: user?.profile?.weight ? `${user.profile.weight} kg` : 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className="text-white font-medium capitalize">{value}</p>
              </div>
            ))}
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-green-500/25">
            <FaEdit size={13} /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
