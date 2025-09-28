import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const Listings = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [models, setModels] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    modelId: '',
    dealerId: '',
    listingType: 'new',
    condition: 'new',
    year: new Date().getFullYear(),
    kms: 0,
    price: '',
    stockCount: 1
  });

  const fetchListings = async () => {
    try {
      const res = await api.get('http://localhost:5000/api/listings');
      setListings(res.data);
    } catch (err) {
      setError('Failed to fetch listings');
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

  const fetchDealers = async () => {
    try {
      // For now, we'll create a mock dealer since we don't have a dealers endpoint
      setDealers([{ id: '1', name: 'Default Dealer' }]);
    } catch (err) {
      console.error('Failed to fetch dealers');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchListings(), fetchModels(), fetchDealers()]);
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
      await api.post('http://localhost:5000/api/listings', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setForm({
        modelId: '',
        dealerId: '',
        listingType: 'new',
        condition: 'new',
        year: new Date().getFullYear(),
        kms: 0,
        price: '',
        stockCount: 1
      });
      setShowForm(false);
      fetchListings();
    } catch (err) {
      setError('Failed to create listing');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Vehicle Listings
        </h2>
        {user && (user.role === 'dealer' || user.role === 'admin') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Add Listing'}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="modelId" value={form.modelId} onChange={handleChange} required className="border p-2 rounded">
            <option value="">Select Model</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.brand} {model.modelName}</option>
            ))}
          </select>
          <select name="dealerId" value={form.dealerId} onChange={handleChange} required className="border p-2 rounded">
            <option value="">Select Dealer</option>
            {dealers.map(dealer => (
              <option key={dealer.id} value={dealer.id}>{dealer.name}</option>
            ))}
          </select>
          <select name="listingType" value={form.listingType} onChange={handleChange} className="border p-2 rounded">
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
          <select name="condition" value={form.condition} onChange={handleChange} className="border p-2 rounded">
            <option value="new">New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
          <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} className="border p-2 rounded" />
          <input name="kms" type="number" placeholder="Kilometers" value={form.kms} onChange={handleChange} className="border p-2 rounded" />
          <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="border p-2 rounded" />
          <input name="stockCount" type="number" placeholder="Stock Count" value={form.stockCount} onChange={handleChange} className="border p-2 rounded" />
          <button type="submit" className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition col-span-1 md:col-span-2">
            Create Listing
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-yellow-400">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-blue-900">
                    {listing.model?.brand} {listing.model?.modelName}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    listing.listingType === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {listing.listingType.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold">Price:</span> ₹{listing.price?.toLocaleString()}</p>
                  <p><span className="font-semibold">Year:</span> {listing.year}</p>
                  <p><span className="font-semibold">Condition:</span> {listing.condition}</p>
                  <p><span className="font-semibold">KMs:</span> {listing.kms?.toLocaleString()}</p>
                  <p><span className="font-semibold">Stock:</span> {listing.stockCount}</p>
                  <p><span className="font-semibold">Dealer:</span> {listing.dealer?.name}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-900 text-yellow-400 font-semibold px-3 py-2 rounded hover:bg-blue-700 transition text-sm">
                    Book Test Ride
                  </button>
                  <button className="px-3 py-2 border border-yellow-400 text-blue-900 rounded hover:bg-yellow-50 transition">
                    ♡
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No listings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;