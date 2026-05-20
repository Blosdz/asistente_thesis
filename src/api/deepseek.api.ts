import { apiRequest } from './client';

export const deepseekApi = {
  async sendMessage(
    tesisId: string,
    payload: {
      message: string;
      documentId?: string;
      conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
      }>;
    },
  ) {
    return apiRequest(`/documentos/tesis/${tesisId}/chat`, {
      method: 'POST',
      body: payload,
    });
  },

  async getHistory(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}/chat/history`);
  },

  async getStatus(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}/chat/status`);
  },
};
