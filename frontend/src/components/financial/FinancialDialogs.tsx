
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BusinessDocumentForm from '@/components/BusinessDocumentForm';
import { Plus } from 'lucide-react';

interface FinancialDialogsProps {
  isInvoiceDialogOpen: boolean;
  setIsInvoiceDialogOpen: (open: boolean) => void;
  isPaymentReceiptDialogOpen: boolean;
  setIsPaymentReceiptDialogOpen: (open: boolean) => void;
}

const FinancialDialogs: React.FC<FinancialDialogsProps> = ({
  isInvoiceDialogOpen,
  setIsInvoiceDialogOpen,
  isPaymentReceiptDialogOpen,
  setIsPaymentReceiptDialogOpen
}) => {
  const handleFormSubmit = (dialogSetter: (open: boolean) => void) => {
    dialogSetter(false);
  };

  const handleFormCancel = (dialogSetter: (open: boolean) => void) => {
    dialogSetter(false);
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <BusinessDocumentForm 
              documentType="invoice" 
              onSave={() => handleFormSubmit(setIsInvoiceDialogOpen)}
              onCancel={() => handleFormCancel(setIsInvoiceDialogOpen)}
              hideSettings={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentReceiptDialogOpen} onOpenChange={setIsPaymentReceiptDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Payment Receipt
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <BusinessDocumentForm 
              documentType="payment-receipt" 
              onSave={() => handleFormSubmit(setIsPaymentReceiptDialogOpen)}
              onCancel={() => handleFormCancel(setIsPaymentReceiptDialogOpen)}
              hideSettings={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialDialogs;
