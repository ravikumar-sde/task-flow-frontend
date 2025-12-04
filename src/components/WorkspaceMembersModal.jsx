import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Copy, Check, UserPlus } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import '../styles/Modal.css';
import '../styles/MembersModal.css';

const WorkspaceMembersModal = ({ isOpen, onClose, workspace }) => {
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
      const link = `${window.location.origin}/invite/${response.data.inviteCode}`;
      setInviteLink(link);
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

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await workspaceService.updateMemberRole(workspace._id || workspace.id, memberId, newRole);
      await fetchMembers();
    } catch (error) {
      console.error('Failed to update member role:', error);
      setError('Failed to update member role');
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
                {members.map((member) => (
                  <div key={member._id || member.userId} className="member-item">
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
                        onChange={(e) => handleRoleChange(member._id || member.userId, e.target.value)}
                        disabled={member.isCurrentUser}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembersModal;

