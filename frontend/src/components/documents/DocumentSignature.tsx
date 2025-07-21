import React from 'react';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';
import './signature-styles.css';

interface DocumentSignatureProps {
  signature: AuthorizedSignature;
  signatureSettings: SignatureSettings;
  showDate?: boolean;
  customDate?: string;
  className?: string;
}

export const DocumentSignature: React.FC<DocumentSignatureProps> = ({
  signature,
  signatureSettings,
  showDate = true,
  customDate,
  className = ''
}) => {
  const currentDate = customDate || new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getPositionClass = () => {
    switch (signatureSettings.signaturePosition) {
      case 'bottom-left':
        return 'text-left';
      case 'bottom-center':
        return 'text-center';
      case 'bottom-right':
        return 'text-right';
      default:
        return 'text-right';
    }
  };

  if (!signatureSettings.enabled || !signatureSettings.showOnDocuments) {
    return null;
  }

  return (
    <div className={`mt-8 ${getPositionClass()} ${className} signature-container`}>
      <div className="inline-block min-w-[280px] text-center">
        {/* Header: AUTHORIZED SIGNATURE */}
        <div className="authorized-signature-header">
          AUTHORIZED SIGNATURE
        </div>

        {/* Title/Department Label */}
        {signatureSettings.showTitle && signature.title && (
          <div className="signature-role">
            {signature.title} Signature
          </div>
        )}

        {/* Signature Image or Text */}
        <div className="mb-4 min-h-[50px] flex items-center justify-center">
          {signature.signatureImageUrl ? (
            <img
              src={signature.signatureImageUrl}
              alt={`${signature.name} signature`}
              className="signature-image"
            />
          ) : signature.signatureText ? (
            <div className="signature-script text-xl text-gray-800">
              {signature.signatureText}
            </div>
          ) : (
            <div className="signature-script text-xl text-gray-600">
              {signature.name.split(' ').map(name => name[0]).join('. ') + '.'}
            </div>
          )}
        </div>

        {/* Horizontal line */}
        <div className="signature-line mb-3"></div>

        {/* Name */}
        {signatureSettings.showName && (
          <div className="signature-name">
            {signature.name}
          </div>
        )}

        {/* Title */}
        {signatureSettings.showTitle && signature.title && (
          <div className="signature-title">
            {signature.title}
          </div>
        )}

        {/* Date */}
        {signatureSettings.showDate && showDate && (
          <div className="signature-date">
            Date: {currentDate}
          </div>
        )}
      </div>
    </div>
  );
};

interface DocumentSignatureSectionProps {
  signatures: AuthorizedSignature[];
  signatureSettings: SignatureSettings;
  selectedSignatureId?: string;
  showDate?: boolean;
  customDate?: string;
  className?: string;
}

export const DocumentSignatureSection: React.FC<DocumentSignatureSectionProps> = ({
  signatures,
  signatureSettings,
  selectedSignatureId,
  showDate = true,
  customDate,
  className = ''
}) => {
  if (!signatureSettings.enabled || !signatureSettings.showOnDocuments) {
    return null;
  }

  // Determine which signature to display
  let signatureToShow: AuthorizedSignature | undefined;

  if (selectedSignatureId) {
    // Use selected signature if provided
    signatureToShow = signatures.find(sig => sig.id === selectedSignatureId);
  } else {
    // Use default signature if no specific one selected
    signatureToShow = signatures.find(sig => sig.isDefault);
  }

  if (!signatureToShow) {
    return null;
  }

  return (
    <DocumentSignature
      signature={signatureToShow}
      signatureSettings={signatureSettings}
      showDate={showDate}
      customDate={customDate}
      className={className}
    />
  );
};

// Utility hook for signature management in forms
export const useDocumentSignature = () => {
  const [selectedSignatureId, setSelectedSignatureId] = React.useState<string | undefined>();

  const getAvailableSignatures = (signatures: AuthorizedSignature[]) => {
    return signatures;
  };

  const getDefaultSignature = (signatures: AuthorizedSignature[]) => {
    return signatures.find(sig => sig.isDefault);
  };

  return {
    selectedSignatureId,
    setSelectedSignatureId,
    getAvailableSignatures,
    getDefaultSignature
  };
};
