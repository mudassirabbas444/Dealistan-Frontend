import apiService from './api';
import { API_ENDPOINTS } from '../constants';

class MessageService {
  // Send message
  async sendMessage(messageData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.MESSAGES.SEND,
        messageData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get messages between current user and another user
  async getMessagesBetweenUsers(otherUserId, params = {}) {
    try {
      const queryString = this.buildQueryString({ userId: otherUserId, ...params });
      const response = await apiService.get(
        `${API_ENDPOINTS.MESSAGES.GET_BETWEEN_USERS}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get messages by product
  async getMessagesByProduct(productId, params = {}) {
    try {
      const queryString = this.buildQueryString({ productId, ...params });
      const response = await apiService.get(
        `${API_ENDPOINTS.MESSAGES.GET_BY_PRODUCT}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.MESSAGES.DELETE}?id=${messageId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(messageIds) {
    try {
      const response = await apiService.patch(
        API_ENDPOINTS.MESSAGES.MARK_AS_READ,
        { messageIds }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.MESSAGES.GET_UNREAD_COUNT
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user conversations
  async getConversations(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const endpoint = queryString
        ? `${API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS}?${queryString}`
        : API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS;

      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get conversation by ID
  async getConversation(conversationId, params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiService.get(
        `/messages/conversations/${conversationId}?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Start new conversation
  async startConversation(
    participantId,
    productId = null,
    initialMessage = null
  ) {
    try {
      const conversationData = {
        participantId,
        productId,
        initialMessage,
      };

      const response = await apiService.post(
        '/messages/conversations',
        conversationData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get conversation participants
  async getConversationParticipants(conversationId) {
    try {
      const response = await apiService.get(
        `/messages/conversations/${conversationId}/participants`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Add participant to conversation
  async addParticipant(conversationId, participantId) {
    try {
      const response = await apiService.post(
        `/messages/conversations/${conversationId}/participants`,
        {
          participantId,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove participant from conversation
  async removeParticipant(conversationId, participantId) {
    try {
      const response = await apiService.delete(
        `/messages/conversations/${conversationId}/participants/${participantId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Archive conversation
  async archiveConversation(conversationId) {
    try {
      const response = await apiService.patch(
        `/messages/conversations/${conversationId}/archive`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId) {
    try {
      const response = await apiService.patch(
        `/messages/conversations/${conversationId}/unarchive`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mute conversation
  async muteConversation(conversationId) {
    try {
      const response = await apiService.patch(
        `/messages/conversations/${conversationId}/mute`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Unmute conversation
  async unmuteConversation(conversationId) {
    try {
      const response = await apiService.patch(
        `/messages/conversations/${conversationId}/unmute`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      const response = await apiService.delete(
        `/messages/conversations/${conversationId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Search messages
  async searchMessages(searchTerm, params = {}) {
    try {
      const queryString = this.buildQueryString({
        search: searchTerm,
        ...params,
      });
      const response = await apiService.get(`/messages/search?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get message by ID
  async getMessage(messageId) {
    try {
      const response = await apiService.get(`/messages/${messageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Edit message
  async editMessage(messageId, newContent) {
    try {
      const response = await apiService.put(`/messages/${messageId}`, {
        content: newContent,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // React to message
  async reactToMessage(messageId, reaction) {
    try {
      const response = await apiService.post(`/messages/${messageId}/react`, {
        reaction,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove reaction from message
  async removeReaction(messageId, reaction) {
    try {
      const response = await apiService.delete(
        `/messages/${messageId}/react/${reaction}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Forward message
  async forwardMessage(messageId, recipientId) {
    try {
      const response = await apiService.post(`/messages/${messageId}/forward`, {
        recipientId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get message statistics
  async getMessageStats() {
    try {
      const response = await apiService.get('/messages/stats');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get conversation statistics
  async getConversationStats(conversationId) {
    try {
      const response = await apiService.get(
        `/messages/conversations/${conversationId}/stats`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload attachment
  async uploadAttachment(messageId, file) {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await apiService.upload(
        `/messages/${messageId}/attachments`,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete attachment
  async deleteAttachment(messageId, attachmentId) {
    try {
      const response = await apiService.delete(
        `/messages/${messageId}/attachments/${attachmentId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to build query string
  buildQueryString(params) {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item));
        } else {
          searchParams.append(key, value);
        }
      }
    });

    return searchParams.toString();
  }
}

// Create and export message service instance
const messageService = new MessageService();
export default messageService;
