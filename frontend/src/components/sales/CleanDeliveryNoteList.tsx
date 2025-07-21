// Clean Delivery Note List placeholder
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

const CleanDeliveryNoteList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">Delivery Notes module - Coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanDeliveryNoteList;
