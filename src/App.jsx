import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import WaterMonitoringPage from './pages/WaterMonitoring';
import SmartIrrigationPage from './pages/SmartIrrigation';
import ControlPanelPage from './pages/ControlPanel';
import AlertsPage from './pages/Alerts';
import SettingsPage from './pages/Settings';

// ── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/"           element={<DashboardPage />} />
              <Route path="/monitoring" element={<WaterMonitoringPage />} />
              <Route path="/irrigation" element={<SmartIrrigationPage />} />
              <Route path="/control"    element={<ControlPanelPage />} />
              <Route path="/alerts"     element={<AlertsPage />} />
              <Route path="/settings"   element={<SettingsPage />} />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
