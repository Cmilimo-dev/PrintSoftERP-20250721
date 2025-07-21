
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';

interface DocumentSpecificFieldsProps {
  documentType: DocumentType;
  formData: BaseDocument;
  onUpdate: (updates: Partial<BaseDocument>) => void;
}

const DocumentSpecificFields: React.FC<DocumentSpecificFieldsProps> = ({
  documentType,
  formData,
  onUpdate
}) => {
  if (documentType === 'purchase-order') {
    return null; // No additional fields for purchase orders
  }

  const getFieldsForType = () => {
    switch (documentType) {
      case 'invoice':
        return (
          <>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={(formData as any).invoiceDate || formData.date}
                onChange={(e) => onUpdate({ invoiceDate: e.target.value } as any)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={(formData as any).dueDate || ''}
                onChange={(e) => onUpdate({ dueDate: e.target.value } as any)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={(formData as any).status || 'draft'}
                onChange={(e) => onUpdate({ status: e.target.value } as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </>
        );
      case 'quote':
        return (
          <>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={(formData as any).validUntil || ''}
                onChange={(e) => onUpdate({ validUntil: e.target.value } as any)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={(formData as any).status || 'draft'}
                onChange={(e) => onUpdate({ status: e.target.value } as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </>
        );
      case 'sales-order':
        return (
          <>
            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={(formData as any).expectedDelivery || ''}
                onChange={(e) => onUpdate({ expectedDelivery: e.target.value } as any)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={(formData as any).status || 'pending'}
                onChange={(e) => onUpdate({ status: e.target.value } as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {getFieldsForType()}
      </CardContent>
    </Card>
  );
};

export default DocumentSpecificFields;
