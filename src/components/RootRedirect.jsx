import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  // Only wait for auth initialization, don't show loader
  if (loading) {
    return null; // Return null instead of showing loader
  }

  // Redirect based on authentication status
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default RootRedirect;

