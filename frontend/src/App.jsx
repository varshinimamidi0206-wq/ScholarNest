import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import ComparePage from './pages/ComparePage';
import ApplicationsPage from './pages/ApplicationsPage';
import SavedPage from './pages/SavedPage';
import DocumentsPage from './pages/DocumentsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing, login and register */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Public discovery & comparison */}
            <Route path="scholarships" element={<ScholarshipsPage />} />
            <Route path="scholarships/:id" element={<ScholarshipDetailPage />} />
            <Route path="compare" element={<ComparePage />} />

            {/* Authenticated routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="saved"
              element={
                <ProtectedRoute>
                  <SavedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
