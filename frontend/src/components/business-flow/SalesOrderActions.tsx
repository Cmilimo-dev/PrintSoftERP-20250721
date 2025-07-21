
import React from 'react';
import { Button } from '@/components/ui/button';
import { useConvertSalesOrderToInvoice, useCreateDeliveryNoteFromSalesOrder } from '@/hooks/business-flow/useSalesOrderFlow';
import { Receipt, Truck } from 'lucide-react';

interface SalesOrderActionsProps {
  salesOrderId: string;
  status: string;
}

const SalesOrderActions: React.FC<SalesOrderActionsProps> = ({ salesOrderId, status }) => {
  const convertToInvoice = useConvertSalesOrderToInvoice();
  const createDeliveryNote = useCreateDeliveryNoteFromSalesOrder();

  const handleConvertToInvoice = () => {
    convertToInvoice.mutate(salesOrderId);
  };

  const handleCreateDeliveryNote = () => {
    createDeliveryNote.mutate(salesOrderId);
  };

  // Only show conversion buttons when sales order is confirmed
  if (status !== 'confirmed') {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleConvertToInvoice}
        disabled={convertToInvoice.isPending}
        size="sm"
        variant="default"
      >
        <Receipt className="h-4 w-4 mr-1" />
        {convertToInvoice.isPending ? 'Converting...' : 'Create Invoice'}
      </Button>
      <Button
        onClick={handleCreateDeliveryNote}
        disabled={createDeliveryNote.isPending}
        size="sm"
        variant="outline"
      >
        <Truck className="h-4 w-4 mr-1" />
        {createDeliveryNote.isPending ? 'Creating...' : 'Create Delivery Note'}
      </Button>
    </div>
  );
};

export default SalesOrderActions;
