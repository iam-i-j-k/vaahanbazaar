import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const PriceAlerts = () => {
  const { user } = useContext(AuthContext);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    modelId: '',
    targetPrice: ''
  });

  const fetchPriceAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('http://localhost:5000/api/price-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPriceAlerts(res.data);
    } catch (err) {
      setError('Failed to fetch price alerts');
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
      await Promise.all([fetchPriceAlerts(), fetchModels()]);
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
      const payload = {
        ...form,
        targetPrice: Number(form.targetPrice)
      };
      await api.post('http://localhost:5000/api/price-alerts', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ modelId: '', targetPrice: '' });
      setShowForm(false);
      fetchPriceAlerts();
    } catch (err) {
      setError('Failed to create price alert');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Delete this price alert?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`http://localhost:5000/api/price-alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPriceAlerts();
    } catch (err) {
      setError('Failed to delete price alert');
    }
  };

  const getModelDetails = (modelId) => {
    return models.find(model => model.id === modelId);
  };

  const getAlertStatus = (targetPrice, currentPrice) => {
    if (!currentPrice) return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
    if (currentPrice <= targetPrice) {
      return { status: 'triggered', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'waiting', color: 'bg-blue-100 text-blue-800' };
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.828 2.828L5.828 12l2.828 2.828L6.828 17H2v-4.828L4.828 12 2 9.172V4.344L4.828 7zM9 3h6l-3-3L9 3z" />
          </svg>
          Price Alerts
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'Create Alert'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
              <select name="modelId" value={form.modelId} onChange={handleChange} required className="w-full border p-2 rounded">
                <option value="">Select Vehicle Model</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.brand} {model.modelName} - Current: ₹{model.price?.toLocaleString() || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (₹)</label>
              <input
                name="targetPrice"
                type="number"
                value={form.targetPrice}
                onChange={handleChange}
                placeholder="Enter target price"
                required
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition">
            Create Price Alert
          </button>
        </form>
      )}

      <div className="space-y-4">
        {priceAlerts.length > 0 ? (
          priceAlerts.map(alert => {
            const model = getModelDetails(alert.modelId);
            const alertStatus = getAlertStatus(alert.targetPrice, model?.price);
            
            return (
              <div key={alert.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-blue-900">
                        {model ? `${model.brand} ${model.modelName}` : 'Unknown Model'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${alertStatus.color}`}>
                        {alertStatus.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-semibold">Target Price:</span> ₹{alert.targetPrice.toLocaleString()}</p>
                        <p><span className="font-semibold">Current Price:</span> ₹{model?.price?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p><span className="font-semibold">Created:</span> {new Date(alert.createdAt).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Status:</span> {alert.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                      <div>
                        {model?.price && (
                          <p>
                            <span className="font-semibold">Difference:</span> 
                            <span className={model.price <= alert.targetPrice ? 'text-green-600' : 'text-red-600'}>
                              {model.price <= alert.targetPrice ? '-' : '+'}₹{Math.abs(model.price - alert.targetPrice).toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {alertStatus.status === 'triggered' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-800 font-semibold">🎉 Price Alert Triggered!</p>
                        <p className="text-green-700 text-sm">The current price is at or below your target price.</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="ml-4 text-red-500 hover:text-red-700 transition"
                    title="Delete alert"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.828 2.828L5.828 12l2.828 2.828L6.828 17H2v-4.828L4.828 12 2 9.172V4.344L4.828 7zM9 3h6l-3-3L9 3z" />
            </svg>
            <p>No price alerts set. Create your first alert to get notified when prices drop!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlerts;