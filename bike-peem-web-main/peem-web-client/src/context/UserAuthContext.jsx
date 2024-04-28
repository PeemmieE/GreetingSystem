import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const UserAuthContext = createContext();

export const UserAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState('');

  const getCurrentUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) { return null; }
    try {
      const response = await axios.post(import.meta.env.VITE_API + '/decodeToken', { token });
      const currentUser = response.data.decoded.username;
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      TokenError(error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(import.meta.env.VITE_API + '/login', { username, password });
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Error during login:', error.response.data);
    }
  };

  const logout = () => {
    setUser('');
    localStorage.removeItem('token');
  };

  const TokenError = (error) => {
    console.error('Error decoding token:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    throw error;
  };

  return (
    <UserAuthContext.Provider value={{ user, login, logout, getCurrentUser }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(UserAuthContext);
};