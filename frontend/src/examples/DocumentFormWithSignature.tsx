import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignatureSelector } from '@/components/documents/SignatureSelector';
import { DocumentSignatureSection } from '@/components/documents/DocumentSignature';
import { DepartmentSignatureSelector } from '@/components/documents/DepartmentSignatureSelector';
import { EnhancedDocumentSignature } from '@/components/documents/EnhancedDocumentSignature';
import { SignatureService } from '@/services/signatureService';
import { DepartmentSignatureService } from '@/services/departmentSignatureService';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';

// Example interface for a document form
interface DocumentFormData {
  id: string;
  documentNumber: string;
  customerName: string;
  date: string;
  // Document-specific signature settings
  includeSignature: boolean;
  selectedSignatureId?: string;
  // ... other document fields
}

const DocumentFormWithSignature: React.FC = () => {
  // Document form state
  const [formData, setFormData] = useState<DocumentFormData>({
    id: 'doc_001',
    documentNumber: 'INV-2025-0001',
    customerName: 'Sample Customer',
    date: new Date().toISOString().split('T')[0],
    includeSignature: false,
    selectedSignatureId: undefined
  });

  // Signature data from system settings
  const [signatures, setSignatures] = useState<AuthorizedSignature[]>([]);
  const [signatureSettings, setSignatureSettings] = useState<SignatureSettings>({
    enabled: false,
    showOnDocuments: false,
    signaturePosition: 'bottom-right',
    showTitle: true,
    showName: true,
    showDate: true,
    customText: 'Authorized by:'
  });

  // Load signature data on component mount and listen for updates
  useEffect(() => {
    loadSignatureData();
    
    // Subscribe to signature changes for real-time updates
    const unsubscribe = DepartmentSignatureService.onSignatureChange(() => {
      console.log('🔔 Signature changed event received, reloading data...');
      loadSignatureData();
    });

    return unsubscribe;
  }, []);

  const loadSignatureData = () => {
    const settings = DepartmentSignatureService.getSignatureSettings();
    const sigs = DepartmentSignatureService.getSignaturesForDocument('quotation');
    
    console.log('🔄 Loading signature data:', { settings, sigs });
    setSignatureSettings(settings);
    setSignatures(sigs);

    // Auto-enable signature if globally enabled and has default
    if (settings.enabled && settings.showOnDocuments) {
      const defaultSig = DepartmentSignatureService.getDefaultSignatureForDocument('quotation');
      if (defaultSig) {
        setFormData(prev => ({
          ...prev,
          includeSignature: true,
          selectedSignatureId: defaultSig.id
        }));
      }
    }
    
    // Trigger custom event for debugging
    console.log('🔄 Signature data loaded, current signatures:', sigs);
  };

  const handleSignatureChange = (signatureId: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      selectedSignatureId: signatureId
    }));
  };

  const handleShowSignatureChange = (show: boolean) => {
    setFormData(prev => ({
      ...prev,
      includeSignature: show,
      // Clear selection if hiding signature
      selectedSignatureId: show ? prev.selectedSignatureId : undefined
    }));
  };

  const handleSaveDocument = () => {
    // Save document with signature information
    const documentData = {
      ...formData,
      signature: formData.includeSignature ? {
        signatureId: formData.selectedSignatureId,
        signedAt: new Date().toISOString(),
        signatureSettings: signatureSettings
      } : null
    };

    console.log('Saving document with signature data:', documentData);
    // Implement actual save logic here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Document Form with Signature Integration</h1>

      {/* Main Document Form */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Document Number</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Document Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentSignatureSelector
            documentType="quotation"
            selectedSignatureId={formData.selectedSignatureId}
            onSignatureChange={handleSignatureChange}
            showSignature={formData.includeSignature}
            onShowSignatureChange={handleShowSignatureChange}
          />
        </CardContent>
      </Card>

      {/* Document Preview with Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border border-gray-200 p-8 min-h-[400px]">
            {/* Document Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-gray-600">Document #: {formData.documentNumber}</p>
            </div>

            {/* Document Content */}
            <div className="space-y-4">
              <div>
                <strong>Customer:</strong> {formData.customerName}
              </div>
              <div>
                <strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}
              </div>

              {/* Sample line items */}
              <div className="mt-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Sample Product</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">1</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">$100.00</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">$100.00</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold" colSpan={3}>Total:</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold">$100.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Section */}
            {formData.includeSignature && (
              <EnhancedDocumentSignature
                documentType="quotation"
                selectedSignatureId={formData.selectedSignatureId}
                customDate={new Date(formData.date).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Print Preview
        </button>
        <button
          onClick={handleSaveDocument}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Document
        </button>
      </div>

      {/* Debug Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Signatures Enabled:</strong> {signatureSettings.enabled ? 'Yes' : 'No'}</div>
            <div><strong>Show on Documents:</strong> {signatureSettings.showOnDocuments ? 'Yes' : 'No'}</div>
            <div><strong>Available Signatures:</strong> {signatures.length}</div>
            <div><strong>Include Signature:</strong> {formData.includeSignature ? 'Yes' : 'No'}</div>
            <div><strong>Selected Signature ID:</strong> {formData.selectedSignatureId || 'None'}</div>
            <div><strong>Signature Position:</strong> {signatureSettings.signaturePosition}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentFormWithSignature;
