import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientCasesListPage from './pages/patient/PatientCasesListPage';
import PatientNotificationsPage from './pages/patient/PatientNotificationsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import SubmitCasePage from './pages/patient/SubmitCasePage';
import CaseDetailPage from './pages/patient/CaseDetailPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAssignedCasesPage from './pages/doctor/DoctorAssignedCasesPage';
import DoctorCasesHistoryPage from './pages/doctor/DoctorCasesHistoryPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import ReviewCasePage from './pages/doctor/ReviewCasePage';
import DoctorNotificationsPage from './pages/doctor/DoctorNotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllCasesPage from './pages/admin/AdminAllCasesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AssignCasePage from './pages/admin/AssignCasePage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

// Layout wrapper for dashboard pages
function DashboardLayoutOutlet({ title = 'Dashboard' }) {
  return (
    <DashboardLayout title={title}>
      <Outlet />
    </DashboardLayout>
  );
}

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
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Patient Routes with Shared Layout - no sidebar blinking */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayoutOutlet />
              </ProtectedRoute>
            }
          >
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/cases" element={<PatientCasesListPage />} />
            <Route path="/patient/cases/:id" element={<CaseDetailPage />} />
            <Route path="/patient/cases/:id/resubmit" element={<SubmitCasePage />} />
            <Route path="/patient/notifications" element={<PatientNotificationsPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
            <Route path="/patient/submit" element={<SubmitCasePage />} />
          </Route>

          {/* Doctor Routes with Shared Layout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayoutOutlet />
              </ProtectedRoute>
            }
          >
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/assigned-cases" element={<DoctorAssignedCasesPage />} />
            <Route path="/doctor/cases-history" element={<DoctorCasesHistoryPage />} />
            <Route path="/doctor/notifications" element={<DoctorNotificationsPage />} />
            <Route path="/doctor/cases/:id" element={<ReviewCasePage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          </Route>

          {/* Admin Routes with Shared Layout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayoutOutlet />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/cases/:id" element={<AssignCasePage />} />
            <Route path="/admin/all-cases" element={<AdminAllCasesPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}