import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DealersListing = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setListings([]);
        setLoading(false);
        return;
      }

      const res = await axios.get('http://localhost:5000/api/dealer/dealerListings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // controller returns { listings } — handle both structures
      const data = res.data?.listings ?? res.data;
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch dealer listings', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div>Loading your listings...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Listings</h2>
        <div className="flex gap-2">
          <button onClick={fetchListings} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          <Link to="/dealer/listings/new" className="px-3 py-1 bg-green-600 text-white rounded">Add Listing</Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div>No listings found. Create one using "Add Listing".</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map(l => {
            const imageUrl = l.images && l.images.length > 0 ? l.images[0].url : '';
            const model = l.model ?? {};
            return (
              <div key={l.id} className="border rounded p-4 flex gap-4">
                <div style={{ width: 160, height: 110, flexShrink: 0 }} className="bg-gray-100 rounded overflow-hidden">
                  {imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={imageUrl} alt="listing image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold">
                        {model.brand ? `${model.brand} ${model.modelName || ''}` : (l.title || 'Untitled Listing')}
                      </div>
                      <div className="text-sm text-gray-600">{l.listingType ? l.listingType.toUpperCase() : ''} {l.condition ? `· ${l.condition}` : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{l.price ? `₹ ${Number(l.price).toLocaleString()}` : '—'}</div>
                      <div className="text-sm text-gray-500">{l.stockCount ? `${l.stockCount} in stock` : ''}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    <div>Year: {l.year ?? '—'}</div>
                    <div>KMs: {l.kms ?? '—'}</div>
                    <div className="mt-1 text-xs text-gray-500">Created: {l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'}</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link to={`/dealer/listings/${l.id}/edit`} className="px-3 py-1 bg-yellow-400 text-blue-900 rounded">Edit</Link>
                    <Link to={`/dealer/listings/${l.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">View</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealersListing;
