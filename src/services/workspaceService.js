import api from './api';

const workspaceService = {
  // Get all user workspaces
  getUserWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  // Get workspace by ID
  getWorkspaceById: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  // Create new workspace
  createWorkspace: async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },

  // Update workspace
  updateWorkspace: async (id, workspaceData) => {
    const response = await api.put(`/workspaces/${id}`, workspaceData);
    return response.data;
  },

  // Delete workspace
  deleteWorkspace: async (id) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  },

  // Get workspace members
  getWorkspaceMembers: async (id) => {
    const response = await api.get(`/workspaces/${id}/members`);
    return response.data;
  },

  // Generate invite link
  generateInviteLink: async (id, expiryDays = 7) => {
    const response = await api.post(`/workspaces/${id}/invite`, { expiryDays });
    return response.data;
  },

  // Join workspace via invite
  joinWorkspace: async (inviteCode) => {
    const response = await api.post(`/workspaces/join/${inviteCode}`);
    return response.data;
  },

  // Remove member from workspace
  removeMember: async (workspaceId, memberId) => {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    return response.data;
  },

  // Update member role
  updateMemberRole: async (workspaceId, memberId, role) => {
    console.log('updateMemberRole called with:', { workspaceId, memberId, role });
    const response = await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role });
    return response.data;
  },

  // Get workspace boards
  getWorkspaceBoards: async (workspaceId) => {
    const response = await api.get(`/boards/workspace/${workspaceId}`);
    return response.data;
  }
};

export default workspaceService;

