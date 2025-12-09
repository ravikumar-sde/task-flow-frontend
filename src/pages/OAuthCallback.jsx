import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, error

  console.log('OAuthCallback - searchParams:', searchParams.get('token'));

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        console.error('❌ OAuth error:', error);
        setStatus('error');
        setTimeout(() => {
          navigate('/login?error=' + encodeURIComponent(error));
        }, 2000);
        return;
      }

      if (token && refreshToken) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        try {
          // Fetch user data
          const authService = (await import('../services/authService')).default;
          const response = await authService.getCurrentUser();

          setUser(response.data);
          navigate('/dashboard');
        } catch (err) {
          console.error('❌ Failed to get user:', err);
          setStatus('error');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        console.error('❌ Missing tokens in OAuth callback');
        console.log('🔐 Available URL params:', Array.from(searchParams.entries()));
        setStatus('error');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#718096',
      gap: '16px'
    }}>
      {status === 'processing' ? (
        <>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4299e1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div>Completing authentication...</div>
        </>
      ) : (
        <>
          <div style={{ color: '#e53e3e' }}>Authentication failed</div>
          <div style={{ fontSize: '14px' }}>Redirecting to login...</div>
        </>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;

