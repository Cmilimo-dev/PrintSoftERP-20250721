import React, { useState, useEffect } from 'react';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';
import { DepartmentSignatureService, DocumentType } from '@/services/departmentSignatureService';
import './signature-styles.css';

interface EnhancedDocumentSignatureProps {
  documentType: DocumentType;
  signatureId?: string;
  selectedSignatureId?: string;
  showDate?: boolean;
  customDate?: string;
  className?: string;
  showPrintLayout?: boolean;
}

export const EnhancedDocumentSignature: React.FC<EnhancedDocumentSignatureProps> = ({
  documentType,
  signatureId,
  selectedSignatureId,
  showDate = true,
  customDate,
  className = '',
  showPrintLayout = false
}) => {
  const [signatureData, setSignatureData] = useState<{
    signature: AuthorizedSignature | null;
    settings: SignatureSettings;
    isEnabled: boolean;
  }>({ signature: null, settings: {} as SignatureSettings, isEnabled: false });

  // Load signature data and listen for updates
  useEffect(() => {
    const loadSignatureData = () => {
      const activeSignatureId = signatureId || selectedSignatureId;
      const data = DepartmentSignatureService.getDocumentSignatureData(documentType, activeSignatureId);
      console.log(`🔄 Loading signature data for ${documentType} with ID ${activeSignatureId}:`, data);
      setSignatureData(data);
    };

    loadSignatureData();

    // Subscribe to signature changes for real-time updates
    const unsubscribe = DepartmentSignatureService.onSignatureChange(() => {
      console.log(`🔄 Signature changed for ${documentType}, reloading...`);
      loadSignatureData();
    });

    return unsubscribe;
  }, [documentType, signatureId, selectedSignatureId]);

  const currentDate = customDate || new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getPositionClass = () => {
    switch (signatureData.settings.signaturePosition) {
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

  if (!signatureData.isEnabled || !signatureData.signature) {
    return null;
  }

  const signature = signatureData.signature;
  const settings = signatureData.settings;

  return (
    <div className={`mt-8 ${getPositionClass()} ${className} signature-container`}>
      <div className="inline-block min-w-[280px] text-center">
        {/* Header: AUTHORIZED SIGNATURE */}
        <div className="authorized-signature-header">
          AUTHORIZED SIGNATURE
        </div>

        {/* Title/Department Label */}
        {settings.showTitle && signature.title && (
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
        {settings.showName && (
          <div className="signature-name">
            {signature.name}
          </div>
        )}

        {/* Title */}
        {settings.showTitle && signature.title && (
          <div className="signature-title">
            {signature.title}
          </div>
        )}

        {/* Department */}
        {signature.department && (
          <div className="signature-department text-xs text-gray-500 mt-1">
            {signature.department} Department
          </div>
        )}

        {/* Date */}
        {settings.showDate && showDate && (
          <div className="signature-date">
            Date: {currentDate}
          </div>
        )}
      </div>
    </div>
  );
};
