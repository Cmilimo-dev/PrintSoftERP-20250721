import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Edit3, 
  Star, 
  Trash2, 
  Search, 
  Plus,
  Inbox,
  Archive,
  Users,
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import useMailbox from '../hooks/useMailbox';
import ComposeMessage from './ComposeMessage';
import MessageView from './MessageView';
import MessageList from './MessageList';

interface MailboxProps {
  className?: string;
}

const Mailbox: React.FC<MailboxProps> = ({ className = '' }) => {
  const {
    messages,
    stats,
    loading,
    error,
    getMessages,
    getMessage,
    deleteMessage,
    toggleStar,
    refreshAll,
    clearError
  } = useMailbox();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'starred'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'compose' | 'view'>('list');

  const folders = [
    { 
      id: 'inbox' as const, 
      label: 'Inbox', 
      icon: Inbox, 
      count: stats.unread,
      total: stats.total_received 
    },
    { 
      id: 'sent' as const, 
      label: 'Sent', 
      icon: Send, 
      count: 0,
      total: stats.total_sent 
    },
    { 
      id: 'drafts' as const, 
      label: 'Drafts', 
      icon: Edit3, 
      count: stats.drafts,
      total: stats.drafts 
    },
    { 
      id: 'starred' as const, 
      label: 'Starred', 
      icon: Star, 
      count: stats.starred,
      total: stats.starred 
    },
  ];

  // Handle folder change
  const handleFolderChange = async (folderId: typeof activeFolder) => {
    setActiveFolder(folderId);
    setViewMode('list');
    setSelectedMessage(null);
    await getMessages(folderId, 1, 20, searchTerm);
  };

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    await getMessages(activeFolder, 1, 20, term);
  };

  // Handle message selection
  const handleMessageSelect = async (messageId: string) => {
    try {
      const message = await getMessage(messageId);
      setSelectedMessage(message);
      setViewMode('view');
    } catch (err) {
      console.error('Error loading message:', err);
    }
  };

  // Handle message actions
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      await refreshAll();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
        setViewMode('list');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleToggleStar = async (messageId: string, starred: boolean) => {
    try {
      await toggleStar(messageId, starred);
      await refreshAll();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_starred: starred });
      }
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  // Handle compose
  const handleCompose = () => {
    setViewMode('compose');
    setSelectedMessage(null);
  };

  const handleComposeClose = () => {
    setViewMode('list');
    refreshAll();
  };

  // Handle back to list
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMessage(null);
  };

  return (
    <div className={`flex h-full bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Mailbox
          </h2>
        </div>

        {/* Compose Button */}
        <div className="p-4">
          <button
            onClick={handleCompose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Compose
          </button>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              
              return (
                <button
                  key={folder.id}
                  onClick={() => handleFolderChange(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-4 w-4" />
                    <span className="font-medium">{folder.label}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Refresh Button */}
        <div className="p-4 border-t">
          <button
            onClick={refreshAll}
            disabled={loading}
            className="w-full flex items-center justify-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {viewMode === 'compose' && (
          <ComposeMessage
            onClose={handleComposeClose}
            onSent={handleComposeClose}
          />
        )}

        {viewMode === 'view' && selectedMessage && (
          <MessageView
            message={selectedMessage}
            onBack={handleBackToList}
            onDelete={handleDeleteMessage}
            onToggleStar={handleToggleStar}
            onReply={() => {
              // TODO: Implement reply functionality
            }}
          />
        )}

        {viewMode === 'list' && (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeFolder}...`}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages[activeFolder] || []}
                folder={activeFolder}
                loading={loading}
                onMessageSelect={handleMessageSelect}
                onDelete={handleDeleteMessage}
                onToggleStar={handleToggleStar}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Mailbox;
