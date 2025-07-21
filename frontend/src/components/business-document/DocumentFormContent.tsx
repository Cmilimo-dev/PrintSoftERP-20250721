
import React from 'react';
import { BaseDocument, DocumentType, LineItem } from '@/types/businessDocuments';
import CustomerInfoSection from './CustomerInfoSection';
import VendorSelector from './VendorSelector';
import TaxSettingsSection from '../purchase-order/TaxSettingsSection';
import EnhancedLineItemsSection from '../shared/EnhancedLineItemsSection';
import AdditionalInfoSection from '../purchase-order/AdditionalInfoSection';
import DocumentSpecificFields from './DocumentSpecificFields';
import DocumentHeaderSection from './DocumentHeaderSection';
import PaymentReceiptFields from './PaymentReceiptFields';
import DeliveryNoteFields from './DeliveryNoteFields';
import FinancialReportFields from './FinancialReportFields';
import CreditNoteFields from './CreditNoteFields';
import PaymentFields from './PaymentFields';
import CustomerReturnFields from './CustomerReturnFields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface DocumentFormContentProps {
  documentType: DocumentType;
  formData: BaseDocument;
  onFormDataUpdate: (updates: Partial<BaseDocument>) => void;
  setFormData: React.Dispatch<React.SetStateAction<BaseDocument>>;
  updateItem: (index: number, field: any, value: string | number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  onItemsChange?: (items: LineItem[]) => void;
}

const DocumentFormContent: React.FC<DocumentFormContentProps> = ({
  documentType,
  formData,
  onFormDataUpdate,
  setFormData,
  updateItem,
  addItem,
  removeItem,
  onItemsChange
}) => {
  // Show line items for all document types except payment-receipt, financial-report, delivery-note, credit-note, and payment
  // (delivery-note and credit-note have their own line items sections)
  const showLineItems = !['payment-receipt', 'financial-report', 'delivery-note', 'credit-note', 'payment'].includes(documentType);
  const showTaxSettings = !['payment-receipt', 'financial-report', 'delivery-note', 'credit-note', 'payment'].includes(documentType);

  return (
    <div className="space-y-6">
      <DocumentHeaderSection 
        formData={formData}
        onUpdate={onFormDataUpdate}
      />

      <DocumentSpecificFields 
        documentType={documentType}
        formData={formData}
        onUpdate={onFormDataUpdate}
      />

      {documentType === 'payment-receipt' && (
        <PaymentReceiptFields 
          formData={formData as any}
          onUpdate={onFormDataUpdate}
        />
      )}

      {documentType === 'purchase-order' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VendorSelector 
              vendor={(formData as any).vendor || {}}
              onUpdate={(updates) => setFormData(prev => ({ 
                ...prev, 
                vendor: { ...((prev as any).vendor || {}), ...updates }
              }))}
            />
          </CardContent>
        </Card>
      )}

      {(['invoice', 'quote', 'sales-order', 'delivery-note', 'credit-note', 'customer-return'].includes(documentType) || 
        (documentType === 'payment-receipt' && (formData as any).receiptType === 'customer') ||
        (documentType === 'payment' && (formData as any).paymentType === 'customer-payment')) && (
        <CustomerInfoSection 
          customer={(formData as any).customer || {}}
          onUpdate={(updates) => setFormData(prev => ({ 
            ...prev, 
            customer: { ...((prev as any).customer || {}), ...updates }
          }))}
        />
      )}

      {documentType === 'delivery-note' && (
        <DeliveryNoteFields 
          formData={formData as any}
          onUpdate={onFormDataUpdate}
        />
      )}

      {documentType === 'credit-note' && (
        <CreditNoteFields 
          formData={formData as any}
          onUpdate={onFormDataUpdate}
        />
      )}

      {documentType === 'payment' && (
        <PaymentFields 
          formData={formData as any}
          onUpdate={onFormDataUpdate}
        />
      )}

      {documentType === 'customer-return' && (
        <CustomerReturnFields 
          formData={formData as any}
          onUpdate={onFormDataUpdate}
        />
      )}

      {documentType === 'financial-report' && (
        <FinancialReportFields 
          formData={formData as any}
          onUpdate={onFormDataUpdate}
        />
      )}

      {((documentType === 'payment-receipt' && (formData as any).receiptType === 'vendor') ||
        (documentType === 'payment' && (formData as any).paymentType === 'vendor-payment')) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VendorSelector 
              vendor={(formData as any).vendor || {}}
              onUpdate={(updates) => setFormData(prev => ({ 
                ...prev, 
                vendor: { ...((prev as any).vendor || {}), ...updates }
              }))}
            />
          </CardContent>
        </Card>
      )}

      {showTaxSettings && (
        <TaxSettingsSection 
          taxSettings={formData.taxSettings}
          onUpdate={(updates) => setFormData(prev => ({
            ...prev,
            taxSettings: { ...prev.taxSettings, ...updates }
          }))}
        />
      )}

      {showLineItems && (
        <EnhancedLineItemsSection 
          items={formData.items}
          onItemsChange={onItemsChange}
          taxSettings={formData.taxSettings}
          currency={formData.currency}
          subtotal={formData.subtotal}
          taxAmount={formData.taxAmount}
          total={formData.total}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          hidePricing={documentType === 'delivery-note'}
          documentType={documentType}
          allowNewItems={documentType === 'purchase-order'}
          showStock={!['quote'].includes(documentType)}
        />
      )}

      {!['financial-report'].includes(documentType) && (
        <AdditionalInfoSection 
          notes={formData.notes || ''}
          terms={formData.terms || ''}
          onUpdate={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
        />
      )}
    </div>
  );
};

export default DocumentFormContent;
