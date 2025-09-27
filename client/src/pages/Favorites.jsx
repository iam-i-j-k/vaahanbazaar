import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const Favorites = () => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err) {
      setError('Failed to fetch favorites');
    }
  };

  const fetchModels = async () => {
    try {
      const res = await api.get('http://localhost:5000/api/models');
      setModels(res.data);
    } catch (err) {
      console.error('Failed to fetch models');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFavorites(), fetchModels()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddFavorite = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('http://localhost:5000/api/favorites', { modelId: selectedModelId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedModelId('');
      setShowAddForm(false);
      fetchFavorites();
    } catch (err) {
      setError('Failed to add favorite');
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    if (!window.confirm('Remove this vehicle from favorites?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`http://localhost:5000/api/favorites/${favoriteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFavorites();
    } catch (err) {
      setError('Failed to remove favorite');
    }
  };

  const getFavoriteModel = (modelId) => {
    return models.find(model => model.id === modelId);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          My Favorites
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showAddForm ? 'Cancel' : 'Add Favorite'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showAddForm && (
        <form onSubmit={handleAddFavorite} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                required
                className="w-full border p-2 rounded"
              >
                <option value="">Choose a model...</option>
                {models.filter(model => !favorites.some(fav => fav.modelId === model.id)).map(model => (
                  <option key={model.id} value={model.id}>
                    {model.brand} {model.modelName} - ₹{model.price?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition">
              Add to Favorites
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length > 0 ? (
          favorites.map(favorite => {
            const model = getFavoriteModel(favorite.modelId);
            if (!model) return null;
            
            return (
              <div key={favorite.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-red-400">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-blue-900">
                      {model.brand} {model.modelName}
                    </h3>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Remove from favorites"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-semibold">Category:</span> {model.category || 'N/A'}</p>
                    <p><span className="font-semibold">Fuel Type:</span> {model.fuelType || 'N/A'}</p>
                    <p><span className="font-semibold">Price:</span> ₹{model.price?.toLocaleString() || 'N/A'}</p>
                    <p><span className="font-semibold">Mileage:</span> {model.mileage || 'N/A'} kmpl</p>
                    {model.engineCC && <p><span className="font-semibold">Engine:</span> {model.engineCC} CC</p>}
                    {model.batteryKwh && <p><span className="font-semibold">Battery:</span> {model.batteryKwh} kWh</p>}
                    <p><span className="font-semibold">Added on:</span> {new Date(favorite.addedAt).toLocaleDateString()}</p>
                  </div>
                  {model.description && (
                    <p className="text-gray-700 mt-3 text-sm">{model.description}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-blue-900 text-yellow-400 font-semibold px-3 py-2 rounded hover:bg-blue-700 transition text-sm">
                      View Listings
                    </button>
                    <button className="px-3 py-2 border border-yellow-400 text-blue-900 rounded hover:bg-yellow-50 transition text-sm">
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p>No favorites yet. Start adding vehicles you love!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;