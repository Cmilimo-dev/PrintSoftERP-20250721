
import React from 'react';

interface SignatureSectionProps {
  companyName: string;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ companyName }) => {
  return (
    <div className="signature-column flex-1 relative z-[100] bg-white print:z-[100]">
      <div className="section-title font-bold mb-2 text-xs text-gray-800 print:mb-1 relative z-[100] bg-white">
        Authorized By:
      </div>
      <div className="signature-area relative z-[100] bg-white">
        <div className="signature-line border-t border-gray-800 pt-1 text-xs w-44 mt-8 print:w-36 print:mt-6 relative z-[100] bg-white">
          <div className="mb-1 relative z-[100] bg-white">Sincerely,</div>
          <div className="font-semibold relative z-[100] bg-white">{companyName}</div>
        </div>
        {/* APPROVED PO watermark positioned after Authorized By */}
        <div 
          className="absolute top-16 left-8 transform rotate-12 text-xl font-bold pointer-events-none select-none text-gray-300 print:text-lg print:top-12 print:left-4"
          style={{
            color: 'rgba(0,0,0,0.08)',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            zIndex: 1
          }}
        >
          APPROVED PO
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
