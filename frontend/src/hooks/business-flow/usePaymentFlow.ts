
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreatePaymentReceipt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      console.log('Creating payment receipt for invoice:', invoiceId);
      
      // Get the invoice data
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      console.log('Invoice data retrieved:', invoice);

      // Calculate remaining amount to be paid
      const remainingAmount = invoice.total_amount - invoice.paid_amount;

      // For now, create a mock payment receipt since payment_receipts table doesn't exist
      const paymentData = {
        id: `PAY-${Date.now()}`,
        receipt_number: `PAY-${Date.now()}`,
        customer_id: invoice.customer_id,
        payment_date: new Date().toISOString().split('T')[0],
        amount: remainingAmount,
        payment_method: 'bank_transfer',
        invoice_reference: invoice.invoice_number,
        notes: `Payment for invoice ${invoice.invoice_number}`,
        status: 'received' as const,
        created_at: new Date().toISOString()
      };

      console.log('Mock payment receipt created:', paymentData);
      const payment = paymentData;

      // Update invoice paid amount and status
      const updatedInvoice = await supabase
        .from('invoices')
        .update({ 
          paid_amount: invoice.total_amount,
          status: 'completed' as const
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (updatedInvoice.error) throw updatedInvoice.error;

      console.log('Invoice updated:', updatedInvoice.data);

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Payment receipt created successfully",
      });
    },
    onError: (error) => {
      console.error('Payment creation error:', error);
      toast({
        title: "Error",
        description: `Failed to create payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
