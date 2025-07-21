import React from 'react';
import { X, Star, Trash2, Reply } from 'lucide-react';

interface MessageViewProps {
  message: any;
  onBack: () => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  onReply: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({
  message,
  onBack,
  onDelete,
  onToggleStar,
  onReply
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{message.subject || '(No Subject)'}</h3>
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Message Details */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">
            From: {message.sender_first_name} {message.sender_last_name}
          </span>
          <span className="text-sm text-gray-500"> &lt;{message.sender_email}&gt;</span>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Sent at: {new Date(message.sent_at).toLocaleString()}
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {message.body}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={() => onReply()}
            className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleStar(message.id, !message.is_starred)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Star className={`h-4 w-4 ${message.is_starred ? 'text-yellow-500' : 'text-gray-400'}`} />
            {message.is_starred ? 'Unstar' : 'Star'}
          </button>
          <button
            onClick={() => onDelete(message.id)}
            className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-all"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageView;

