import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Only wait for auth initialization, don't show loader
  if (loading) {
    return null; // Return null instead of showing loader
  }

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the public page (login/signup)
  return children;
};

export default PublicRoute;

