import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Settings, Loader2, LogOut, LayoutDashboard } from 'lucide-react';
import workspaceService from '../services/workspaceService';
import boardService from '../services/boardService';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import CreateBoardModal from '../components/CreateBoardModal';
import WorkspaceMembersModal from '../components/WorkspaceMembersModal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceBoards, setWorkspaceBoards] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await workspaceService.getUserWorkspaces();
      console.log('Workspace API Response:', data);
      console.log('Workspaces array:', data.data);
      const workspacesData = data.data || [];
      setWorkspaces(workspacesData);

      // Fetch recent boards for each workspace
      await fetchBoardsForWorkspaces(workspacesData);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardsForWorkspaces = async (workspacesData) => {
    const boardsMap = {};

    // Fetch boards for each workspace in parallel
    await Promise.all(
      workspacesData.map(async (workspace) => {
        try {
          const workspaceId = workspace._id || workspace.id;
          const response = await boardService.getWorkspaceBoards(workspaceId);
          console.log(`Boards for workspace ${workspaceId}:`, response);

          // Get the most recent 3 boards
          const boards = response.data || [];
          boardsMap[workspaceId] = boards.slice(0, 3);
        } catch (error) {
          console.error(`Failed to fetch boards for workspace ${workspace._id || workspace.id}:`, error);
          boardsMap[workspace._id || workspace.id] = [];
        }
      })
    );

    setWorkspaceBoards(boardsMap);
  };

  const handleCreateWorkspace = async (workspaceData) => {
    await workspaceService.createWorkspace(workspaceData);
    await fetchWorkspaces();
  };

  const handleCreateBoard = async (boardData) => {
    try {
      await boardService.createBoard(boardData);
      // Refresh boards for the selected workspace
      const workspaceId = selectedWorkspace._id || selectedWorkspace.id;
      const response = await boardService.getWorkspaceBoards(workspaceId);
      const boards = response.data || [];
      setWorkspaceBoards(prev => ({
        ...prev,
        [workspaceId]: boards.slice(0, 3)
      }));
      setShowCreateBoardModal(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleBoardClick = (workspaceId, boardId) => {
    console.log('handleBoardClick called with:', { workspaceId, boardId });
    if (!workspaceId || !boardId) {
      console.error('Missing workspaceId or boardId:', { workspaceId, boardId });
      return;
    }
    console.log('Navigating to:', `/workspace/${workspaceId}/board/${boardId}`);
    navigate(`/workspace/${workspaceId}/board/${boardId}`);
  };

  const handleWorkspaceClick = (workspaceId) => {
    console.log('Navigating to workspace:', workspaceId);
    if (!workspaceId) {
      console.error('Workspace ID is undefined!');
      return;
    }
    navigate(`/workspace/${workspaceId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate random gradient for workspace cards
  const getWorkspaceGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Flow</h1>
          <div className="user-section">
            <button
              className="btn btn-create-workspace"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Create Workspace
            </button>
            <div className="user-info">
              <span>{user?.name || user?.email}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="workspaces-section">
          <h2 className="section-title">YOUR WORKSPACES</h2>

          {loading ? (
            <div className="loading-container">
              <Loader2 size={40} className="spinner" />
              <p>Loading workspaces...</p>
            </div>
          ) : (
            <div className="workspaces-list">
              {workspaces.map((workspace, index) => {
                const workspaceId = workspace._id || workspace.id;
                const boards = workspaceBoards[workspaceId] || [];

                return (
                  <div key={workspaceId} className="workspace-section">
                    <div className="workspace-header">
                      <div className="workspace-title-section">
                        <div
                          className="workspace-avatar"
                          style={{ background: getWorkspaceGradient(index) }}
                        >
                          {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="workspace-title">{workspace.name}</h3>
                      </div>
                      <div className="workspace-header-actions">
                        <button
                          className="workspace-header-btn"
                          onClick={() => handleWorkspaceClick(workspaceId)}
                        >
                          <LayoutDashboard size={16} />
                          <span>Boards</span>
                        </button>
                        <button
                          className="workspace-header-btn"
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setShowMembersModal(true);
                          }}
                        >
                          <Users size={16} />
                          <span>Members</span>
                        </button>
                        <button className="workspace-header-btn">
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                      </div>
                    </div>

                    <div className="workspace-boards-grid">
                      {boards.map((board) => {
                        const boardId = board._id || board.id;
                        console.log('Rendering board:', { boardId, workspaceId, board });
                        return (
                          <div
                            key={boardId}
                            className="board-card-mini"
                            style={{ backgroundColor: board.backgroundColor || '#0079BF' }}
                            onClick={() => handleBoardClick(workspaceId, boardId)}
                          >
                            <div className="board-card-overlay"></div>
                            <h4 className="board-card-title">{board.name}</h4>
                          </div>
                        );
                      })}

                      <div
                        className="board-card-mini create-board-card"
                        onClick={() => {
                          setSelectedWorkspace(workspace);
                          setShowCreateBoardModal(true);
                        }}
                      >
                        <div className="create-board-content">
                          <span>Create new board</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />

      <CreateBoardModal
        isOpen={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        onCreateBoard={handleCreateBoard}
        workspaceId={selectedWorkspace?._id || selectedWorkspace?.id}
      />

      <WorkspaceMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        workspace={selectedWorkspace}
      />
    </div>
  );
};

export default Dashboard;

