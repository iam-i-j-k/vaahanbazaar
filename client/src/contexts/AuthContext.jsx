import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const storedUser = localStorage.getItem('user');

    try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setUser(parsedUser);
    } catch (err) {
        console.warn("Failed to parse stored user:", err);
        setUser(null);
    }

    setLoading(false);
    }, []);


  const login = async (email, password) => {
    // Replace with your backend login API
    const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (data) => {
    const res = await axios.post('http://localhost:5000/api/users/signup', data);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
