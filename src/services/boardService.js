import api from './api';

const boardService = {
  // Get all boards for a workspace
  getWorkspaceBoards: async (workspaceId) => {
    const response = await api.get(`/boards/workspace/${workspaceId}`);
    return response.data;
  },

  // Get board by ID
  getBoardById: async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  // Create new board
  createBoard: async (boardData) => {
    const response = await api.post('/boards', boardData);
    return response.data;
  },

  // Update board
  updateBoard: async (id, boardData) => {
    const response = await api.put(`/boards/${id}`, boardData);
    return response.data;
  },

  // Delete board
  deleteBoard: async (id) => {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  },

  // Archive board
  archiveBoard: async (id) => {
    const response = await api.post(`/boards/${id}/archive`);
    return response.data;
  },

  // Unarchive board
  unarchiveBoard: async (id) => {
    const response = await api.post(`/boards/${id}/unarchive`);
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.post(`/boards/${id}/favorite`);
    return response.data;
  },

  // Get favorite boards
  getFavoriteBoards: async () => {
    const response = await api.get('/boards/favorites');
    return response.data;
  }
};

export default boardService;

