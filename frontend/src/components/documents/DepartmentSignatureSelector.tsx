import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, FileSignature, Building2 } from 'lucide-react';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';
import { DepartmentSignatureService, DocumentType } from '@/services/departmentSignatureService';

interface DepartmentSignatureSelectorProps {
  documentType: DocumentType;
  selectedSignatureId?: string;
  onSignatureChange: (signatureId: string | undefined) => void;
  showSignature: boolean;
  onShowSignatureChange: (show: boolean) => void;
  className?: string;
}

export const DepartmentSignatureSelector: React.FC<DepartmentSignatureSelectorProps> = ({
  documentType,
  selectedSignatureId,
  onSignatureChange,
  showSignature,
  onShowSignatureChange,
  className = ''
}) => {
  const [signatures, setSignatures] = useState<AuthorizedSignature[]>([]);
  const [signatureSettings, setSignatureSettings] = useState<SignatureSettings | null>(null);
  const [defaultSignature, setDefaultSignature] = useState<AuthorizedSignature | undefined>();

  // Load signatures for this document type
  useEffect(() => {
    const loadSignatures = () => {
      const availableSignatures = DepartmentSignatureService.getSignaturesForDocument(documentType);
      const settings = DepartmentSignatureService.getSignatureSettings();
      const defaultSig = DepartmentSignatureService.getDefaultSignatureForDocument(documentType);
      
      setSignatures(availableSignatures);
      setSignatureSettings(settings);
      setDefaultSignature(defaultSig);
    };

    loadSignatures();

    // Subscribe to signature changes for real-time updates
    const unsubscribe = DepartmentSignatureService.onSignatureChange(loadSignatures);
    
    return unsubscribe;
  }, [documentType]);

  // Auto-select default signature if none selected
  useEffect(() => {
    if (!selectedSignatureId && defaultSignature && showSignature) {
      onSignatureChange(defaultSignature.id);
    }
  }, [selectedSignatureId, defaultSignature, showSignature, onSignatureChange]);

  // Get department names for this document type
  const departments = DepartmentSignatureService.getDepartmentForDocument(documentType);

  // If signature settings are disabled globally, don't show the selector
  if (!signatureSettings?.enabled) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <FileSignature className="w-4 h-4 text-gray-500" />
        <Label className="text-sm font-medium">
          Document Signature ({departments.join(', ')} Department)
        </Label>
      </div>

      {/* Toggle to show/hide signature on this document */}
      <div className="flex items-center space-x-3">
        <Switch
          checked={showSignature}
          onCheckedChange={onShowSignatureChange}
        />
        <span className="text-sm text-gray-700">
          Include signature on this document
        </span>
      </div>

      {/* Signature selector - only show if signatures are enabled for this document */}
      {showSignature && signatures.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="signature-select" className="text-sm text-gray-600">
            Select Authorized Signer
          </Label>
          <Select
            value={selectedSignatureId || defaultSignature?.id || ''}
            onValueChange={(value) => onSignatureChange(value || undefined)}
          >
            <SelectTrigger id="signature-select">
              <SelectValue placeholder="Choose signature..." />
            </SelectTrigger>
            <SelectContent>
              {signatures.map((signature) => (
                <SelectItem key={signature.id} value={signature.id}>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="font-medium">{signature.name}</span>
                      {signature.title && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({signature.title})
                        </span>
                      )}
                      {signature.department && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded ml-2">
                          <Building2 className="w-3 h-3 inline mr-1" />
                          {signature.department}
                        </span>
                      )}
                      {signature.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-1 rounded ml-2">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Show signature count and departments */}
          <div className="text-xs text-gray-500">
            {signatures.length} signature{signatures.length !== 1 ? 's' : ''} available for {departments.join(', ')} department{departments.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* No signatures available message */}
      {showSignature && signatures.length === 0 && (
        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>No authorized signatures available for {departments.join(', ')} department.</span>
          </div>
          <p className="text-xs mt-1">
            Configure signatures in System Settings to enable document signing.
          </p>
        </div>
      )}
    </div>
  );
};

// Compact version for use in smaller forms
export const CompactDepartmentSignatureSelector: React.FC<DepartmentSignatureSelectorProps> = ({
  documentType,
  selectedSignatureId,
  onSignatureChange,
  showSignature,
  onShowSignatureChange,
  className = ''
}) => {
  const [signatures, setSignatures] = useState<AuthorizedSignature[]>([]);
  const [signatureSettings, setSignatureSettings] = useState<SignatureSettings | null>(null);
  const [defaultSignature, setDefaultSignature] = useState<AuthorizedSignature | undefined>();

  useEffect(() => {
    const loadSignatures = () => {
      const availableSignatures = DepartmentSignatureService.getSignaturesForDocument(documentType);
      const settings = DepartmentSignatureService.getSignatureSettings();
      const defaultSig = DepartmentSignatureService.getDefaultSignatureForDocument(documentType);
      
      setSignatures(availableSignatures);
      setSignatureSettings(settings);
      setDefaultSignature(defaultSig);
    };

    loadSignatures();
    const unsubscribe = DepartmentSignatureService.onSignatureChange(loadSignatures);
    return unsubscribe;
  }, [documentType]);

  if (!signatureSettings?.enabled) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Switch
          checked={showSignature}
          onCheckedChange={onShowSignatureChange}
        />
        <Label className="text-sm">Signature</Label>
      </div>

      {showSignature && signatures.length > 0 && (
        <Select
          value={selectedSignatureId || defaultSignature?.id || ''}
          onValueChange={(value) => onSignatureChange(value || undefined)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select signer..." />
          </SelectTrigger>
          <SelectContent>
            {signatures.map((signature) => (
              <SelectItem key={signature.id} value={signature.id}>
                {signature.name}
                {signature.isDefault && (
                  <span className="text-xs text-blue-600 ml-1">(Default)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
