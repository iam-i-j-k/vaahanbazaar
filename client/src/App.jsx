import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Models from './pages/Models';
import Listings from './pages/Listings';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import Reviews from './pages/Reviews';
import PriceAlerts from './pages/PriceAlerts';
import DealerDashboard from './pages/DealerDashboard';
import DealersListing from './pages/DealersListing';

function App() {
  return (
      <Router>
    <AuthProvider>
        <Navbar />
        <div style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/dealer/models" element={
              <ProtectedRoute roles={['dealer']}>
                <Models />
              </ProtectedRoute>
            }  />
            <Route path="/listings" element={<Listings />} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/price-alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
            <Route path="/dealer/*" element={
              <ProtectedRoute roles={['dealer']}>
                <DealerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dealer/listings" element={
              <ProtectedRoute roles={['dealer']}>
                <DealersListing />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
    </AuthProvider>
    </Router>
  );
}

export default App;
