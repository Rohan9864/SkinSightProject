import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import SubmitCasePage from './pages/patient/SubmitCasePage';
import CaseDetailPage from './pages/patient/CaseDetailPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReviewCasePage from './pages/doctor/ReviewCasePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AssignCasePage from './pages/admin/AssignCasePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />

          <Route path="/patient/submit" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <SubmitCasePage />
            </ProtectedRoute>
          } />

          <Route path="/patient/cases/:id" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <CaseDetailPage />
            </ProtectedRoute>
          } />

          {/* Doctor */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/doctor/cases/:id" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <ReviewCasePage />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageUsersPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/cases/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AssignCasePage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}