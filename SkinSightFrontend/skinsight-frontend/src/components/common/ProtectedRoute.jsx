import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({
  children,
  allowedRoles
}) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles &&
      !allowedRoles.includes(user.role)) {
    const redirects = {
      PATIENT: '/patient',
      DOCTOR:  '/doctor',
      ADMIN:   '/admin',
    };
    return <Navigate
        to={redirects[user.role] || '/login'}
        replace />;
  }

  return children;
}