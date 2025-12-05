import api from './api';

const cardService = {
  // Get all cards for a stage
  getStageCards: async (stageId) => {
    console.log(`🌐 API Call: GET /api/v1/cards/stage/${stageId}`);
    try {
      const response = await api.get(`/cards/stage/${stageId}`);
      console.log('📥 Stage cards fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch stage cards:', error);
      throw error;
    }
  },

  // Get all cards for a board
  getBoardCards: async (boardId) => {
    console.log(`🌐 API Call: GET /api/v1/cards/board/${boardId}`);
    try {
      const response = await api.get(`/cards/board/${boardId}`);
      console.log('📥 Board cards fetched:', response.data);
      console.log(`📊 Total cards: ${response.data?.data?.length || response.data?.length || 0}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch board cards:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Get card by ID
  getCardById: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Create new card
  createCard: async (cardData) => {
    console.log('🌐 API Call: POST /api/v1/cards');
    console.log('📤 Request payload:', cardData);

    try {
      const response = await api.post('/cards', cardData);
      console.log('📥 Full API Response:', response);
      console.log('📥 Response data:', response.data);
      console.log('📥 Response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in cardService.createCard:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  // Update card
  updateCard: async (id, cardData) => {
    console.log(`🌐 API Call: PUT /api/v1/cards/${id}`, cardData);
    const response = await api.put(`/cards/${id}`, cardData);
    console.log('📥 API Response:', response.data);
    return response.data;
  },

  // Delete card
  deleteCard: async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },

  // Move card to different stage
  moveCard: async (id, targetStageId, targetPosition) => {
    const payload = { targetStageId, targetPosition };
    console.log(`🌐 API Call: POST /api/v1/cards/${id}/move`, payload);
    const response = await api.post(`/cards/${id}/move`, payload);
    console.log('📥 API Response:', response.data);
    return response.data;
  },

  // Add comment to card
  addComment: async (cardId, comment) => {
    const response = await api.post(`/cards/${cardId}/comments`, { comment });
    return response.data;
  },

  // Get card comments
  getCardComments: async (cardId) => {
    const response = await api.get(`/cards/${cardId}/comments`);
    return response.data;
  },

  // Delete comment
  deleteComment: async (cardId, commentId) => {
    const response = await api.delete(`/cards/${cardId}/comments/${commentId}`);
    return response.data;
  }
};

export default cardService;

