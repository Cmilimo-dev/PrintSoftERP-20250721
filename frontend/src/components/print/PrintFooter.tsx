
import React from 'react';

interface PrintFooterProps {
  documentNumber: string;
  qrCodeData?: string;
}

const PrintFooter: React.FC<PrintFooterProps> = ({ documentNumber, qrCodeData }) => {
  return (
    <div className="page-footer text-center pt-3 border-t border-gray-300 text-xs text-gray-500 print:text-xs print:pt-2 relative z-10">
      <p>© Created in Priority - Priority Software Ltd.</p>
      <p>Generated on {new Date().toLocaleDateString('en-GB')} | Document: {documentNumber} | QR: {qrCodeData}</p>
    </div>
  );
};

export default PrintFooter;
