import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'owner') return <Navigate to="/owner" replace />;
    if (user.role === 'sales') return <Navigate to="/sales" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
