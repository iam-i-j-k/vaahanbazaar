

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // Only admin can see Models link
  const navLinks = [
    { to: '/', label: 'Home' },
    ...(user && user.role === 'admin' ? [{ to: '/models', label: 'Models' }] : []),
    { to: '/listings', label: 'Listings' },
    { to: '/bookings', label: 'Bookings' },
    { to: '/favorites', label: 'Favorites' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/price-alerts', label: 'Price Alerts' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-600 shadow-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-yellow-400 tracking-tight flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
          Vahan Bazar
        </span>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-white hover:text-yellow-300 px-2 py-1 rounded transition ${location.pathname === link.to ? 'bg-yellow-400 text-blue-900' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            <span className="text-white font-semibold mr-2">{user.name || user.email}</span>
            <button onClick={logout} className="bg-red-500 text-white font-semibold px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-yellow-400 text-blue-900 font-semibold px-3 py-1 rounded hover:bg-yellow-300 transition">Login</Link>
            <Link to="/register" className="bg-white text-blue-900 font-semibold px-3 py-1 rounded hover:bg-yellow-100 transition border border-yellow-400">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
