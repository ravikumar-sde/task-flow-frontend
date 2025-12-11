import { useState } from 'react';
import { X, Loader2, AlertCircle, UserPlus, CheckCircle } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import { useNavigate } from 'react-router-dom';
import '../styles/Modal.css';
import '../styles/JoinWorkspaceModal.css';

const JoinWorkspaceModal = ({ isOpen, onClose, onJoinSuccess }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setInviteCode(value);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (inviteCode.length !== 12) {
      setError('Invite code must be 12 characters long');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Joining workspace with code:', inviteCode);
      const response = await workspaceService.joinWorkspaceWithCode(inviteCode);
      console.log('✅ Join workspace response:', response);

      const workspace = response.data?.workspace || response.data;
      const workspaceId = workspace?._id || workspace?.id;
      const name = workspace?.name || 'Workspace';

      setWorkspaceName(name);
      setSuccess(true);

      // Call success callback if provided
      if (onJoinSuccess) {
        onJoinSuccess(workspace);
      }

      // Redirect to workspace after 2 seconds
      setTimeout(() => {
        onClose();
        setInviteCode('');
        setSuccess(false);
        if (workspaceId) {
          navigate(`/workspace/${workspaceId}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);

    } catch (err) {
      console.error('❌ Join workspace error:', err);
      
      // Handle different error scenarios
      if (err.response?.status === 404) {
        setError('Invalid or expired invite code');
      } else if (err.response?.status === 409) {
        setError('You are already a member of this workspace');
        // Still redirect to workspace if already a member
        const workspaceId = err.response?.data?.data?.workspaceId;
        if (workspaceId) {
          setTimeout(() => {
            onClose();
            navigate(`/workspace/${workspaceId}`);
          }, 2000);
        }
      } else if (err.response?.status === 401) {
        setError('Please log in to join this workspace');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to join workspace');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setInviteCode('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content join-workspace-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <UserPlus size={24} />
          </div>
          <h2>Join Workspace</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <CheckCircle size={18} />
                <span>Successfully joined "{workspaceName}"! Redirecting...</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="invite-code">Workspace Invite Code</label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={handleChange}
                placeholder="Enter 12-character code"
                className="form-input invite-code-input"
                disabled={loading || success}
                autoFocus
                maxLength={12}
              />
              <p className="form-help-text">
                Enter the 12-character invite code shared by your workspace admin
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading || success}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || success || !inviteCode.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Joining...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={18} />
                  <span>Joined!</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Join Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinWorkspaceModal;

