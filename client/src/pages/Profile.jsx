import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tokenHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, lRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dealer/me', { headers: tokenHeader() }),
        axios.get('http://localhost:5000/api/dealer/dealerListings', { headers: tokenHeader() }),
      ]);

      // dealer "me" endpoint may return { user } or user object directly
      const pData = pRes.data?.user ?? pRes.data;
      setProfile(pData ?? null);

      const lData = lRes.data?.listings ?? lRes.data;
      setListings(Array.isArray(lData) ? lData : []);
    } catch (err) {
      console.error('Failed to load profile or listings', err);
      setError(err.response?.data?.error || err.message || 'Failed to load data');
      setProfile(null);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-red-600">You must be logged in to view your profile.</p>
      </div>
    );
  }

  if (loading) return <div className="p-4">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  // compute earnings:
  // - prefer explicit soldCount on listing
  // - fallback to number of bookings attached to listing
  const totalEarnings = listings.reduce((sum, l) => {
    const price = Number(l.price) || 0;
    const soldCount = l.soldCount ?? (Array.isArray(l.bookings) ? l.bookings.length : 0);
    return sum + price * soldCount;
  }, 0);

  const address =
    profile?.address ||
    profile?.location?.address ||
    profile?.dealerProfile?.address ||
    'Not provided';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{profile?.name ?? user.name ?? user.email}</h1>
          <div className="text-sm text-gray-600">{profile?.email ?? user.email}</div>
          <div className="text-xs text-gray-500">Role: {profile?.role ?? user.role}</div>
        </div>
        <div className="flex gap-2">
          <Link to="/dealer/profile" className="px-3 py-1 bg-blue-600 text-white rounded">Edit Profile</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Total Listings</div>
          <div className="mt-2 text-2xl font-semibold">{listings.length}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Total Earnings</div>
          <div className="mt-2 text-2xl font-semibold">₹ {Number(totalEarnings).toLocaleString()}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Account Created</div>
          <div className="mt-2 text-sm">{(profile?.createdAt ?? user?.createdAt) ? new Date(profile?.createdAt ?? user?.createdAt).toLocaleString() : '—'}</div>
        </div>
      </div>

      <div className="border rounded p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Address</h3>
        <div className="text-sm text-gray-700">{address}</div>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-3">Listings</h3>
        {listings.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">No listings yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(l => {
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
                    <div className="text-sm font-semibold">{model.brand ? `${model.brand} ${model.modelName || ''}` : (l.title || 'Untitled')}</div>
                    <div className="text-xs text-gray-600">Price: {l.price ? `₹ ${Number(l.price).toLocaleString()}` : '—'}</div>
                    <div className="mt-2 text-xs text-gray-600">Sold: {l.soldCount ?? (Array.isArray(l.bookings) ? l.bookings.length : 0)}</div>
                    <div className="mt-3">
                      <Link to={`/dealer/listings/${l.id}/edit`} className="px-2 py-1 bg-yellow-400 text-blue-900 rounded text-xs">Edit</Link>
                      <Link to={`/dealer/listings/${l.id}`} className="px-2 py-1 bg-blue-600 text-white rounded text-xs ml-2">View</Link>
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

export default Profile;