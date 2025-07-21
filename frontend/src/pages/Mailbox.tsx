import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Send, 
  Inbox, 
  MessageSquare, 
  Users, 
  Search,
  Plus,
  Reply,
  Forward,
  Trash2,
  Star,
  Archive,
  Paperclip,
  Clock,
  Loader2
} from 'lucide-react';
import { mailboxService, Message, User } from '@/services/mailboxService';

const Mailbox = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: ''
  });
  
  const { toast } = useToast();

  // Load data on component mount and when folder changes
  useEffect(() => {
    loadMessages();
    loadUsers();
  }, [currentFolder]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      let messageData: Message[] = [];
      if (currentFolder === 'inbox') {
        messageData = await mailboxService.getInboxMessages();
      } else if (currentFolder === 'sent') {
        messageData = await mailboxService.getSentMessages();
      }
      setMessages(messageData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const userData = await mailboxService.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      await mailboxService.sendMessage(composeForm);
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      
      // Reset form and close compose
      setComposeForm({ to: '', subject: '', body: '' });
      setShowCompose(false);
      
      // Reload messages to show the sent message
      loadMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const folders = [
    { name: 'Inbox', count: 12, icon: Inbox },
    { name: 'Sent', count: 45, icon: Send },
    { name: 'Drafts', count: 3, icon: MessageSquare },
    { name: 'Starred', count: 8, icon: Star },
    { name: 'Archive', count: 156, icon: Archive },
    { name: 'Trash', count: 7, icon: Trash2 }
  ];

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mailboxService.getMessagePreview(message.body).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setShowCompose(false);
  };

  const handleCompose = () => {
    setShowCompose(true);
    setSelectedMessage(null);
    setComposeForm({ to: '', subject: '', body: '' });
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentFolder(folderName.toLowerCase());
    setSelectedMessage(null);
    setShowCompose(false);
  };

  const updateComposeForm = (field: string, value: string) => {
    setComposeForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mailbox</h1>
          <p className="text-gray-600">Internal messaging and communication</p>
        </div>
        <Button onClick={handleCompose}>
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Folders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {folders.map((folder) => {
                const IconComponent = folder.icon;
                const isActive = currentFolder === folder.name.toLowerCase();
                const isImplemented = ['inbox', 'sent'].includes(folder.name.toLowerCase());
                return (
                  <Button
                    key={folder.name}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => isImplemented && handleFolderClick(folder.name)}
                    disabled={!isImplemented}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {folder.name}
                    {isImplemented && (
                      <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto">
                        {folder.name.toLowerCase() === currentFolder ? messages.length : folder.count}
                      </Badge>
                    )}
                    {!isImplemented && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Soon
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Message List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                <Badge variant="secondary">{filteredMessages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading messages...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No messages found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      } ${!message.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium truncate ${!message.is_read ? 'font-bold' : ''}`}>
                              {message.sender_name}
                            </span>
                            {message.is_starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            {message.attachments && <Paperclip className="h-4 w-4 text-gray-400" />}
                          </div>
                          <p className={`text-sm truncate ${!message.is_read ? 'font-semibold' : 'text-gray-600'}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {mailboxService.getMessagePreview(message.body)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-xs text-gray-500">
                            {mailboxService.formatTimestamp(message.created_at)}
                          </span>
                          {!message.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2 space-y-4">
          {showCompose ? (
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">To:</label>
                  <Select value={composeForm.to} onValueChange={(value) => updateComposeForm('to', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <Input 
                    placeholder="Enter subject..." 
                    value={composeForm.subject}
                    onChange={(e) => updateComposeForm('subject', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message:</label>
                  <Textarea 
                    placeholder="Write your message..." 
                    className="min-h-[200px]"
                    value={composeForm.body}
                    onChange={(e) => updateComposeForm('body', e.target.value)}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" disabled>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowCompose(false)} disabled={sendingMessage}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage} disabled={sendingMessage}>
                      {sendingMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <span>From: {selectedMessage.sender_name} ({selectedMessage.sender_email})</span>
                      <span>•</span>
                      <span>{mailboxService.formatTimestamp(selectedMessage.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.is_starred && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {selectedMessage.attachments && (
                      <Paperclip className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {selectedMessage.body}
                  </div>
                  
                  {selectedMessage.attachments && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Attachments:</h4>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Attachment available</span>
                        <Button variant="ghost" size="sm" className="ml-auto" disabled>
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Select a message</h3>
                  <p className="text-gray-600">Choose a message from the list to read its content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mailbox;
