import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  apiSignup, 
  apiLogin, 
  apiGoogleAuth, 
  saveUserProfile 
} from '../services/api';
import { 
  normalizeRole, 
  getRoleConfig, 
  roleHasPermission, 
  getModuleAccess, 
  canControlGrid, 
  ROLES, 
  PERMISSIONS 
} from '../config/roles';

const AuthContext = createContext();

export const DEMO_USER = {
  id: "usr-001",
  name: "Chief Grid Dispatcher",
  email: "dispatcher@sldc.gujarat.gov.in",
  role: "Chief Grid Dispatcher",
  station: "Gujarat SLDC - Gotri, Vadodara",
  token: "jwt_demo_dispatcher_session"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('renewai_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load user session", e);
    }
    // Start unauthenticated (null) by default for security and proper login flow
    return null;
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

  // Derive active role information
  const activeRoleId = normalizeRole(user?.role || 'chief_grid_dispatcher');
  const roleConfig = getRoleConfig(activeRoleId);

  // Switch role dynamically (in demo / evaluator / control room mode) and save to SQLite DB
  const switchRole = (newRoleKey) => {
    const norm = normalizeRole(newRoleKey);
    const targetConfig = ROLES[norm] || ROLES.chief_grid_dispatcher;

    const updated = {
      ...(user || DEMO_USER),
      role: targetConfig.name,
      name: user?.name || targetConfig.defaultUser,
      station: targetConfig.defaultStation,
    };
    setUser(updated);
    try {
      localStorage.setItem('renewai_auth_user', JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist switched role", e);
    }

    // Persist to backend database (SQLite profiles table)
    saveUserProfile({
      email: updated.email || targetConfig.defaultEmail,
      name: updated.name,
      role: updated.role,
      station: updated.station
    }).catch(e => console.warn("Background role DB sync notice:", e));
  };

  // Update operator profile and persist directly to SQLite database & local storage
  const updateProfile = async (profileData) => {
    const updated = {
      ...(user || DEMO_USER),
      name: (profileData.name !== undefined ? profileData.name : user?.name) || DEMO_USER.name,
      role: (profileData.role !== undefined ? profileData.role : user?.role) || DEMO_USER.role,
      station: (profileData.station !== undefined ? profileData.station : user?.station) || DEMO_USER.station,
      email: (profileData.email !== undefined ? profileData.email : user?.email) || DEMO_USER.email,
    };

    setUser(updated);
    try {
      localStorage.setItem('renewai_auth_user', JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist updated user to localStorage", e);
    }

    try {
      const res = await saveUserProfile({
        email: updated.email,
        name: updated.name,
        role: updated.role,
        station: updated.station
      });
      return res;
    } catch (err) {
      console.warn("Could not sync profile to backend SQLite DB", err);
      return { success: false, message: err.message };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Primary: Verify credentials against SQLite DB profiles table via backend
      const res = await apiLogin(email, password);
      if (res.success) {
        const userPayload = { ...res.data.user, token: res.data.token };
        setUser(userPayload);
        try {
          localStorage.setItem('surge_last_login_email', email);
        } catch (e) {}
        setLoading(false);
        return { success: true, user: userPayload };
      }

      // 2. Demo account credentials fallback (for quick evaluation / offline mode)
      if (email.toLowerCase().includes('demo') || email.toLowerCase().includes('dispatcher') || password === 'admin123') {
        setUser(DEMO_USER);
        try {
          localStorage.setItem('surge_last_login_email', email);
        } catch (e) {}
        setLoading(false);
        return { success: true, user: DEMO_USER };
      }

      // 3. Supabase fallback if configured
      if (supabase.hasKeys) {
        const sbRes = await supabase.signIn(email, password);
        if (sbRes.success) {
          setUser(sbRes.user);
          try {
            localStorage.setItem('surge_last_login_email', email);
          } catch (e) {}
          setLoading(false);
          return { success: true, user: sbRes.user };
        }
      }

      throw new Error(res.message || 'Invalid operator credentials.');
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
      // 1. Primary: Direct registration into database / resilient local store
      const res = await apiSignup({ name, email, password, role, station });
      if (res.success) {
        const userPayload = { ...res.data.user, token: res.data.token };
        setUser(userPayload);
        try {
          localStorage.setItem('surge_last_login_email', email);
        } catch (e) {}
        setLoading(false);
        return { success: true, user: userPayload };
      }

      // 2. If backend reported an explicit business validation error, throw it
      if (res.message) {
        throw new Error(res.message);
      }

      // 3. Supabase fallback if configured
      if (supabase.hasKeys) {
        const sbRes = await supabase.signUp(email, password, { name, role, station });
        if (sbRes.success) {
          setUser(sbRes.user);
          try {
            localStorage.setItem('surge_last_login_email', email);
          } catch (e) {}
          setLoading(false);
          return { success: true, user: sbRes.user };
        }
      }

      throw new Error('Failed to create operator account in database.');
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.signOut();
    } catch (e) {}
    setUser(null);
    try {
      localStorage.removeItem('renewai_auth_user');
      localStorage.removeItem('renewai_supabase_session');
    } catch (e) {}
  };

  const loginAsDemo = (customRole) => {
    const roleStr = customRole || 'Chief Grid Dispatcher';
    const norm = normalizeRole(roleStr);
    const targetConfig = ROLES[norm] || ROLES.chief_grid_dispatcher;
    const demo = {
      id: `usr-demo-${norm}`,
      name: targetConfig.defaultUser || "Chief Grid Dispatcher",
      email: targetConfig.defaultEmail || "dispatcher@sldc.gujarat.gov.in",
      role: targetConfig.name,
      station: targetConfig.defaultStation || "Gujarat SLDC - Gotri, Vadodara",
      token: `jwt_demo_${norm}_session`
    };
    setUser(demo);
    try {
      localStorage.setItem('renewai_auth_user', JSON.stringify(demo));
    } catch (e) {}
    return demo;
  };

  const loginWithGoogle = async (googlePayload = {}) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Primary: Send payload to FastAPI backend to verify and store in SQLite DB
      const res = await apiGoogleAuth(googlePayload);
      if (res.success) {
        const userPayload = { ...res.data.user, token: res.data.token };
        setUser(userPayload);
        setLoading(false);
        return { success: true, user: userPayload };
      }

      // 2. Offline / resilient fallback session for Google operator
      if (!googlePayload.email && !googlePayload.credential) {
        throw new Error("Google authentication did not return a valid user profile or token.");
      }

      const emailStr = (googlePayload.email || "google.operator@sldc.gov.in").toLowerCase();
      const nameStr = googlePayload.name || emailStr.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const googleUser = {
        id: `usr-google-${Date.now().toString(36)}`,
        name: nameStr,
        email: emailStr,
        role: googlePayload.role || "Chief Grid Dispatcher",
        station: googlePayload.station || "Regional Load Despatch Centre",
        picture: googlePayload.picture || null,
        provider: "google",
        token: `jwt_google_${Date.now()}`
      };

      // Ensure it is saved in SQLite database
      saveUserProfile({
        email: googleUser.email,
        name: googleUser.name,
        role: googleUser.role,
        station: googleUser.station
      }).catch(e => console.warn("Google user DB save notice:", e));

      setUser(googleUser);
      setLoading(false);
      return { success: true, user: googleUser };
    } catch (err) {
      console.warn("Google login notice:", err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Helper permission & scope utilities
  const hasPermission = (permission) => roleHasPermission(activeRoleId, permission);
  const getModuleAccessState = (moduleKey) => getModuleAccess(activeRoleId, moduleKey);
  const canControl = () => canControlGrid(activeRoleId);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      activeRoleId,
      roleConfig,
      switchRole,
      updateProfile,
      hasPermission,
      getModuleAccessState,
      canControl,
      isDispatcher: activeRoleId === 'chief_grid_dispatcher',
      isPlantEngineer: activeRoleId === 'plant_operations_engineer',
      isTradingAnalyst: activeRoleId === 'energy_trading_analyst',
      isRemcOfficer: activeRoleId === 'remc_desk_officer',
      loading,
      error,
      login,
      signup,
      logout,
      loginAsDemo,
      loginWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
