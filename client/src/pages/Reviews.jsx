import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const Reviews = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    modelId: '',
    rating: 5,
    comment: ''
  });

  const fetchReviews = async () => {
    try {
      const res = await api.get('/api/reviews');
      setReviews(res.data);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const fetchModels = async () => {
    try {
      const res = await api.get('/api/models');
      setModels(res.data);
    } catch (err) {
      console.error('Failed to fetch models');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReviews(), fetchModels()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/reviews', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ modelId: '', rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      setError('Failed to create review');
    }
  };

  const getStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getModelName = (modelId) => {
    const model = models.find(m => m.id === modelId);
    return model ? `${model.brand} ${model.modelName}` : 'Unknown Model';
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Vehicle Reviews
        </h2>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select name="modelId" value={form.modelId} onChange={handleChange} required className="border p-2 rounded">
              <option value="">Select Vehicle Model</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.brand} {model.modelName}
                </option>
              ))}
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select name="rating" value={form.rating} onChange={handleChange} className="border p-2 rounded w-full">
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
          </div>
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Write your review here..."
            rows={4}
            className="w-full border p-2 rounded mb-4"
          />
          <button type="submit" className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition">
            Submit Review
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-1">
                    {getModelName(review.modelId)}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{getStarRating(review.rating)}</div>
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    By {review.user?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;