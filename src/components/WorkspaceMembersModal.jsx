import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Copy, Check, Key } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import '../styles/Modal.css';
import '../styles/MembersModal.css';

const WorkspaceMembersModal = ({ isOpen, onClose, workspace }) => {
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && workspace) {
      fetchMembers();
    }
  }, [isOpen, workspace]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await workspaceService.getWorkspaceMembers(workspace._id || workspace.id);
      console.log('Members response:', response);
      console.log('Members data structure:', response.data);
      // Log first member to see structure
      if (response.data && response.data.length > 0) {
        console.log('First member structure:', response.data[0]);
      }
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInviteLink = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await workspaceService.generateInviteLink(workspace._id || workspace.id);
      console.log('Invite link response:', response);
      const code = response.data.inviteCode;
      const link = `${window.location.origin}/invite/${code}`;
      setInviteLink(link);
      setInviteCode(code);
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      setError('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    console.log('Updating member role:', { memberId, newRole });
    if (!memberId) {
      console.error('Member ID is undefined!');
      setError('Cannot update member role: Invalid member ID');
      return;
    }

    try {
      await workspaceService.updateMemberRole(workspace._id || workspace.id, memberId, newRole);
      await fetchMembers();
    } catch (error) {
      console.error('Failed to update member role:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update member role';
      setError(errorMessage);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content members-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share workspace</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          {/* Invite Link Section */}
          <div className="invite-section">
            <div className="invite-header">
              <LinkIcon size={18} />
              <div>
                <h3>Share this workspace with a link</h3>
                {!inviteLink && (
                  <button 
                    className="create-link-btn" 
                    onClick={handleGenerateInviteLink}
                    disabled={loading}
                  >
                    Create link
                  </button>
                )}
              </div>
            </div>

            {inviteLink && (
              <div className="invite-link-container">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="invite-link-input"
                />
                <button
                  className="copy-link-btn"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            )}
          </div>

          {/* Manual Invite Code Section */}
          {inviteCode && (
            <div className="invite-section invite-code-section">
              <div className="invite-header">
                <Key size={18} />
                <div>
                  <h3>Or share this code</h3>
                  <p className="invite-code-description">
                    Users can enter this code manually to join the workspace
                  </p>
                </div>
              </div>
              <div className="invite-code-container">
                <div className="invite-code-display">
                  <span className="invite-code-text">{inviteCode}</span>
                </div>
                <button
                  className="copy-code-btn"
                  onClick={handleCopyCode}
                  title="Copy code"
                >
                  {codeCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Members List Section */}
          <div className="members-section">
            <div className="members-header">
              <h3>Board members</h3>
              <span className="members-count">{members.length}</span>
            </div>

            {loading && members.length === 0 ? (
              <div className="loading-state">Loading members...</div>
            ) : (
              <div className="members-list">
                {members.map((member) => {
                  // Extract member ID - try multiple possible fields
                  const memberId = member._id || member.id || member.userId || member.user?._id || member.user?.id;

                  return (
                    <div key={memberId} className="member-item">
                      <div className="member-avatar" style={{ background: getAvatarColor(member.user?.name || member.name) }}>
                        {getInitials(member.user?.name || member.name)}
                      </div>
                      <div className="member-info">
                        <div className="member-name">
                          {member.user?.name || member.name}
                          {member.isCurrentUser && <span className="you-badge">(you)</span>}
                        </div>
                        <div className="member-email">
                          {member.user?.email || member.email}
                          {member.role === 'admin' && <span className="role-badge">• Workspace admin</span>}
                        </div>
                      </div>
                      <div className="member-actions">
                        <select
                          className="role-select"
                          value={member.role}
                          onChange={(e) => handleRoleChange(memberId, e.target.value)}
                          disabled={member.isCurrentUser}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembersModal;

