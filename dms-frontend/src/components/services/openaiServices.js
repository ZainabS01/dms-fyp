import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

// Helper to attach authorization headers with tokens
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token, // Support for student header dashboard standard
      'Authorization': `Bearer ${token}` // Support for standard verifyToken middleware splits
    }
  };
};

export const openaiServices = {
  // Get all conversations
  getConversations: async () => {
    try {
      const response = await axios.get(`${API_URL}/conversations`, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  // Start a new conversation
  startConversation: async (text, image = null) => {
    try {
      const response = await axios.post(`${API_URL}/conversations`, { text, image }, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw error;
    }
  },

  // Send message in existing conversation
  sendMessage: async (conversationId, text, image = null) => {
    try {
      const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, { text, image }, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await axios.delete(`${API_URL}/conversations/${conversationId}`, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },

  // Edit message in existing conversation
  editMessage: async (conversationId, messageId, text) => {
    try {
      const response = await axios.put(`${API_URL}/conversations/${conversationId}/messages/${messageId}`, { text }, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  }
};
