import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    // Wrong role - redirect to their dashboard
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/agent'} replace />;
  }
  return children;
}