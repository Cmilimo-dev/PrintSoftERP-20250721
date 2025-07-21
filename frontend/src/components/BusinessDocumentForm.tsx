
import React, { useState, useEffect } from 'react';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
// import { useUpdateInventory, recordStockMovement } from '@/hooks/useInventoryUpdate';
import DocumentFormHeader from './business-document/DocumentFormHeader';
import DocumentFormContent from './business-document/DocumentFormContent';
import { DocumentCompanyService } from '@/services/documentCompanyService';
import { DepartmentSignatureSelector } from '@/components/documents/DepartmentSignatureSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSignature } from 'lucide-react';
import { DocumentType as DeptDocumentType } from '@/services/departmentSignatureService';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Import unified document services
import { BusinessDocumentService } from '@/services/businessDocumentService';

// Helper function to map DocumentType to DeptDocumentType
const mapDocumentType = (docType: DocumentType): DeptDocumentType => {
  switch (docType) {
    case 'quote': return 'quotation';
    case 'sales-order': return 'sales_order';
    case 'invoice': return 'invoice';
    case 'purchase-order': return 'purchase_order';
    case 'payment-receipt': return 'payment_receipt';
    default: return 'invoice'; // fallback
  }
};

// Get document types that support signatures
const getSupportedDocumentTypes = (): DocumentType[] => {
  return ['quote', 'sales-order', 'invoice', 'purchase-order', 'payment-receipt'];
};

interface BusinessDocumentFormProps {
  documentType: DocumentType;
  document?: BaseDocument | null;
  onSave: (doc: BaseDocument) => void;
  onCancel: () => void;
  hideSettings?: boolean;
}

const BusinessDocumentForm: React.FC<BusinessDocumentFormProps> = ({
  documentType,
  document,
  onSave,
  onCancel,
  hideSettings = false
}) => {
  const isMobile = useIsMobile();
  const [userSettings, setUserSettings] = useState({
    company: {},
    currency: 'KES'
  });
  
  // Signature state
  const [includeSignature, setIncludeSignature] = useState(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | undefined>();
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Load company settings on component mount
  useEffect(() => {
    const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
    const currency = DocumentCompanyService.getCurrency();
    
    setUserSettings({
      company: {
        name: companyInfo.companyName,
        address: companyInfo.address,
        city: companyInfo.city,
        state: companyInfo.state,
        zip: companyInfo.zip,
        country: 'USA', // Default or could be added to settings
        phone: companyInfo.phone,
        email: companyInfo.email,
        taxId: companyInfo.taxId,
        website: companyInfo.website,
        logo: companyInfo.logoUrl || ''
      },
      currency
    });
  }, []);

  const {
    formData,
    updateItem,
    addItem,
    removeItem,
    handleFormDataUpdate,
    handleItemsChange,
    setFormData
  } = useBusinessDocumentForm({
    documentType,
    document,
    userSettings
  });

  // const updateInventory = useUpdateInventory();

  const handleUserSettingsUpdate = (newSettings: { company: any; currency: string }) => {
    setUserSettings(newSettings);
    setFormData(prev => ({
      ...prev,
      company: newSettings.company,
      currency: newSettings.currency
    }));
  };

  const processInventoryUpdates = async (documentData: BaseDocument) => {
    // Only process inventory for documents that affect stock
    const inventoryAffectingTypes = ['sales-order', 'invoice', 'delivery-note', 'purchase-order'];
    
    if (!inventoryAffectingTypes.includes(documentType)) {
      return;
    }

    // For now, just log the inventory updates that would be made
    // This can be replaced with actual API calls when the backend is ready
    console.log('Would update inventory for document:', documentData.documentNumber);
    
    for (const item of documentData.items) {
      if (!item.itemCode) continue;

      let movementType: 'in' | 'out';
      
      // Determine movement type based on document type
      switch (documentType) {
        case 'purchase-order':
          movementType = 'in'; // Receiving stock
          break;
        case 'sales-order':
        case 'invoice':
        case 'delivery-note':
          movementType = 'out'; // Selling/delivering stock
          break;
        default:
          continue;
      }

      console.log(`Inventory update: ${item.itemCode} - ${movementType} ${item.quantity} units`);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      console.log('Form submitted for document type:', documentType);
      console.log('Form data:', formData);
      
      // Basic validation
      if (!formData.documentNumber) {
        console.error('Document number is required');
        throw new Error('Document number is required');
      }
      
      if (!formData.date) {
        console.error('Date is required');
        throw new Error('Date is required');
      }
      
      if (!formData.items || formData.items.length === 0) {
        console.error('At least one line item is required');
        throw new Error('At least one line item is required');
      }
      
      console.log('Processing inventory updates for document:', formData.documentNumber);
      
      // Process inventory updates
      await processInventoryUpdates(formData);
      
      console.log('Saving document:', formData.documentNumber);
      
      // Add signature data to the document if supported document type
      const documentWithSignature = {
        ...formData,
        signature: getSupportedDocumentTypes().includes(documentType) && includeSignature ? {
          enabled: includeSignature,
          signatureId: selectedSignatureId,
          documentType: mapDocumentType(documentType)
        } : undefined
      };
      
      // USE UNIFIED DOCUMENT SERVICES INSTEAD OF DIRECT SAVE
      try {
        // If editing existing document, update it
        if (document?.id) {
          console.log('Updating existing document via unified services');
          // Use BusinessDocumentService for consistent handling
          const businessDocumentService = BusinessDocumentService.getInstance();
          
          // Update the document in storage
          await businessDocumentService.updateDocument?.(documentType, document.id, documentWithSignature) || 
            businessDocumentService.createDocument({
              documentType,
              items: documentWithSignature.items,
              customer: (documentWithSignature as any).customer,
              vendor: (documentWithSignature as any).vendor,
              notes: documentWithSignature.notes,
              terms: documentWithSignature.terms,
              dueDate: (documentWithSignature as any).dueDate,
              customFields: { signature: documentWithSignature.signature }
            });
        } else {
          // Create new document using unified services
          console.log('Creating new document via unified services');
          const businessDocumentService = BusinessDocumentService.getInstance();
          
          const createdDocument = await businessDocumentService.createDocument({
            documentType,
            items: documentWithSignature.items,
            customer: (documentWithSignature as any).customer,
            vendor: (documentWithSignature as any).vendor,
            notes: documentWithSignature.notes,
            terms: documentWithSignature.terms,
            dueDate: (documentWithSignature as any).dueDate,
            customFields: { signature: documentWithSignature.signature }
          });
          
          console.log('Document created successfully via unified services:', createdDocument.documentNumber);
          
          // Update the document with the created document data
          Object.assign(documentWithSignature, createdDocument);
        }
        
        console.log('Document processed successfully via unified services');
      } catch (unifiedError) {
        console.error('Error using unified services, falling back to direct save:', unifiedError);
        // Fallback to direct save if unified services fail
      }
      
      // Save the document (either via unified services or as fallback)
      onSave(documentWithSignature);
      
      console.log('Document saved successfully');
    } catch (error) {
      console.error('Error processing document:', error);
      // Still save the document even if inventory update fails
      console.log('Attempting to save document despite errors');
      onSave(formData);
    }
  };

  // Export functionality using unified document services
  const handleExport = async (format: 'pdf' | 'html' | 'print' | 'word' | 'excel' = 'pdf') => {
    if (!formData.documentNumber) {
      console.error('Document must be saved before export');
      return;
    }
    
    setIsExporting(true);
    
    try {
      console.log('Exporting document using unified services:', formData.documentNumber);
      
      // Add signature data to the document if supported document type
      const documentWithSignature = {
        ...formData,
        signature: getSupportedDocumentTypes().includes(documentType) && includeSignature ? {
          enabled: includeSignature,
          signatureId: selectedSignatureId,
          documentType: mapDocumentType(documentType)
        } : undefined
      };
      
      // Use the unified document services for export
      const businessDocumentService = BusinessDocumentService.getInstance();
      
      // Export using BusinessDocumentService
      await businessDocumentService.exportDocument(
        documentWithSignature.id || formData.id,
        documentType,
        {
          format,
          filename: `${documentWithSignature.documentNumber}`,
          includeLogo: true,
          includeSignature: includeSignature,
          colorMode: 'color'
        }
      );
      
      console.log('Document exported successfully via unified services');
      
    } catch (error) {
      console.error('Error exporting document:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background",
      isMobile ? "p-3" : "p-6"
    )}>
      <div className={cn(
        "mx-auto",
        isMobile ? "max-w-full" : "max-w-4xl"
      )}>
        <DocumentFormHeader
          documentType={documentType}
          document={document}
          userSettings={userSettings}
          onUserSettingsUpdate={handleUserSettingsUpdate}
          onCancel={onCancel}
          onSubmit={handleSubmit}
          showSettings={!hideSettings}
          onExport={handleExport}
          isExporting={isExporting}
        />

        <form onSubmit={handleSubmit}>
          <DocumentFormContent
            documentType={documentType}
            formData={formData}
            onFormDataUpdate={handleFormDataUpdate}
            setFormData={setFormData}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
            onItemsChange={handleItemsChange}
          />
          
          {/* Signature Section */}
          {getSupportedDocumentTypes().includes(documentType) && (
            <Card className={cn(
              isMobile ? "mt-4" : "mt-6"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isMobile ? "text-lg" : ""
                )}>
                  <FileSignature className={cn(
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                  Document Signature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DepartmentSignatureSelector
                  documentType={mapDocumentType(documentType)}
                  selectedSignatureId={selectedSignatureId}
                  onSignatureChange={setSelectedSignatureId}
                  showSignature={includeSignature}
                  onShowSignatureChange={setIncludeSignature}
                />
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default BusinessDocumentForm;
