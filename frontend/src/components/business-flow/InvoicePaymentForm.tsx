
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvoicePaymentFormProps {
  invoiceId: string;
  invoiceTotal: number;
  onPaymentComplete?: () => void;
}

const InvoicePaymentForm: React.FC<InvoicePaymentFormProps> = ({
  invoiceId,
  invoiceTotal,
  onPaymentComplete
}) => {
  const [amount, setAmount] = useState(invoiceTotal);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [reference, setReference] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPayment = useMutation({
    mutationFn: async () => {
      console.log('Creating payment receipt for invoice:', invoiceId);
      console.log('Payment details:', { amount, paymentMethod, reference });
      
      try {
        // Get invoice details first
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (invoiceError) {
          console.error('Error fetching invoice:', invoiceError);
          throw invoiceError;
        }

        console.log('Invoice found:', invoice);

        // Create a new payment receipt document
        const receiptNumber = `PR-${Date.now()}`;
        
        // This would typically create a payment receipt record
        // For now, we'll just update the invoice paid amount
        const newPaidAmount = (invoice.paid_amount || 0) + amount;
        const newStatus = newPaidAmount >= invoice.total_amount ? 'completed' : 'pending';

        console.log('Updating invoice with:', { newPaidAmount, newStatus });

        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            paid_amount: newPaidAmount,
            status: newStatus
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Error updating invoice:', updateError);
          throw updateError;
        }

        console.log('Payment recorded successfully');
        return { receiptNumber };
      } catch (error) {
        console.error('Payment creation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      onPaymentComplete?.();
    },
    onError: (error) => {
      console.error('Payment creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to record payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Payment amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > invoiceTotal) {
      toast({
        title: "Error",
        description: "Payment amount cannot exceed invoice total",
        variant: "destructive",
      });
      return;
    }

    createPayment.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={invoiceTotal}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Invoice Total: KES {invoiceTotal.toLocaleString()}
            </p>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>

          <Button type="submit" disabled={createPayment.isPending}>
            {createPayment.isPending ? 'Processing...' : 'Record Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvoicePaymentForm;
