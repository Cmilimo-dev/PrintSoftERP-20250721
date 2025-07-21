
import React from 'react';
import { Button } from '@/components/ui/button';
import { DocumentType } from '@/types/businessDocuments';
import { UserSettingsButton } from '@/components/UserSettingsButton';

interface DocumentFormHeaderProps {
  documentType: DocumentType;
  document?: any;
  userSettings?: {
    company: any;
    currency: string;
  };
  onUserSettingsUpdate?: (newSettings: { company: any; currency: string }) => void;
  onCancel: () => void;
  onSubmit: () => void;
  showSettings?: boolean;
}

const DocumentFormHeader: React.FC<DocumentFormHeaderProps> = ({
  documentType,
  document,
  userSettings,
  onUserSettingsUpdate,
  onCancel,
  onSubmit,
  showSettings = false
}) => {
  const getDocumentTitle = () => {
    switch (documentType) {
      case 'purchase-order': return 'Purchase Order';
      case 'invoice': return 'Invoice';
      case 'quote': return 'Quote';
      case 'sales-order': return 'Sales Order';
      case 'payment-receipt': return 'Payment Receipt';
      case 'delivery-note': return 'Delivery Note';
      case 'financial-report': return 'Financial Report';
      default: return 'Document';
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-foreground">
        {document ? 'Edit' : 'Create'} {getDocumentTitle()}
      </h1>
      <div className="flex gap-2">
        {showSettings && (
          <UserSettingsButton variant="button" className="px-4 py-2" />
        )}
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default DocumentFormHeader;
