import api from './api';

const commentService = {
  // Create a new comment on a card
  createComment: async (cardId, content) => {
    console.log('🌐 API Call: POST /api/v1/comments');
    console.log('📤 Request payload:', { cardId, content });
    
    try {
      const response = await api.post('/comments', {
        cardId,
        content
      });
      console.log('✅ Comment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create comment:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Get all comments for a specific card
  getCardComments: async (cardId) => {
    console.log(`🌐 API Call: GET /api/v1/comments/card/${cardId}`);
    
    try {
      const response = await api.get(`/comments/card/${cardId}`);
      console.log('✅ Comments fetched:', response.data);
      console.log(`📊 Total comments: ${response.data?.data?.length || response.data?.length || 0}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Update a comment (only by creator)
  updateComment: async (commentId, content) => {
    console.log(`🌐 API Call: PUT /api/v1/comments/${commentId}`);
    console.log('📤 Request payload:', { content });
    
    try {
      const response = await api.put(`/comments/${commentId}`, {
        content
      });
      console.log('✅ Comment updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update comment:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete a comment (only by creator)
  deleteComment: async (commentId) => {
    console.log(`🌐 API Call: DELETE /api/v1/comments/${commentId}`);
    
    try {
      const response = await api.delete(`/comments/${commentId}`);
      console.log('✅ Comment deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  }
};

export default commentService;

