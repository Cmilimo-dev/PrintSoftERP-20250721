import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditNote, LineItem } from '@/types/businessDocuments';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import { CreditCard, RefreshCw } from 'lucide-react';

interface CreditNoteFieldsProps {
  formData: CreditNote;
  onUpdate: (updates: Partial<CreditNote>) => void;
}

const CreditNoteFields: React.FC<CreditNoteFieldsProps> = ({ formData, onUpdate }) => {
  const handleLineItemsChange = (items: LineItem[]) => {
    onUpdate({ items: items });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Note Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="creditDate">Credit Date</Label>
              <Input
                id="creditDate"
                type="date"
                value={formData.creditDate}
                onChange={(e) => onUpdate({ creditDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="originalInvoice">Original Invoice</Label>
              <Input
                id="originalInvoice"
                value={formData.originalInvoice}
                onChange={(e) => onUpdate({ originalInvoice: e.target.value })}
                placeholder="e.g., INV-2024-001"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="creditType">Credit Type</Label>
              <Select 
                value={formData.creditType} 
                onValueChange={(value: 'full' | 'partial') => onUpdate({ creditType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select credit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Credit</SelectItem>
                  <SelectItem value="partial">Partial Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'draft' | 'issued' | 'applied') => onUpdate({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="refundMethod">Refund Method</Label>
            <Select 
              value={formData.refundMethod} 
              onValueChange={(value: 'cash' | 'credit' | 'bank-transfer') => onUpdate({ refundMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Store Credit</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Credit</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => onUpdate({ reason: e.target.value })}
              placeholder="Explain the reason for issuing this credit note"
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Credit Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Items to Credit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartLineItemComponent
            items={formData.items || []}
            onItemsChange={handleLineItemsChange}
            documentType="credit-note"
            currency={formData.currency || 'KES'}
            readOnly={false}
            showStock={false}
            enableBulkImport={false}
            enableBarcodeScanning={false}
            taxSettings={{ type: 'exclusive', defaultRate: 0 }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditNoteFields;
