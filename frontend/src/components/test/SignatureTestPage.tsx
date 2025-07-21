import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentSignatureSelector } from '@/components/documents/DepartmentSignatureSelector';
import { EnhancedDocumentSignature } from '@/components/documents/EnhancedDocumentSignature';
import { DocumentType } from '@/services/departmentSignatureService';

export const SignatureTestPage: React.FC = () => {
  const [quotationSignature, setQuotationSignature] = useState<string | undefined>();
  const [invoiceSignature, setInvoiceSignature] = useState<string | undefined>();
  const [showQuotationSignature, setShowQuotationSignature] = useState(true);
  const [showInvoiceSignature, setShowInvoiceSignature] = useState(true);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Signature Real-Time Update Test</h1>
        
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <strong>Instructions:</strong> Go to Settings → Signatures, edit "Helen Achieng" or any Sales signature, 
          and watch the quotation signature update in real-time below.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quotation Test */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation (Sales Department)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <DepartmentSignatureSelector
                  documentType="quotation"
                  selectedSignatureId={quotationSignature}
                  onSignatureChange={setQuotationSignature}
                  showSignature={showQuotationSignature}
                  onShowSignatureChange={setShowQuotationSignature}
                />
                
                {showQuotationSignature && (
                  <div className="border-2 border-dashed border-gray-300 p-4 bg-white">
                    <EnhancedDocumentSignature
                      documentType="quotation"
                      selectedSignatureId={quotationSignature}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Test */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice (Finance Department)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <DepartmentSignatureSelector
                  documentType="invoice"
                  selectedSignatureId={invoiceSignature}
                  onSignatureChange={setInvoiceSignature}
                  showSignature={showInvoiceSignature}
                  onShowSignatureChange={setShowInvoiceSignature}
                />
                
                {showInvoiceSignature && (
                  <div className="border-2 border-dashed border-gray-300 p-4 bg-white">
                    <EnhancedDocumentSignature
                      documentType="invoice"
                      selectedSignatureId={invoiceSignature}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Selection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Quotation:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Department: Sales</li>
                  <li>• Show Signature: {showQuotationSignature ? 'Yes' : 'No'}</li>
                  <li>• Selected ID: {quotationSignature || 'Default'}</li>
                </ul>
              </div>
              <div>
                <strong>Invoice:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Department: Finance</li>
                  <li>• Show Signature: {showInvoiceSignature ? 'Yes' : 'No'}</li>
                  <li>• Selected ID: {invoiceSignature || 'Default'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
