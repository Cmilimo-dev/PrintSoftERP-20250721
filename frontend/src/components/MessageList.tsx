import React from 'react';
import { 
  Star, 
  Trash2, 
  Mail, 
  MailOpen,
  Clock,
  AlertCircle,
  User,
  Paperclip
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Message {
  id: string;
  subject: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  is_starred: boolean;
  sent_at: string;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_email?: string;
  recipients?: string;
  recipient_read?: boolean;
  recipient_starred?: boolean;
}

interface MessageListProps {
  messages: Message[];
  folder: 'inbox' | 'sent' | 'drafts' | 'starred';
  loading: boolean;
  onMessageSelect: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onToggleStar: (messageId: string, starred: boolean) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  folder,
  loading,
  onMessageSelect,
  onDelete,
  onToggleStar
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-gray-500 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'low':
        return 'Low';
      default:
        return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getSenderName = (message: Message) => {
    if (folder === 'sent') {
      return message.recipients || 'Multiple Recipients';
    }
    if (message.sender_first_name || message.sender_last_name) {
      return `${message.sender_first_name || ''} ${message.sender_last_name || ''}`.trim();
    }
    return message.sender_email || 'Unknown Sender';
  };

  const isUnread = (message: Message) => {
    if (folder === 'inbox') {
      return message.recipient_read === false || message.recipient_read === 0;
    }
    return false; // Sent, drafts, and starred don't have unread state in the same way
  };

  const isStarred = (message: Message) => {
    if (folder === 'sent') {
      return message.is_starred;
    }
    return message.recipient_starred || message.is_starred;
  };

  const handleStarToggle = (e: React.MouseEvent, message: Message) => {
    e.stopPropagation();
    const currentStarred = isStarred(message);
    onToggleStar(message.id, !currentStarred);
  };

  const handleDelete = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(messageId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Mail className="h-12 w-12 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No messages</h3>
        <p className="text-center">
          {folder === 'inbox' && "You don't have any messages in your inbox."}
          {folder === 'sent' && "You haven't sent any messages yet."}
          {folder === 'drafts' && "You don't have any draft messages."}
          {folder === 'starred' && "You haven't starred any messages yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-gray-100">
        {messages.map((message) => {
          const unread = isUnread(message);
          const starred = isStarred(message);
          
          return (
            <div
              key={message.id}
              onClick={() => onMessageSelect(message.id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                unread ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Star Button */}
                <button
                  onClick={(e) => handleStarToggle(e, message)}
                  className={`mt-1 p-1 rounded hover:bg-gray-200 transition-colors ${
                    starred ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  <Star className={`h-4 w-4 ${starred ? 'fill-current' : ''}`} />
                </button>

                {/* Message Icon */}
                <div className="mt-1">
                  {unread ? (
                    <Mail className="h-4 w-4 text-blue-600" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {getSenderName(message)}
                      </span>
                      {message.priority !== 'normal' && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(message.priority)}`}>
                          {getPriorityLabel(message.priority)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDate(message.sent_at || message.created_at)}
                    </span>
                  </div>

                  <div className="mb-1">
                    <h4 className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                      {message.subject || '(No Subject)'}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {message.body?.replace(/<[^>]*>/g, '').substring(0, 100)}
                      {message.body && message.body.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDelete(e, message.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;
