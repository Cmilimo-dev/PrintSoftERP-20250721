import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerReturn } from '@/types/businessDocuments';
import { RotateCcw } from 'lucide-react';

interface CustomerReturnFieldsProps {
  formData: Partial<CustomerReturn>;
  onUpdate: (updates: Partial<CustomerReturn>) => void;
}

const CustomerReturnFields: React.FC<CustomerReturnFieldsProps> = ({
  formData,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Return Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="returnDate">Return Date</Label>
            <Input
              id="returnDate"
              type="date"
              value={formData.returnDate || ''}
              onChange={(e) => onUpdate({ returnDate: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="originalOrder">Original Order Number (Optional)</Label>
            <Input
              id="originalOrder"
              value={formData.originalOrder || ''}
              onChange={(e) => onUpdate({ originalOrder: e.target.value })}
              placeholder="SO-2024-001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="returnType">Return Type</Label>
            <Select
              value={formData.returnType || ''}
              onValueChange={(value) => onUpdate({ returnType: value as CustomerReturn['returnType'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select return type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="unwanted">Unwanted</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="wrong-item">Wrong Item</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refundMethod">Refund Method</Label>
            <Select
              value={formData.refundMethod || ''}
              onValueChange={(value) => onUpdate({ refundMethod: value as CustomerReturn['refundMethod'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
                <SelectItem value="store-credit">Store Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Return Reason</Label>
          <Textarea
            id="reason"
            value={formData.reason || ''}
            onChange={(e) => onUpdate({ reason: e.target.value })}
            placeholder="Describe the reason for return..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspectionNotes">Inspection Notes (Optional)</Label>
          <Textarea
            id="inspectionNotes"
            value={formData.inspectionNotes || ''}
            onChange={(e) => onUpdate({ inspectionNotes: e.target.value })}
            placeholder="Notes from inspection of returned items..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundAmount">Refund Amount (Optional)</Label>
          <Input
            id="refundAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.refundAmount || ''}
            onChange={(e) => onUpdate({ refundAmount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
          <p className="text-sm text-muted-foreground">
            Leave empty to calculate from returned items
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerReturnFields;
