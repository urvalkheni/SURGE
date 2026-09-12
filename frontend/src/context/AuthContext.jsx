import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const DEMO_USER = {
  id: "usr-001",
  name: "Krish Patel",
  email: "krish.patel@sldc.gujarat.gov.in",
  role: "Chief Grid Dispatcher",
  station: "Gujarat SLDC - Gotri, Vadodara",
  token: "jwt_demo_krish_patel_session"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('renewai_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load user session", e);
    }
    // Default to DEMO_USER to allow seamless instant exploration
    return DEMO_USER;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('renewai_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('renewai_auth_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try Supabase Auth
      const res = await supabase.signIn(email, password);
      if (res.success) {
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      }

      // 2. Try Local FastAPI backend fallback if running
      const backendRes = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).catch(() => null);

      if (backendRes && backendRes.ok) {
        const data = await backendRes.json();
        const userPayload = { ...data.user, token: data.token };
        setUser(userPayload);
        setLoading(false);
        return { success: true, user: userPayload };
      }

      // 3. Demo account match
      if (email.toLowerCase().includes('krish') || password === 'admin123') {
        setUser(DEMO_USER);
        setLoading(false);
        return { success: true, user: DEMO_USER };
      }

      throw new Error(res.error || 'Invalid operator credentials.');
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const signup = async ({ name, email, password, role, station }) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try Supabase Auth signup
      const res = await supabase.signUp(email, password, { name, role, station });
      if (res.success) {
        setUser(res.user);
        setLoading(false);
        return { success: true, user: res.user };
      }

      // 2. Try FastAPI backend signup
      const backendRes = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, station })
      }).catch(() => null);

      if (backendRes && backendRes.ok) {
        const data = await backendRes.json();
        const userPayload = { ...data.user, token: data.token };
        setUser(userPayload);
        setLoading(false);
        return { success: true, user: userPayload };
      }

      throw new Error(res.error || 'Failed to create operator account.');
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await supabase.signOut();
    setUser(null);
    localStorage.removeItem('renewai_auth_user');
  };

  const loginAsDemo = (customRole) => {
    const demo = {
      ...DEMO_USER,
      role: customRole || DEMO_USER.role
    };
    setUser(demo);
    return demo;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      signup,
      logout,
      loginAsDemo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
