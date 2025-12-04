import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Users, Settings, Plus, ArrowLeft, Star } from 'lucide-react';
import boardService from '../services/boardService';
import workspaceService from '../services/workspaceService';
import CreateBoardModal from '../components/CreateBoardModal';
import WorkspaceMembersModal from '../components/WorkspaceMembersModal';
import { useAuth } from '../hooks/useAuth';
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
    navigate(`/board/${boardId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
          <button className="btn btn-secondary">
            <Settings size={16} />
            Settings
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
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
          {boards.map((board) => (
            <div
              key={board._id}
              className="board-card"
              onClick={() => handleBoardClick(board._id)}
            >
              <div className="board-preview" style={{ background: board.backgroundColor || '#0079BF' }}>
                <div className="board-overlay"></div>
                {board.isFavorite && (
                  <div className="board-favorite">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  </div>
                )}
                <div className="board-info">
                  <h3 className="board-name">{board.name}</h3>
                  {board.description && (
                    <p className="board-description">{board.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

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
    </div>
  );
};

export default WorkspaceBoards;

