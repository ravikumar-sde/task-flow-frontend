import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import { useAuth } from '../hooks/useAuth';
import '../styles/JoinWorkspace.css';

const JoinWorkspace = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('JoinWorkspace - inviteCode:', inviteCode);
    console.log('JoinWorkspace - user:', user);

    if (!user) {
      // If user is not logged in, redirect to login with return URL
      console.log('User not logged in, redirecting to login');
      navigate(`/login?redirect=/invite/${inviteCode}`);
      return;
    }

    if (inviteCode) {
      handleJoinWorkspace();
    }
  }, [inviteCode, user]);

  const handleJoinWorkspace = async () => {
    try {
      setStatus('loading');
      setError('');
      
      console.log('Attempting to join workspace with invite code:', inviteCode);
      const response = await workspaceService.joinWorkspace(inviteCode);
      console.log('Join workspace response:', response);

      if (response.success) {
        setWorkspace(response.data.workspace || response.data);
        setStatus('success');
        
        // Redirect to workspace dashboard after 2 seconds
        setTimeout(() => {
          const workspaceId = response.data.workspace?._id || response.data.workspace?.id || response.data._id || response.data.id;
          console.log('Redirecting to workspace:', workspaceId);
          navigate(`/workspace/${workspaceId}`);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to join workspace');
      }
    } catch (err) {
      console.error('Failed to join workspace:', err);
      setStatus('error');
      
      // Handle different error scenarios
      if (err.response?.status === 404) {
        setError('Invalid or expired invite link');
      } else if (err.response?.status === 409) {
        setError('You are already a member of this workspace');
        // Still redirect to workspace if already a member
        setTimeout(() => {
          const workspaceId = err.response?.data?.data?.workspaceId;
          if (workspaceId) {
            navigate(`/workspace/${workspaceId}`);
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else if (err.response?.status === 401) {
        setError('Please log in to join this workspace');
        navigate(`/login?redirect=/invite/${inviteCode}`);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to join workspace');
      }
    }
  };

  return (
    <div className="join-workspace-container">
      <div className="join-workspace-card">
        {status === 'loading' && (
          <div className="join-status loading">
            <Loader2 size={64} className="spinner" />
            <h2>Joining workspace...</h2>
            <p>Please wait while we add you to the workspace</p>
          </div>
        )}

        {status === 'success' && (
          <div className="join-status success">
            <CheckCircle size={64} className="success-icon" />
            <h2>Successfully joined!</h2>
            <p>Welcome to <strong>{workspace?.name || 'the workspace'}</strong></p>
            <p className="redirect-message">Redirecting to workspace dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="join-status error">
            <XCircle size={64} className="error-icon" />
            <h2>Unable to join workspace</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleJoinWorkspace}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="join-footer">
          <Users size={16} />
          <span>Workspace Invitation</span>
        </div>
      </div>
    </div>
  );
};

export default JoinWorkspace;

