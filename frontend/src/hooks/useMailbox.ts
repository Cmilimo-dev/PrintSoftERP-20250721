import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_email?: string;
  recipient_id: string;
  recipient_name?: string;
  recipient_email?: string;
  subject: string;
  content: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  replied_to?: string;
  forwarded_from?: string;
  has_attachments: boolean;
  priority: 'low' | 'normal' | 'high';
  sent_at: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

export interface MessageFolder {
  id: string;
  name: string;
  user_id: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  last_message_at: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

// Message Hooks
export const useMessages = (folder?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['messages', folder, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email),
          recipient:recipient_id(first_name, last_name, email),
          attachments:message_attachments(*)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      // Apply folder filters
      switch (folder) {
        case 'inbox':
          query = query.eq('recipient_id', user.id).eq('is_deleted', false);
          break;
        case 'sent':
          query = query.eq('sender_id', user.id).eq('is_deleted', false);
          break;
        case 'drafts':
          query = query.eq('sender_id', user.id).eq('is_draft', true);
          break;
        case 'starred':
          query = query.eq('is_starred', true).eq('is_deleted', false);
          break;
        case 'archived':
          query = query.eq('is_archived', true).eq('is_deleted', false);
          break;
        case 'trash':
          query = query.eq('is_deleted', true);
          break;
        default:
          query = query.eq('is_deleted', false);
      }

      const { data, error } = await query.order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id,
  });
};

export const useMessage = (id: string) => {
  return useQuery({
    queryKey: ['message', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email),
          recipient:recipient_id(first_name, last_name, email),
          attachments:message_attachments(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Message;
    },
    enabled: !!id,
  });
};

export const useInboxMessages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inbox-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email),
          attachments:message_attachments(*)
        `)
        .eq('recipient_id', user.id)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id,
  });
};

export const useSentMessages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sent-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          recipient:recipient_id(first_name, last_name, email),
          attachments:message_attachments(*)
        `)
        .eq('sender_id', user.id)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .eq('is_deleted', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (message: {
      recipient_id: string;
      subject: string;
      content: string;
      priority?: 'low' | 'normal' | 'high';
      replied_to?: string;
      forwarded_from?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...message,
          sender_id: user.id,
          is_read: false,
          is_starred: false,
          is_archived: false,
          is_deleted: false,
          has_attachments: false,
          priority: message.priority || 'normal',
          sent_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark message as read',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleStarred = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: string; isStarred: boolean }) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_starred: isStarred })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive',
      });
    },
  });
};

export const useArchiveMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_archived: true })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      toast({
        title: 'Success',
        description: 'Message archived successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to archive message',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    },
  });
};

// Message Attachments
export const useMessageAttachments = (messageId: string) => {
  return useQuery({
    queryKey: ['message-attachments', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_attachments')
        .select('*')
        .eq('message_id', messageId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as MessageAttachment[];
    },
    enabled: !!messageId,
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      file, 
      filename 
    }: { 
      messageId: string; 
      file: File; 
      filename: string; 
    }) => {
      // Upload file to storage
      const fileExt = filename.split('.').pop();
      const fileName = `${messageId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);
      
      // Create attachment record
      const { data, error } = await supabase
        .from('message_attachments')
        .insert([{
          message_id: messageId,
          filename,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrl,
          uploaded_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update message to indicate it has attachments
      await supabase
        .from('messages')
        .update({ has_attachments: true })
        .eq('id', messageId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-attachments'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: 'Success',
        description: 'Attachment uploaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload attachment',
        variant: 'destructive',
      });
    },
  });
};

// Search Messages
export const useSearchMessages = (query: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['search-messages', query, user?.id],
    queryFn: async () => {
      if (!user?.id || !query.trim()) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email),
          recipient:recipient_id(first_name, last_name, email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`subject.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id && !!query.trim(),
  });
};

// Message Folders
export const useMessageFolders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['message-folders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('message_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as MessageFolder[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (folder: Omit<MessageFolder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('message_folders')
        .insert([{
          ...folder,
          user_id: user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-folders'] });
      toast({
        title: 'Success',
        description: 'Folder created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive',
      });
    },
  });
};

// Users for messaging
export const useUsers = () => {
  return useQuery({
    queryKey: ['users-for-messaging'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

// Message Statistics
export const useMessageStats = () => {
  const { user } = useAuth();
  const { data: inboxMessages } = useInboxMessages();
  const { data: sentMessages } = useSentMessages();
  const { data: unreadCount } = useUnreadCount();

  return useQuery({
    queryKey: ['message-stats', user?.id, inboxMessages?.length, sentMessages?.length, unreadCount],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const totalInbox = inboxMessages?.length || 0;
      const totalSent = sentMessages?.length || 0;
      const totalUnread = unreadCount || 0;
      const totalStarred = inboxMessages?.filter(msg => msg.is_starred).length || 0;
      const totalArchived = inboxMessages?.filter(msg => msg.is_archived).length || 0;
      
      return {
        inbox: totalInbox,
        sent: totalSent,
        unread: totalUnread,
        starred: totalStarred,
        archived: totalArchived,
      };
    },
    enabled: !!user?.id,
  });
};
