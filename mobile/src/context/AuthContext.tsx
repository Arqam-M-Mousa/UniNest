import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePictureUrl?: string;
  universityId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const response = await userAPI.getProfile();
        // Backend returns { success: true, data: user } via sendSuccess
        const userData = response.data || response;
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      // Clear invalid token
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    const response = await authAPI.signin(email, password);
    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const signup = async (userData: any) => {
    const response = await authAPI.signup(userData);
    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const signout = async () => {
    try {
      // Clear state first for immediate UI update
      setUser(null);
      setToken(null);
      // Then clear storage
      await AsyncStorage.removeItem('token');
      console.log('Sign out successful - token removed');
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Even if storage fails, keep state cleared
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getProfile();
      // Backend returns { success: true, data: user } via sendSuccess
      const userData = response.data || response;
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't sign out on refresh failure - just log the error
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signin, signup, signout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
