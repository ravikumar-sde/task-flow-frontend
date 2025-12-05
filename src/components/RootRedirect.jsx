import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#718096',
        background: '#1d2125'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect based on authentication status
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default RootRedirect;

