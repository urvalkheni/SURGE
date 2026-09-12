import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import CommandCenter from './pages/CommandCenter';
import Forecast from './pages/Forecast';
import Alerts from './pages/Alerts';
import Recommendations from './pages/Recommendations';
import Plants from './pages/Plants';
import Accuracy from './pages/Accuracy';
import Weather from './pages/Weather';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

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
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/plants" element={<Plants />} />
              <Route path="/accuracy" element={<Accuracy />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Aliases & Fallback Routes */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
