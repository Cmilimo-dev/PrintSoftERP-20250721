import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

const useMailbox = () => {
  const [messages, setMessages] = useState({
    inbox: [],
    sent: [],
    drafts: [],
    starred: []
  });
  const [stats, setStats] = useState({
    unread: 0,
    total_received: 0,
    total_sent: 0,
    drafts: 0,
    starred: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  // Common fetch function with auth
  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Get messages for a specific folder
  const getMessages = useCallback(async (folder, page = 1, limit = 20, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/rest/v1/mailbox/${folder}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setMessages(prev => ({ ...prev, [folder]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single message
  const getMessage = useCallback(async (messageId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/rest/v1/mailbox/messages/${messageId}`);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (messageData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/rest/v1/mailbox/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save draft
  const saveDraft = useCallback(async (messageData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/rest/v1/mailbox/messages', {
        method: 'POST',
        body: JSON.stringify({ ...messageData, isDraft: true })
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update message/draft
  const updateMessage = useCallback(async (messageId, messageData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/rest/v1/mailbox/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify(messageData)
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/rest/v1/mailbox/messages/${messageId}`, {
        method: 'DELETE'
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle star status
  const toggleStar = useCallback(async (messageId, starred) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/rest/v1/mailbox/messages/${messageId}/star`, {
        method: 'PATCH',
        body: JSON.stringify({ starred })
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get users for recipient selection
  const getUsers = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/rest/v1/mailbox/users?search=${encodeURIComponent(search)}`);
      setUsers(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get mailbox statistics
  const getStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/rest/v1/mailbox/stats');
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        getMessages('inbox'),
        getMessages('sent'),
        getMessages('drafts'),
        getMessages('starred'),
        getStats()
      ]);
    } catch (err) {
      console.error('Error refreshing mailbox data:', err);
    }
  }, [getMessages, getStats]);

  // Load initial data on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // State
    messages,
    stats,
    users,
    loading,
    error,
    
    // Actions
    getMessages,
    getMessage,
    sendMessage,
    saveDraft,
    updateMessage,
    deleteMessage,
    toggleStar,
    getUsers,
    getStats,
    refreshAll,
    
    // Helper functions
    setError,
    clearError: () => setError(null)
  };
};

export default useMailbox;
