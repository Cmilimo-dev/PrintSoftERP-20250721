import { apiClient } from '@/config/api';

export interface Message {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  priority: string;
  is_draft: boolean;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  reply_to_id: string | null;
  thread_id: string | null;
  attachments: string | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
  sender_name: string;
  sender_email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SendMessageRequest {
  to: string;
  subject: string;
  body: string;
}

class MailboxService {
  async getInboxMessages(): Promise<Message[]> {
    try {
      const response = await apiClient.get('/api/mailbox/inbox');
      return response;
    } catch (error) {
      console.error('Error fetching inbox messages:', error);
      throw error;
    }
  }

  async getSentMessages(): Promise<Message[]> {
    try {
      const response = await apiClient.get('/api/mailbox/sent');
      return response;
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      throw error;
    }
  }

  async sendMessage(messageData: SendMessageRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/mailbox/send', messageData);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/api/mailbox/users');
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Helper method to format timestamp for display
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Helper method to get message preview
  getMessagePreview(body: string, maxLength: number = 80): string {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '...';
  }
}

export const mailboxService = new MailboxService();
