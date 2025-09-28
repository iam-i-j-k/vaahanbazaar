import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser && storedToken) {
        setUser(parsedUser);
      }
    } catch (err) {
      console.warn("Failed to parse stored user:", err);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    setLoading(false);
  }, []);

  const login = async (data) => {
    const {email,password,role} = data;
    const res = await axios.post(`http://localhost:5000/api/${role}/login`, { email, password });
    setUser(res.data.user);
    if (role === 'dealer') {
      navigate('/dealer/dashboard');
    }
    else if( role === 'user'){
      navigate('/');
    }
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const register = async (data) => {
    const {name,email,password,role} = data;
    // console.log(data)
    
    const res = await axios.post(`http://localhost:5000/api/${role}/signup`, { name, email, password });
    navigate('/login')
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};