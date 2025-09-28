import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const DealerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tokenHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dealer/me', {
        headers: tokenHeader(),
      });
      setProfile(res.data?.user ?? null);
    } catch (err) {
      console.warn('Failed to load dealer profile', err);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/dealer/dealerListings', {
        headers: tokenHeader(),
      });
      const data = res.data?.listings ?? res.data;
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch dealer listings', err);
      setError(err.response?.data?.error || err.message || 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold">Dealer Dashboard</h2>
        <p className="text-red-600">You must be logged in as a dealer to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
          <p className="text-sm text-gray-600">Dealer dashboard — manage listings, bookings and profile</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchListings(); }} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          <Link to="/dealer/listings/new" className="px-3 py-1 bg-green-600 text-white rounded">Add Listing</Link>
          <button onClick={() => navigate('/dealer/listings')} className="px-3 py-1 bg-yellow-400 text-blue-900 rounded">Manage Listings</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Profile</div>
          <div className="mt-2 font-semibold">{profile?.name ?? user.name}</div>
          <div className="text-sm text-gray-600">{profile?.email ?? user.email}</div>
          <div className="mt-3">
            <Link to="/dealer/profile" className="text-sm text-blue-600">View Profile</Link>
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Listings</div>
          <div className="mt-2 text-2xl font-semibold">{listings.length}</div>
          <div className="mt-3">
            <Link to="/dealer/listings" className="text-sm text-blue-600">Manage Listings</Link>
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Bookings</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
          <div className="mt-3">
            <Link to="/dealer/bookings" className="text-sm text-blue-600">View Bookings</Link>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Listings</h2>
          <div className="text-sm text-gray-600">{loading ? 'Loading...' : `${listings.length} total`}</div>
        </div>

        {loading && <div>Loading your listings...</div>}
        {error && <div className="text-red-600">Error: {error}</div>}

        {!loading && listings.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">No listings found. Add your first listing.</div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.slice(0, 6).map(l => {
              const imageUrl = l.images && l.images.length > 0 ? l.images[0].url : '';
              const model = l.model ?? {};
              return (
                <div key={l.id} className="border rounded p-4 flex gap-4">
                  <div style={{ width: 120, height: 90, flexShrink: 0 }} className="bg-gray-100 rounded overflow-hidden">
                    {imageUrl ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img src={imageUrl} alt="listing image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {model.brand ? `${model.brand} ${model.modelName || ''}` : (l.title || 'Untitled')}
                    </div>
                    <div className="text-xs text-gray-600">{l.listingType ? l.listingType.toUpperCase() : ''} {l.condition ? `· ${l.condition}` : ''}</div>
                    <div className="mt-2 text-sm text-gray-700">Price: {l.price ? `₹ ${Number(l.price).toLocaleString()}` : '—'}</div>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/dealer/listings/${l.id}/edit`} className="px-2 py-1 bg-yellow-400 text-blue-900 rounded text-xs">Edit</Link>
                      <Link to={`/dealer/listings/${l.id}`} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">View</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DealerDashboard;
