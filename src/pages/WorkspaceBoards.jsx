import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Users, Settings, Plus, ArrowLeft, Star, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import boardService from '../services/boardService';
import workspaceService from '../services/workspaceService';
import CreateBoardModal from '../components/CreateBoardModal';
import WorkspaceMembersModal from '../components/WorkspaceMembersModal';
import NotificationModal from '../components/NotificationModal';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import '../styles/WorkspaceBoards.css';

const WorkspaceBoards = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [openBoardMenuId, setOpenBoardMenuId] = useState(null);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editingBoardName, setEditingBoardName] = useState('');

  const {
    notification,
    closeNotification,
    showError,
    showConfirm
  } = useNotification();

  useEffect(() => {
    console.log('WorkspaceBoards - workspaceId from params:', workspaceId);
    if (workspaceId && workspaceId !== 'undefined') {
      fetchWorkspaceAndBoards();
    } else {
      console.error('Invalid workspace ID:', workspaceId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const fetchWorkspaceAndBoards = async () => {
    try {
      setLoading(true);
      console.log('Fetching workspace and boards for ID:', workspaceId);
      const [workspaceData, boardsData] = await Promise.all([
        workspaceService.getWorkspaceById(workspaceId),
        boardService.getWorkspaceBoards(workspaceId)
      ]);
      console.log('Workspace data:', workspaceData);
      console.log('Boards data:', boardsData);
      setWorkspace(workspaceData.data);
      setBoards(boardsData.data || []);
    } catch (error) {
      console.error('Failed to fetch workspace and boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (boardData) => {
    console.log('Creating board with data:', boardData);
    const result = await boardService.createBoard(boardData);
    console.log('Board created:', result);
    await fetchWorkspaceAndBoards();
  };

  const handleBoardClick = (boardId) => {
    console.log('WorkspaceBoards - handleBoardClick:', { workspaceId, boardId });
    if (!workspaceId || !boardId) {
      console.error('Missing workspaceId or boardId:', { workspaceId, boardId });
      return;
    }
    console.log('Navigating to:', `/workspace/${workspaceId}/board/${boardId}`);
    navigate(`/workspace/${workspaceId}/board/${boardId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditBoard = (board, e) => {
    e.stopPropagation();
    setEditingBoardId(board._id || board.id);
    setEditingBoardName(board.name);
    setOpenBoardMenuId(null);
  };

  const handleUpdateBoardName = async (boardId, e) => {
    e.stopPropagation();
    if (!editingBoardName.trim() || editingBoardName === boards.find(b => (b._id || b.id) === boardId)?.name) {
      setEditingBoardId(null);
      return;
    }

    try {
      await boardService.updateBoard(boardId, { name: editingBoardName });
      setBoards(boards.map(b =>
        (b._id || b.id) === boardId ? { ...b, name: editingBoardName } : b
      ));
      setEditingBoardId(null);
    } catch (error) {
      console.error('Failed to update board name:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update board name. Please try again.';
      showError(errorMessage);
      setEditingBoardId(null);
    }
  };

  const handleDeleteBoard = (boardId, boardName, e) => {
    e.stopPropagation();
    showConfirm(
      `Are you sure you want to delete "${boardName}"? This action cannot be undone.`,
      async () => {
        try {
          await boardService.deleteBoard(boardId);
          setBoards(boards.filter(b => (b._id || b.id) !== boardId));
          setOpenBoardMenuId(null);
        } catch (error) {
          console.error('Failed to delete board:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete board. Please try again.';
          showError(errorMessage);
        }
      },
      'Delete Board',
      'Delete',
      'Cancel'
    );
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openBoardMenuId) {
        setOpenBoardMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openBoardMenuId]);

  if (loading) {
    return (
      <div className="workspace-boards-container">
        <div className="loading-container">
          <Loader2 size={48} className="spinner" />
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-boards-container">
      {/* Header */}
      <header className="workspace-header">
        <div className="workspace-header-content">
          <div className="workspace-info">
            <button className="back-button" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
            </button>
            <div className="workspace-avatar" style={{ background: workspace?.isPrivate ? '#667eea' : '#519839' }}>
              {workspace?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="workspace-name">
                {workspace?.name}
                {workspace?.isPrivate && <Lock size={16} className="privacy-icon" />}
              </h1>
              {workspace?.description && (
                <p className="workspace-description">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="workspace-actions">
            <button className="btn btn-secondary" onClick={() => setShowMembersModal(true)}>
              <Users size={16} />
              Members
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Boards Section */}
      <div className="boards-section">
        <div className="section-header">
          <div className="section-title">
            <Users size={20} />
            <h2>Your boards</h2>
          </div>
        </div>

        <div className="boards-grid">
          {boards.map((board) => {
            const boardId = board._id || board.id;
            console.log('WorkspaceBoards - Rendering board:', { boardId, board });
            return (
              <div
                key={boardId}
                className="board-card"
                onClick={() => handleBoardClick(boardId)}
              >
                <div className="board-preview" style={{ background: board.backgroundColor || '#0079BF' }}>
                  <div className="board-overlay"></div>

                  {/* Board Settings Button */}
                  <div className="board-card-settings">
                    <button
                      className="board-settings-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenBoardMenuId(openBoardMenuId === boardId ? null : boardId);
                      }}
                      title="Board settings"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openBoardMenuId === boardId && (
                      <div className="board-settings-menu">
                        <button
                          className="board-menu-item"
                          onClick={(e) => handleEditBoard(board, e)}
                        >
                          <Edit2 size={14} />
                          <span>Rename</span>
                        </button>
                        <button
                          className="board-menu-item delete"
                          onClick={(e) => handleDeleteBoard(boardId, board.name, e)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {board.isFavorite && (
                    <div className="board-favorite">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    </div>
                  )}

                  <div className="board-info">
                    {editingBoardId === boardId ? (
                      <input
                        type="text"
                        className="board-name-input"
                        value={editingBoardName}
                        onChange={(e) => setEditingBoardName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateBoardName(boardId, e);
                          } else if (e.key === 'Escape') {
                            e.stopPropagation();
                            setEditingBoardId(null);
                          }
                        }}
                        onBlur={(e) => handleUpdateBoardName(boardId, e)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <h3 className="board-name">{board.name}</h3>
                    )}
                    {board.description && !editingBoardId && (
                      <p className="board-description">{board.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create New Board Card */}
          <div className="board-card create-board-card" onClick={() => setIsCreateModalOpen(true)}>
            <div className="create-board-content">
              <Plus size={32} />
              <span>Create new board</span>
            </div>
          </div>
        </div>

        {/* View Closed Boards */}
        {boards.some(b => b.isArchived) && (
          <button className="view-closed-boards">
            View closed boards
          </button>
        )}
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBoard={handleCreateBoard}
        workspaceId={workspaceId}
      />

      {/* Members Modal */}
      <WorkspaceMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        workspace={workspace}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        onConfirm={notification.onConfirm}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        showCancel={notification.showCancel}
      />
    </div>
  );
};

export default WorkspaceBoards;

