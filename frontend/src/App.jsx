import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Primary critical routes loaded eagerly
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

// Code splitting: dynamically import secondary routes on demand
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ScholarshipsPage = lazy(() => import('./pages/ScholarshipsPage'));
const ScholarshipDetailPage = lazy(() => import('./pages/ScholarshipDetailPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));

function PageLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
      <div className="h-28 w-full bg-slate-100 rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-100 rounded-xl"></div>
        <div className="h-40 bg-slate-100 rounded-xl"></div>
        <div className="h-40 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
