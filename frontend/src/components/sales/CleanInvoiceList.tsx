// Clean Invoice List placeholder
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const CleanInvoiceList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Invoices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">Invoices module - Coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanInvoiceList;
