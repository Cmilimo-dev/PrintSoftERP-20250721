import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';
import { SignatureService } from './signatureService';

/**
 * Department-based signature service
 * Maps document types to departments and filters signatures accordingly
 */
export type DocumentType = 'quotation' | 'sales_order' | 'invoice' | 'purchase_order' | 'vendor_invoice' | 'payment_receipt';
export type DepartmentType = 'Sales' | 'Finance' | 'Purchasing' | 'Operations' | 'Executive' | 'Quality';

/**
 * Mapping of document types to their responsible departments
 */
export const DOCUMENT_DEPARTMENT_MAPPING: Record<DocumentType, DepartmentType[]> = {
  quotation: ['Sales'],
  sales_order: ['Sales'],
  invoice: ['Finance'],
  purchase_order: ['Purchasing'],
  vendor_invoice: ['Purchasing'],
  payment_receipt: ['Finance'] // Payment receipts are handled by Finance department
};

export class DepartmentSignatureService {
  /**
   * Get signatures for a specific document type based on department
   */
  static getSignaturesForDocument(documentType: DocumentType): AuthorizedSignature[] {
    const allSignatures = SignatureService.getSignatures();
    const allowedDepartments = DOCUMENT_DEPARTMENT_MAPPING[documentType];
    
    // Filter signatures by department
    const departmentSignatures = allSignatures.filter(signature => 
      signature.department && allowedDepartments.includes(signature.department as DepartmentType)
    );

    // If no department-specific signatures found, allow all signatures as fallback
    return departmentSignatures.length > 0 ? departmentSignatures : allSignatures;
  }

  /**
   * Get the default signature for a specific document type
   */
  static getDefaultSignatureForDocument(documentType: DocumentType): AuthorizedSignature | undefined {
    const signatures = this.getSignaturesForDocument(documentType);
    
    // First try to find department-specific default
    const departmentDefault = signatures.find(sig => sig.isDefault);
    if (departmentDefault) {
      return departmentDefault;
    }

    // If no department default, return first available signature
    return signatures[0];
  }

  /**
   * Get signature settings (same for all documents)
   */
  static getSignatureSettings(): SignatureSettings {
    return SignatureService.getSignatureSettings();
  }

  /**
   * Check if signatures should be shown for a document type
   */
  static shouldShowSignatureForDocument(documentType: DocumentType, showSignatureOnDocument: boolean = true): boolean {
    const settings = this.getSignatureSettings();
    const availableSignatures = this.getSignaturesForDocument(documentType);
    
    return settings.enabled && 
           settings.showOnDocuments && 
           showSignatureOnDocument && 
           availableSignatures.length > 0;
  }

  /**
   * Get signature data for document display with department filtering
   */
  static getDocumentSignatureData(documentType: DocumentType, selectedSignatureId?: string): {
    signature: AuthorizedSignature | null;
    settings: SignatureSettings;
    isEnabled: boolean;
    availableSignatures: AuthorizedSignature[];
  } {
    const settings = this.getSignatureSettings();
    const availableSignatures = this.getSignaturesForDocument(documentType);

    if (!this.shouldShowSignatureForDocument(documentType, true)) {
      return {
        signature: null,
        settings,
        isEnabled: false,
        availableSignatures: []
      };
    }

    let signature: AuthorizedSignature | undefined;

    if (selectedSignatureId) {
      // Use selected signature if provided and available for this document type
      signature = availableSignatures.find(sig => sig.id === selectedSignatureId);
    }

    // Fall back to default signature for this document type
    if (!signature) {
      signature = this.getDefaultSignatureForDocument(documentType);
    }

    return {
      signature: signature || null,
      settings,
      isEnabled: !!signature,
      availableSignatures
    };
  }

  /**
   * Get department name for a document type
   */
  static getDepartmentForDocument(documentType: DocumentType): DepartmentType[] {
    return DOCUMENT_DEPARTMENT_MAPPING[documentType];
  }

  /**
   * Get all document types for a department
   */
  static getDocumentTypesForDepartment(department: DepartmentType): DocumentType[] {
    return Object.entries(DOCUMENT_DEPARTMENT_MAPPING)
      .filter(([_, deps]) => deps.includes(department))
      .map(([docType, _]) => docType as DocumentType);
  }

  /**
   * Subscribe to signature changes (for real-time updates)
   */
  static onSignatureChange(callback: () => void): () => void {
    // Listen for storage changes to detect signature updates
    const handler = (e: StorageEvent) => {
      if (e.key === 'system_settings') {
        console.log('🔄 Signature settings changed, refreshing...');
        callback();
      }
    };

    // Also listen for custom events for same-window updates
    const customHandler = (e: CustomEvent) => {
      console.log('🔄 Custom signature change event detected');
      callback();
    };

    window.addEventListener('storage', handler);
    window.addEventListener('signatureUpdated', customHandler as EventListener);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('signatureUpdated', customHandler as EventListener);
    };
  }

  /**
   * Trigger signature change event for same-window updates
   */
  static triggerSignatureChange(): void {
    console.log('🔔 Triggering signature change event');
    window.dispatchEvent(new CustomEvent('signatureUpdated'));
  }
}
