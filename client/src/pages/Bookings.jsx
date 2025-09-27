import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    listingId: '',
    appointmentTs: ''
  });

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get('/api/listings');
      setListings(res.data);
    } catch (err) {
      console.error('Failed to fetch listings');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchListings()]);
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
      await api.post('/api/bookings', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ listingId: '', appointmentTs: '' });
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      setError('Failed to create booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9" />
          </svg>
          My Bookings
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'Book Test Ride'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="listingId" value={form.listingId} onChange={handleChange} required className="border p-2 rounded">
              <option value="">Select Vehicle</option>
              {listings.map(listing => (
                <option key={listing.id} value={listing.id}>
                  {listing.model?.brand} {listing.model?.modelName} - ₹{listing.price?.toLocaleString()}
                </option>
              ))}
            </select>
            <input
              name="appointmentTs"
              type="datetime-local"
              value={form.appointmentTs}
              onChange={handleChange}
              required
              className="border p-2 rounded"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <button type="submit" className="mt-4 bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition">
            Book Test Ride
          </button>
        </form>
      )}

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {booking.listing?.model?.brand} {booking.listing?.model?.modelName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><span className="font-semibold">Appointment:</span> {new Date(booking.appointmentTs).toLocaleString()}</p>
                      <p><span className="font-semibold">Dealer:</span> {booking.dealer?.name}</p>
                      <p><span className="font-semibold">Price:</span> ₹{booking.listing?.price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p><span className="font-semibold">Booked on:</span> {new Date(booking.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Vehicle Type:</span> {booking.listing?.listingType}</p>
                      <p><span className="font-semibold">Condition:</span> {booking.listing?.condition}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9" />
            </svg>
            <p>No bookings found. Book your first test ride!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;