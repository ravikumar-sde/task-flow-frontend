import { useState, useEffect, useRef } from 'react';
import { X, Tag, Calendar, Users, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import cardService from '../services/cardService';
import workspaceService from '../services/workspaceService';
import commentService from '../services/commentService';
import { useAuth } from '../hooks/useAuth';
import '../styles/CardModal.css';

const CardModal = ({ card, stageId, stageName, workspaceId, onClose, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [labels, setLabels] = useState(card?.labels || (card?.priority ? [card.priority] : []));
  const [dueDate, setDueDate] = useState(card?.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
  const [assignedTo, setAssignedTo] = useState(card?.assignedTo || []);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);

  // Refs for click-outside detection
  const memberDropdownRef = useRef(null);
  const labelsDropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    // Always fetch workspace members
    if (workspaceId) {
      fetchWorkspaceMembers();
    }
    // Only fetch comments if card exists (editing mode)
    if (card?._id || card?.id) {
      fetchComments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, workspaceId]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close member dropdown if clicked outside
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setShowMemberDropdown(false);
      }
      // Close labels dropdown if clicked outside
      if (labelsDropdownRef.current && !labelsDropdownRef.current.contains(event.target)) {
        setShowLabelsDropdown(false);
      }
      // Close date picker if clicked outside
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    // Add event listener when any dropdown is open
    if (showMemberDropdown || showLabelsDropdown || showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMemberDropdown, showLabelsDropdown, showDatePicker]);

  const fetchComments = async () => {
    try {
      console.log('🔄 Fetching comments for card:', card._id || card.id);
      const response = await commentService.getCardComments(card._id || card.id);
      console.log('✅ Fetched comments response:', response);
      const commentsData = response.data || response || [];
      console.log('📊 Comments data:', commentsData);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const fetchWorkspaceMembers = async () => {
    try {
      console.log('Fetching workspace members for:', workspaceId);
      const response = await workspaceService.getWorkspaceMembers(workspaceId);
      console.log('Workspace members response:', response);
      const members = response.data;
      console.log('Extracted members:', members);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Failed to fetch workspace members:', error);
      setWorkspaceMembers([]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a card title.');
      return;
    }

    try {
      setLoading(true);
      const cardData = {
        title,
        description,
        labels: labels, // Include labels array
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignedTo
      };

      if (card?._id || card?.id) {
        // Update existing card
        console.log('🔄 Updating card via API:', card._id || card.id, cardData);
        const response = await cardService.updateCard(card._id || card.id, cardData);
        console.log('✅ Card updated successfully:', response);
        onUpdate(response.data || response);
      } else {
        // Create new card
        console.log('📝 Creating new card via API:', { ...cardData, stageId });
        const response = await cardService.createCard({ ...cardData, stageId });
        console.log('✅ Card created successfully:', response);
        onUpdate(response.data || response);
      }
      onClose();
    } catch (error) {
      console.error('❌ Failed to save card:', error);

      // Extract detailed error messages from validation errors
      let errorMessage = 'Failed to save card. Please try again.';

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        // If there are validation errors, format them
        if (errors && Array.isArray(errors) && errors.length > 0) {
          const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n');
          errorMessage = `${message || 'Validation failed'}\n\n${errorMessages}`;
        } else {
          // Otherwise use the general message
          errorMessage = message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await cardService.deleteCard(card._id || card.id);
      onDelete(card._id || card.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const handleSaveDescription = async () => {
    // Check if card exists (is saved)
    if (!card?._id && !card?.id) {
      alert('Please save the card first before updating the description.');
      return;
    }

    try {
      setSavingDescription(true);
      console.log('💾 Saving description for card:', card._id || card.id);

      const cardData = {
        description,
      };

      const response = await cardService.updateCard(card._id || card.id, cardData);
      console.log('✅ Description saved successfully:', response);

      // Update the card with the response
      onUpdate(response.data || response);

      // Exit edit mode
      setIsEditingDescription(false);
    } catch (error) {
      console.error('❌ Failed to save description:', error);

      // Extract detailed error messages from validation errors
      let errorMessage = 'Failed to save description. Please try again.';

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        // If there are validation errors, format them
        if (errors && Array.isArray(errors) && errors.length > 0) {
          const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n');
          errorMessage = `${message || 'Validation failed'}\n\n${errorMessages}`;
        } else {
          // Otherwise use the general message
          errorMessage = message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setSavingDescription(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Check if card exists (is saved)
    if (!card?._id && !card?.id) {
      alert('Please save the card first before adding comments.');
      return;
    }

    try {
      setSubmittingComment(true);
      console.log('💬 Adding comment to card:', card._id || card.id);
      const response = await commentService.createComment(card._id || card.id, newComment);
      console.log('✅ Comment added successfully:', response);

      // Handle different response structures
      const addedComment = response.data?.comment || response.comment || response.data || response;
      console.log('📝 Added comment:', addedComment);

      setComments([...comments, addedComment]);
      setNewComment('');
    } catch (error) {
      console.error('❌ Failed to add comment:', error);

      // Extract detailed error messages from validation errors
      let errorMessage = 'Failed to add comment. Please try again.';

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        // If there are validation errors, format them
        if (errors && Array.isArray(errors) && errors.length > 0) {
          const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n');
          errorMessage = `${message || 'Validation failed'}\n\n${errorMessages}`;
        } else {
          // Otherwise use the general message
          errorMessage = message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;

    try {
      console.log('✏️ Updating comment:', commentId);
      const response = await commentService.updateComment(commentId, editingCommentContent);
      console.log('✅ Comment updated successfully:', response);

      // Handle different response structures
      const updatedComment = response.data?.comment || response.comment || response.data || response;

      setComments(comments.map(c =>
        (c._id || c.id) === commentId ? updatedComment : c
      ));
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      console.error('❌ Failed to update comment:', error);

      // Extract detailed error messages from validation errors
      let errorMessage = 'Failed to update comment. Please try again.';

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        // If there are validation errors, format them
        if (errors && Array.isArray(errors) && errors.length > 0) {
          const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n');
          errorMessage = `${message || 'Validation failed'}\n\n${errorMessages}`;
        } else {
          // Otherwise use the general message
          errorMessage = message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      console.log('🗑️ Deleting comment:', commentId);
      await commentService.deleteComment(commentId);
      console.log('✅ Comment deleted successfully');
      setComments(comments.filter(c => (c._id || c.id) !== commentId));
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);

      // Extract detailed error messages from validation errors
      let errorMessage = 'Failed to delete comment. Please try again.';

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        // If there are validation errors, format them
        if (errors && Array.isArray(errors) && errors.length > 0) {
          const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('\n');
          errorMessage = `${message || 'Validation failed'}\n\n${errorMessages}`;
        } else {
          // Otherwise use the general message
          errorMessage = message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment._id || comment.id);
    setEditingCommentContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const toggleMember = (memberId) => {
    if (assignedTo.includes(memberId)) {
      setAssignedTo(assignedTo.filter(id => id !== memberId));
    } else {
      setAssignedTo([...assignedTo, memberId]);
    }
  };

  const getAssignedMembers = () => {
    console.log('Getting assigned members. assignedTo:', assignedTo);
    console.log('Workspace members:', workspaceMembers);

    return workspaceMembers.filter(m => {
      const memberId = m.user.id;
      const isAssigned = assignedTo.includes(memberId);
      console.log(`Member ${memberId} assigned:`, isAssigned);
      return isAssigned;
    });
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0', '#a8edea', '#fed6e3'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getDueDateStatus = () => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'overdue',
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        color: '#eb5a46'
      };
    } else if (diffDays === 0) {
      return {
        status: 'today',
        text: 'Due today',
        color: '#ff9f1a'
      };
    } else if (diffDays === 1) {
      return {
        status: 'tomorrow',
        text: 'Due tomorrow',
        color: '#f2d600'
      };
    } else if (diffDays <= 7) {
      return {
        status: 'soon',
        text: `${diffDays} days left`,
        color: '#61bd4f'
      };
    } else {
      return {
        status: 'future',
        text: `${diffDays} days left`,
        color: '#b3bac5'
      };
    }
  };

  // Helper function to toggle label selection
  const toggleLabel = (label) => {
    if (labels.includes(label)) {
      setLabels(labels.filter(l => l !== label));
    } else {
      setLabels([...labels, label]);
    }
  };

  // Available label options
  const availableLabels = [
    { name: 'Normal', color: '#61bd4f' },
    { name: 'Bug', color: '#f2d600' },
    { name: 'Feature', color: '#ff9f1a' },
    { name: 'High', color: '#eb5a46' },
    { name: 'Medium', color: '#c377e0' },
    { name: 'Low', color: '#0079bf' }
  ];

  // Filter labels based on search query
  const filteredLabels = availableLabels.filter(label =>
    label.name.toLowerCase().includes(labelSearchQuery.toLowerCase())
  );

  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-modal-header">
          <div className="card-modal-header-left">
            <input
              type="text"
              className="card-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title or paste a link"
            />
            <p className="card-stage-info">In <strong>{stageName}</strong> Stage</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="card-modal-body">
          <div className="card-modal-content">
            {/* Left Column - Card Details */}
            <div className="card-modal-left">
              {/* Action Buttons */}
              <div className="card-actions">
              <div className="action-btn-wrapper" ref={labelsDropdownRef}>
                <button className="action-btn" onClick={() => setShowLabelsDropdown(!showLabelsDropdown)}>
                  <Tag size={14} />
                  Labels
                </button>
                {showLabelsDropdown && (
                  <div className="labels-dropdown-panel">
                    <div className="dropdown-header">
                      <h3>Labels</h3>
                      <button className="dropdown-close" onClick={() => setShowLabelsDropdown(false)}>
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="label-search-input"
                      placeholder="Search labels..."
                      value={labelSearchQuery}
                      onChange={(e) => setLabelSearchQuery(e.target.value)}
                    />
                    <div className="labels-list-section">
                      <h4 className="labels-section-title">Labels</h4>
                      {filteredLabels.map(label => (
                        <div key={label.name} className="label-option-item">
                          <input
                            type="checkbox"
                            id={`label-${label.name}`}
                            checked={labels.includes(label.name)}
                            onChange={() => toggleLabel(label.name)}
                          />
                          <label
                            htmlFor={`label-${label.name}`}
                            className="label-color-box"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                          </label>
                          <button className="label-edit-icon">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="create-new-label-btn">Create a new label</button>
                  </div>
                )}
              </div>
              <div className="action-btn-wrapper" ref={memberDropdownRef}>
                <button className="action-btn" onClick={() => setShowMemberDropdown(!showMemberDropdown)}>
                  <Users size={16} />
                  Members
                  {assignedTo.length > 0 && <span className="badge-count">({assignedTo.length})</span>}
                </button>
                {showMemberDropdown && (
                  <div className="member-dropdown">
                  <div className="member-dropdown-header">
                    <h4>Workspace Members</h4>
                    {workspaceMembers.length > 0 && (
                      <div className="member-actions">
                        {assignedTo.length < workspaceMembers.length ? (
                          <button
                            className="member-action-btn"
                            onClick={() => setAssignedTo(workspaceMembers.map(m => m.user?.id || m.id))}
                          >
                            Select All
                          </button>
                        ) : (
                          <button
                            className="member-action-btn"
                            onClick={() => setAssignedTo([])}
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="member-list">
                    {workspaceMembers.length > 0 ? (
                      workspaceMembers.map(member => {
                        console.log('Rendering member:', member);

                        // Extract member ID
                        const memberId = member.user?.id || member.user?.id || member.user || member.id || member.id;

                        // Extract member name - try multiple paths
                        let memberName = 'Unknown User';
                        if (member.user?.name) {
                          memberName = member.user.name;
                        } else if (member.user.name) {
                          memberName = member.user.name;
                        } else if (member.user?.email) {
                          memberName = member.user.email.split('@')[0];
                        } else if (member.user.email) {
                          memberName = member.user.email.split('@')[0];
                        }

                        // Extract member email
                        const memberEmail = member.user?.email || member.email || '';
                        const isSelected = assignedTo.includes(memberId);

                        console.log('Member details:', { memberId, memberName, memberEmail, isSelected });

                        return (
                          <div
                            key={memberId}
                            className={`member-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleMember(memberId)}
                          >
                            <input
                              type="checkbox"
                              className="member-checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="member-avatar" style={{ background: getAvatarColor(memberName) }}>
                              {memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="member-info">
                              <span className="member-name">{memberName}</span>
                              {memberEmail && <span className="member-email">{memberEmail}</span>}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-members">
                        <p>No workspace members found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Horizontal Info Row - Members, Labels, Due Date */}
            <div className="card-info-row">
              {/* Members Section */}
              <div className="info-row-section">
                <h4 className="info-row-label">Members</h4>
                <div className="info-row-content">
                  <div className="assigned-members-inline">
                    {getAssignedMembers().map(member => {
                      // Extract member name - try multiple paths
                      console.log('Member in assigned members~~~~~~~~~~~~~~~~~~:', member);
                      let memberName = 'Unknown User';
                      if (member.user?.name) {
                        memberName = member.user.name;
                      } else if (member.user?.email) {
                        memberName = member.user.email.split('@')[0];
                      }

                      return (
                        <div key={member.user._id || member.user.id} className="assigned-member-avatar" title={memberName}>
                          <div className="member-avatar" style={{ background: getAvatarColor(memberName) }}>
                            {memberName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      );
                    })}
                    <button className="add-member-btn" onClick={() => setShowMemberDropdown(!showMemberDropdown)}>
                      <Users size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Labels Section */}
              <div className="info-row-section">
                <h4 className="info-row-label">Labels</h4>
                <div className="info-row-content">
                  <div className="labels-inline">
                    {labels.map(labelName => {
                      const labelObj = availableLabels.find(l => l.name === labelName);
                      return (
                        <button
                          key={labelName}
                          className="label-badge-inline"
                          style={{
                            backgroundColor: labelObj?.color || '#b3bac5',
                            color: '#ffffff'
                          }}
                          onClick={() => setShowLabelsDropdown(true)}
                        >
                          {labelName}
                        </button>
                      );
                    })}
                    <button className="add-label-btn" onClick={() => setShowLabelsDropdown(!showLabelsDropdown)}>
                      <Tag size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Due Date Section */}
              <div className="info-row-section">
                <h4 className="info-row-label">Due date</h4>
                <div className="info-row-content">
                  <div className="date-selector-inline" ref={datePickerRef}>
                    {dueDate ? (
                      <button
                        className={`date-badge-inline ${getDueDateStatus()?.status || ''}`}
                        style={{
                          backgroundColor: getDueDateStatus()?.color || '#b3bac5',
                          color: '#ffffff'
                        }}
                        onClick={() => setShowDatePicker(!showDatePicker)}
                      >
                        <span className="date-text-inline">{formatDueDate(dueDate)}</span>
                        <Calendar size={12} />
                      </button>
                    ) : (
                      <button
                        className="add-date-btn-inline"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                      >
                        <Calendar size={14} />
                      </button>
                    )}

                    {showDatePicker && (
                      <div className="date-picker-dropdown">
                        <input
                          type="date"
                          className="date-input"
                          value={dueDate}
                          onChange={(e) => {
                            setDueDate(e.target.value);
                            setShowDatePicker(false);
                          }}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

              {/* Description */}
              <div className="card-section">
                <h3 className="section-title">
                  Description
                  {description && !isEditingDescription && (
                    <button
                      className="label-edit-icon"
                      onClick={() => setIsEditingDescription(true)}
                      title="Edit description"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </h3>
                {isEditingDescription || !description ? (
                  <div className="description-edit-container">
                    <textarea
                      className="description-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description..."
                      rows={4}
                      autoFocus
                      disabled={savingDescription}
                    />
                    {description && (card?._id || card?.id) && (
                      <div className="description-actions">
                        <button
                          className="btn-save"
                          onClick={handleSaveDescription}
                          disabled={savingDescription || !description.trim()}
                        >
                          {savingDescription ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => {
                            setDescription(card?.description || '');
                            setIsEditingDescription(false);
                          }}
                          disabled={savingDescription}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {description && !card?._id && !card?.id && (
                      <p className="description-hint">💡 Save the card first to save the description</p>
                    )}
                  </div>
                ) : (
                  <div className="description-display">
                    <p className="description-text">{description}</p>
                  </div>
                )}
              </div>


            </div>

            {/* Right Column - Comments & Activity */}
            <div className="card-modal-right">
              <div className="card-section">
              <h3 className="section-title">
                <MessageSquare size={16} />
                Comments and activity
              </h3>

              {(card?._id || card?.id) ? (
                <>
                  <form onSubmit={handleAddComment} className="comment-form">
                    <textarea
                      className="comment-input"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      disabled={submittingComment}
                    />
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={!newComment.trim() || submittingComment}
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>

                  {comments.length > 0 ? (
                    <div className="comments-list">
                      {comments.map(comment => {
                        const commentId = comment._id || comment.id;
                        const isEditing = editingCommentId === commentId;
                        const commentUser = comment.userId || comment.user || comment.createdBy;
                        const commentUserId = commentUser?._id || commentUser?.id;
                        const currentUserId = user?._id || user?.id;
                        const isOwner = commentUserId === currentUserId;

                        // Get user name with fallbacks
                        const userName = commentUser?.name || commentUser?.email?.split('@')[0] || 'Unknown User';

                        return (
                          <div key={commentId} className="comment-item">
                            <div className="comment-header">
                              <div className="comment-author">
                                <div
                                  className="member-avatar"
                                  style={{ background: getAvatarColor(userName) }}
                                >
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="author-info">
                                  <span className="author-name">{userName}</span>
                                  <span className="comment-time">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              {isOwner && (
                                <div className="comment-actions">
                                  {!isEditing && (
                                    <>
                                      <button
                                        className="edit-comment-btn"
                                        onClick={() => startEditingComment(comment)}
                                        title="Edit comment"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        className="delete-comment-btn"
                                        onClick={() => handleDeleteComment(commentId)}
                                        title="Delete comment"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="comment-edit-form">
                                <textarea
                                  className="comment-input"
                                  value={editingCommentContent}
                                  onChange={(e) => setEditingCommentContent(e.target.value)}
                                  rows={2}
                                  autoFocus
                                />
                                <div className="comment-edit-actions">
                                  <button
                                    className="btn-save"
                                    onClick={() => handleUpdateComment(commentId)}
                                    disabled={!editingCommentContent.trim()}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn-cancel"
                                    onClick={cancelEditingComment}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="comment-text">{comment.content || comment.comment}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-comments">
                      <MessageSquare size={32} />
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="comments-disabled">
                  <p>💡 Save the card first to enable comments</p>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-modal-footer">
          <div className="footer-actions">
            <button className="btn-save" onClick={handleSave} disabled={loading || !title.trim()}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            {(card?._id || card?.id) && (
              <button className="btn-delete" onClick={handleDelete}>
                <Trash2 size={16} />
                Delete Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;

