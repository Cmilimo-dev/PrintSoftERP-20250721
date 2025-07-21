import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/types/businessDocuments';
import { CreditCard, DollarSign, Building2 } from 'lucide-react';

interface PaymentFieldsProps {
  formData: Payment;
  onUpdate: (updates: Partial<Payment>) => void;
}

const PaymentFields: React.FC<PaymentFieldsProps> = ({ formData, onUpdate }) => {
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'mobile-money', label: 'Mobile Money' },
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => onUpdate({ paymentDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select 
                value={formData.paymentType} 
                onValueChange={(value: 'customer-payment' | 'vendor-payment') => onUpdate({ paymentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-payment">Customer Payment</SelectItem>
                  <SelectItem value="vendor-payment">Vendor Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value: any) => onUpdate({ paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => onUpdate({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amountPaid">Amount Paid</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) => onUpdate({ amountPaid: parseFloat(e.target.value) })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => onUpdate({ reference: e.target.value })}
                placeholder="e.g., TXN123456789"
                required
              />
            </div>
          </div>

          {formData.relatedDocuments && formData.relatedDocuments.length > 0 && (
            <div>
              <Label>Related Documents</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.relatedDocuments.map((doc, index) => (
                  <Badge key={index} variant="secondary">
                    {doc}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="relatedDocuments">Related Documents (comma-separated)</Label>
            <Input
              id="relatedDocuments"
              value={formData.relatedDocuments?.join(', ') || ''}
              onChange={(e) => onUpdate({ 
                relatedDocuments: e.target.value.split(',').map(doc => doc.trim()).filter(doc => doc)
              })}
              placeholder="e.g., INV-2024-001, SO-2024-002"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Details Section (for bank transfers) */}
      {formData.paymentMethod === 'bank-transfer' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankDetails?.bankName || ''}
                onChange={(e) => onUpdate({
                  bankDetails: {
                    ...formData.bankDetails,
                    bankName: e.target.value,
                    accountNumber: formData.bankDetails?.accountNumber || '',
                  }
                })}
                placeholder="Enter bank name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.bankDetails?.accountNumber || ''}
                  onChange={(e) => onUpdate({
                    bankDetails: {
                      ...formData.bankDetails,
                      bankName: formData.bankDetails?.bankName || '',
                      accountNumber: e.target.value,
                    }
                  })}
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                <Input
                  id="routingNumber"
                  value={formData.bankDetails?.routingNumber || ''}
                  onChange={(e) => onUpdate({
                    bankDetails: {
                      ...formData.bankDetails,
                      bankName: formData.bankDetails?.bankName || '',
                      accountNumber: formData.bankDetails?.accountNumber || '',
                      routingNumber: e.target.value,
                    }
                  })}
                  placeholder="Enter routing number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentFields;
