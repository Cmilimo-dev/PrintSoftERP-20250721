
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CurrencySelector from '../CurrencySelector';
import { PurchaseOrder } from '@/types/purchaseOrder';

interface BasicInfoSectionProps {
  formData: PurchaseOrder;
  onUpdate: (updates: Partial<PurchaseOrder>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber || ''}
            onChange={(e) => onUpdate({ documentNumber: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => onUpdate({ date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <CurrencySelector
            value={formData.currency}
            onChange={(value) => onUpdate({ currency: value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
