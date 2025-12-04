import api from './api';

const listService = {
  // Get all lists for a board
  getBoardLists: async (boardId) => {
    const response = await api.get(`/stages/board/${boardId}`);
    return response.data;
  },

  // Get list by ID
  getListById: async (id) => {
    const response = await api.get(`/stages/${id}`);
    return response.data;
  },

  // Create new list
  createList: async (listData) => {
    const response = await api.post('/stages', listData);
    return response.data;
  },

  // Update list
  updateList: async (id, listData) => {
    const response = await api.put(`/stages/${id}`, listData);
    return response.data;
  },

  // Delete list
  deleteList: async (id) => {
    const response = await api.delete(`/stages/${id}`);
    return response.data;
  },

  // Reorder stages/lists
  reorderStages: async (boardId, stageOrders) => {
    const response = await api.post(`/stages/board/${boardId}/reorder`, { stageOrders });
    return response.data;
  },

  // Archive list
  archiveList: async (id) => {
    const response = await api.post(`/stages/${id}/archive`);
    return response.data;
  }
};

export default listService;

