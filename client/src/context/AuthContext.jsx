import React, { createContext, useState, useEffect } from 'react';
import api from '../utilies/axios'; //

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user || data); 
      localStorage.setItem('user', JSON.stringify(data.user || data));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setUser(data.user || data);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};