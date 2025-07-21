
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DocumentWorkflowService } from '@/services/documentWorkflowService';

export const useConvertQuotationToSalesOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      console.log('Converting quotation to sales order:', quotationId);
      return await DocumentWorkflowService.convertQuotationToSalesOrder(quotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      toast({
        title: "Success",
        description: "Quotation converted to sales order successfully",
      });
    },
    onError: (error) => {
      console.error('Quotation conversion error:', error);
      toast({
        title: "Error",
        description: `Failed to convert quotation: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
