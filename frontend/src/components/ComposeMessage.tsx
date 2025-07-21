import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Save, 
  Users, 
  AlertTriangle,
  Check,
  Search,
  User,
  Plus
} from 'lucide-react';
import useMailbox from '../hooks/useMailbox';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ComposeMessageProps {
  onClose: () => void;
  onSent: () => void;
  replyTo?: any;
  draft?: any;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({ 
  onClose, 
  onSent, 
  replyTo,
  draft 
}) => {
  const {
    users,
    loading,
    error,
    sendMessage,
    saveDraft,
    updateMessage,
    getUsers,
    clearError
  } = useMailbox();

  const [formData, setFormData] = useState({
    recipients: [] as string[],
    subject: '',
    body: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const userSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize form data
  useEffect(() => {
    if (replyTo) {
      setFormData(prev => ({
        ...prev,
        subject: replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`,
        body: `\n\n--- Original Message ---\nFrom: ${replyTo.sender_first_name} ${replyTo.sender_last_name} <${replyTo.sender_email}>\nSubject: ${replyTo.subject}\n\n${replyTo.body}`
      }));
      // Add original sender to recipients
      const originalSender = {
        id: replyTo.sender_id,
        first_name: replyTo.sender_first_name,
        last_name: replyTo.sender_last_name,
        email: replyTo.sender_email
      };
      setSelectedUsers([originalSender]);
      setFormData(prev => ({ ...prev, recipients: [replyTo.sender_id] }));
    }

    if (draft) {
      setFormData({
        recipients: draft.recipients || [],
        subject: draft.subject || '',
        body: draft.body || '',
        priority: draft.priority || 'normal'
      });
    }
  }, [replyTo, draft]);

  // Load users on mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Handle user search
  useEffect(() => {
    if (userSearch.length > 0) {
      getUsers(userSearch);
    }
  }, [userSearch, getUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      setFormData(prev => ({ 
        ...prev, 
        recipients: newSelectedUsers.map(u => u.id) 
      }));
    }
    setUserSearch('');
    setShowUserDropdown(false);
  };

  const handleUserRemove = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    setFormData(prev => ({ 
      ...prev, 
      recipients: newSelectedUsers.map(u => u.id) 
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (formData.recipients.length === 0) {
      errors.push('Please select at least one recipient');
    }
    
    if (!formData.subject.trim()) {
      errors.push('Please enter a subject');
    }
    
    if (!formData.body.trim()) {
      errors.push('Please enter a message');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      if (draft) {
        await updateMessage(draft.id, { ...formData, isDraft: false });
      } else {
        await sendMessage({ ...formData, isDraft: false });
      }
      onSent();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.subject.trim() && !formData.body.trim()) {
      return;
    }

    setIsSavingDraft(true);
    try {
      if (draft) {
        await updateMessage(draft.id, { ...formData, isDraft: true });
      } else {
        await saveDraft(formData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const filteredUsers = users.filter(user => 
    !selectedUsers.find(selected => selected.id === user.id) &&
    (user.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
     user.last_name.toLowerCase().includes(userSearch.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          {draft ? 'Edit Draft' : replyTo ? 'Reply' : 'Compose Message'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Error Display */}
      {(error || validationErrors.length > 0) && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-red-700 font-medium">Please fix the following issues:</span>
          </div>
          <ul className="mt-2 text-sm text-red-600">
            {error && <li>• {error}</li>}
            {validationErrors.map((err, index) => (
              <li key={index}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To:
          </label>
          <div className="relative" ref={dropdownRef}>
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map(user => (
                  <span
                    key={user.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    <User className="mr-1 h-3 w-3" />
                    {user.first_name} {user.last_name}
                    <button
                      onClick={() => handleUserRemove(user.id)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* User Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={userSearchRef}
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onFocus={() => setShowUserDropdown(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                    >
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center">
                    {userSearch ? 'No users found' : 'Start typing to search users'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subject and Priority */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject:
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Enter subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority:
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Message Body */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message:
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <button
          onClick={handleSaveDraft}
          disabled={isSavingDraft || loading}
          className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSavingDraft ? 'Saving...' : 'Save Draft'}
        </button>

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessage;
