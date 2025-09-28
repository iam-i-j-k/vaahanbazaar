import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DealerBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tokenHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setBookings([]);
        setLoading(false);
        return;
      }

      // Try dealer-scoped endpoint first; fallback to generic bookings endpoint
      let res;
      try {
        res = await axios.get('http://localhost:5000/api/dealer/bookings', { headers: tokenHeader() });
      } catch (err) {
        // fallback
        res = await axios.get('http://localhost:5000/api/bookings', { headers: tokenHeader() });
      }

      const data = res.data?.bookings ?? res.data;
      // Filter to bookings owned by this dealer if API returned global bookings
      const arr = Array.isArray(data) ? data : [];
      const myBookings = arr.filter(b => {
        if (!b.dealer && !b.listing) return false;
        // prefer explicit dealer id on booking
        if (b.dealer && b.dealer.id) return String(b.dealer.id) === String(user.id) || String(b.dealer.id) === String(b.dealerId);
        // fallback: listing.dealerId
        if (b.listing && (b.listing.dealerId || (b.listing.dealer && b.listing.dealer.id))) {
          const dealerId = b.listing.dealerId ?? b.listing.dealer?.id;
          return String(dealerId) === String(user.id);
        }
        return false;
      });

      setBookings(myBookings);
    } catch (err) {
      console.error('Failed to fetch dealer bookings', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { status }, { headers: tokenHeader() });
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status } : b)));
    } catch (err) {
      console.error('Failed to update booking status', err);
      setError(err.response?.data?.error || err.message || 'Failed to update booking');
    }
  };

  if (!user) return <div className="p-4 text-red-600">You must be logged in as a dealer to view bookings.</div>;
  if (loading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Dealer Bookings</h2>
        <div className="flex gap-2">
          <button onClick={fetchBookings} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          <Link to="/dealer/listings" className="px-3 py-1 bg-yellow-400 text-blue-900 rounded">My Listings</Link>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">No bookings found for your listings.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const listing = b.listing ?? b.listingId ?? {};
            const buyer = b.user ?? b.buyer ?? {};
            const appointment = b.appointmentTs ? new Date(b.appointmentTs).toLocaleString() : b.createdAt ? new Date(b.createdAt).toLocaleString() : '—';
            return (
              <div key={b.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold text-lg">{listing.title ?? (listing.model ? `${listing.model.brand} ${listing.model.modelName}` : 'Untitled listing')}</div>
                  <div className="text-sm text-gray-600">Appointment: {appointment}</div>
                  <div className="text-sm text-gray-600">Buyer: {buyer.name ?? buyer.email ?? '—'}</div>
                  <div className="text-sm text-gray-600">Contact: {buyer.email ? <a href={`mailto:${buyer.email}`} className="text-blue-600">{buyer.email}</a> : '—'}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-700 mr-2">Status: <span className="font-semibold">{b.status ?? 'pending'}</span></div>

                  {/* Action buttons (will call bookings API if available) */}
                  {b.status !== 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-3 py-1 bg-green-600 text-white rounded">Confirm</button>
                  )}
                  {b.status !== 'completed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')} className="px-3 py-1 bg-blue-600 text-white rounded">Mark Completed</button>
                  )}
                  <Link to={`/dealer/listings/${listing.id}`} className="px-3 py-1 bg-yellow-400 text-blue-900 rounded">View Listing</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealerBookings;