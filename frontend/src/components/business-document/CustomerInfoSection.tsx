
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/types/businessDocuments';
import CustomerSelector from './CustomerSelector';
import { Users } from 'lucide-react';

interface CustomerInfoSectionProps {
  customer: Customer;
  onUpdate: (updates: Partial<Customer>) => void;
  onAddNew?: () => void;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customer,
  onUpdate,
  onAddNew
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerSelector
          customer={customer}
          onUpdate={onUpdate}
          onAddNew={onAddNew}
        />
      </CardContent>
    </Card>
  );
};

export default CustomerInfoSection;
