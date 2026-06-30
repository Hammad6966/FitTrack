import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { communityAPI } from '../utils/api';

const CATEGORIES = ['general', 'diabetes', 'nutrition', 'exercise', 'motivation', 'success_story'];

export default function NewPost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await communityAPI.createPost(payload);
      toast.success('Post published!');
      navigate('/community');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-8 text-sm"
        >
          <FaArrowLeft size={12} /> Back to Community
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Create New Post</h1>
        <p className="text-gray-400 mb-8">Share your progress, tips, or questions with the community.</p>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                className="input-dark"
                placeholder="Give your post a clear title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                className="input-dark"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-gray-800">
                    {c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
              <textarea
                rows={8}
                className="input-dark resize-none"
                placeholder="Write your post content here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
              <input
                className="input-dark"
                placeholder="e.g. fitness, diabetes, motivation"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/community"
                className="flex-1 py-3 text-center border border-gray-700 text-gray-300 hover:border-gray-500 rounded-xl text-sm transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <FaPaperPlane size={13} />
                {loading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
