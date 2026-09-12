import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import CommandCenter from './pages/CommandCenter';
import Forecast from './pages/Forecast';
import Alerts from './pages/Alerts';
import Recommendations from './pages/Recommendations';
import Plants from './pages/Plants';
import GridDemand from './pages/GridDemand';
import BatteryStorage from './pages/BatteryStorage';
import Accuracy from './pages/Accuracy';
import Weather from './pages/Weather';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Guard for role-specific module authorization
function RoleRoute({ moduleId, children }) {
  const { roleConfig } = useAuth();
  const access = roleConfig?.moduleAccess?.[moduleId] || 'FULL';

  // If module is HIDDEN for this role, gracefully redirect to dashboard
  // NEVER log the user out or redirect to the landing page
  if (access === 'HIDDEN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Operational Control Room Routes */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<CommandCenter />} />
              <Route path="/forecast" element={<RoleRoute moduleId="forecast"><Forecast /></RoleRoute>} />
              <Route path="/alerts" element={<RoleRoute moduleId="alerts"><Alerts /></RoleRoute>} />
              <Route path="/recommendations" element={<RoleRoute moduleId="recommendations"><Recommendations /></RoleRoute>} />
              <Route path="/plants" element={<RoleRoute moduleId="plants"><Plants /></RoleRoute>} />
              <Route path="/grid" element={<RoleRoute moduleId="grid"><GridDemand /></RoleRoute>} />
              <Route path="/battery" element={<RoleRoute moduleId="battery"><BatteryStorage /></RoleRoute>} />
              <Route path="/analytics" element={<RoleRoute moduleId="accuracy"><Accuracy /></RoleRoute>} />
              <Route path="/accuracy" element={<RoleRoute moduleId="accuracy"><Accuracy /></RoleRoute>} />
              <Route path="/weather" element={<RoleRoute moduleId="weather"><Weather /></RoleRoute>} />
              <Route path="/settings" element={<RoleRoute moduleId="settings"><Settings /></RoleRoute>} />
            </Route>

            {/* Aliases & Fallback Routes (Always redirect to dashboard, never kick to landing page) */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
