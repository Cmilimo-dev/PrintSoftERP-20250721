import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, FileSignature } from 'lucide-react';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';

interface SignatureSelectorProps {
  signatures: AuthorizedSignature[];
  signatureSettings: SignatureSettings;
  selectedSignatureId?: string;
  onSignatureChange: (signatureId: string | undefined) => void;
  showSignature: boolean;
  onShowSignatureChange: (show: boolean) => void;
  className?: string;
}

export const SignatureSelector: React.FC<SignatureSelectorProps> = ({
  signatures,
  signatureSettings,
  selectedSignatureId,
  onSignatureChange,
  showSignature,
  onShowSignatureChange,
  className = ''
}) => {
  const availableSignatures = signatures;
  const defaultSignature = signatures.find(sig => sig.isDefault);

  // If signature settings are disabled globally, don't show the selector
  if (!signatureSettings.enabled) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <FileSignature className="w-4 h-4 text-gray-500" />
        <Label className="text-sm font-medium">Document Signature</Label>
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
      {showSignature && availableSignatures.length > 0 && (
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
              {availableSignatures.map((signature) => (
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
                      {signature.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded ml-2">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* No signatures available message */}
      {showSignature && availableSignatures.length === 0 && (
        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>No authorized signatures available.</span>
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
export const CompactSignatureSelector: React.FC<SignatureSelectorProps> = ({
  signatures,
  signatureSettings,
  selectedSignatureId,
  onSignatureChange,
  showSignature,
  onShowSignatureChange,
  className = ''
}) => {
  const availableSignatures = signatures;
  const defaultSignature = signatures.find(sig => sig.isDefault);

  if (!signatureSettings.enabled) {
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

      {showSignature && availableSignatures.length > 0 && (
        <Select
          value={selectedSignatureId || defaultSignature?.id || ''}
          onValueChange={(value) => onSignatureChange(value || undefined)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select signer..." />
          </SelectTrigger>
          <SelectContent>
            {availableSignatures.map((signature) => (
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
