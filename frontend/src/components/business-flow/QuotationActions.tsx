
import React from 'react';
import { Button } from '@/components/ui/button';
import { useConvertQuotationToSalesOrder } from '@/hooks/business-flow/useQuotationFlow';
import { FileText } from 'lucide-react';

interface QuotationActionsProps {
  quotationId: string;
  status: string;
}

const QuotationActions: React.FC<QuotationActionsProps> = ({ quotationId, status }) => {
  const convertToSalesOrder = useConvertQuotationToSalesOrder();

  const handleConvertToSalesOrder = () => {
    convertToSalesOrder.mutate(quotationId);
  };

  // Only show conversion button when quotation is accepted
  if (status !== 'accepted') {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleConvertToSalesOrder}
        disabled={convertToSalesOrder.isPending}
        size="sm"
      >
        <FileText className="h-4 w-4 mr-1" />
        {convertToSalesOrder.isPending ? 'Converting...' : 'Convert to Sales Order'}
      </Button>
    </div>
  );
};

export default QuotationActions;
