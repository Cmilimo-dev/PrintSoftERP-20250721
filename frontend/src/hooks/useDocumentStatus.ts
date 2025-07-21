import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DocumentWorkflowService } from '@/services/documentWorkflowService';

export const useUpdateDocumentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      documentType, 
      documentId, 
      newStatus 
    }: { 
      documentType: string; 
      documentId: string; 
      newStatus: string; 
    }) => {
      console.log(`Updating ${documentType} ${documentId} status to ${newStatus}`);
      return await DocumentWorkflowService.updateDocumentStatus(documentType, documentId, newStatus);
    },
    onSuccess: (result, { documentType, newStatus }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['delivery_notes'] });
      
      const availableActions = DocumentWorkflowService.getAvailableActions(documentType, newStatus);
      
      let description = `Status updated to ${newStatus}`;
      if (availableActions.length > 0) {
        description += `. New actions available: ${availableActions.join(', ')}`;
      }
      
      toast({
        title: "Status Updated",
        description,
      });
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useGetAvailableActions = (documentType: string, status: string) => {
  return DocumentWorkflowService.getAvailableActions(documentType, status);
};

export const useCanConvert = (fromType: string, toType: string, status: string) => {
  return DocumentWorkflowService.canConvert(fromType, toType, status);
};
