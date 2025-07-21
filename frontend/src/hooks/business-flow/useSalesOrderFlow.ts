
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { DocumentWorkflowService } from '@/services/documentWorkflowService';

export const useConvertSalesOrderToInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salesOrderId: string) => {
      console.log('Converting sales order to invoice:', salesOrderId);
      return await DocumentWorkflowService.convertSalesOrderToInvoice(salesOrderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      toast({
        title: "Success",
        description: "Sales order converted to invoice successfully",
      });
    },
    onError: (error) => {
      console.error('Sales order conversion error:', error);
      toast({
        title: "Error",
        description: `Failed to convert sales order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useCreateDeliveryNoteFromSalesOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salesOrderId: string) => {
      console.log('Creating delivery note from sales order:', salesOrderId);
      return await DocumentWorkflowService.createDeliveryNoteFromSalesOrder(salesOrderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery_notes'] });
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      toast({
        title: "Success",
        description: "Delivery note created successfully",
      });
    },
    onError: (error) => {
      console.error('Delivery note creation error:', error);
      toast({
        title: "Error",
        description: `Failed to create delivery note: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
