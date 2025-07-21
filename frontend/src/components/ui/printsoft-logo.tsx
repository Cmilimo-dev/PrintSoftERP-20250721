import React from 'react';

interface PrintSoftLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const PrintSoftLogo: React.FC<PrintSoftLogoProps> = ({ 
  size = 32, 
  className = "",
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 32 32" 
        width={size} 
        height={size}
        className="flex-shrink-0"
      >
        {/* Solid blue background */}
        <rect width="32" height="32" rx="4" fill="#2563eb"/>
        {/* Letter P - larger and bolder */}
        <text 
          x="16" 
          y="23" 
          fontSize="20" 
          fontWeight="bold" 
          textAnchor="middle" 
          fill="white" 
          fontFamily="Arial, sans-serif"
        >
          P
        </text>
      </svg>
      {showText && (
        <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          PrintSoft
        </span>
      )}
    </div>
  );
};

// Alternative version for documents/print with different styling
export const PrintSoftLogoPrint: React.FC<PrintSoftLogoProps> = ({ 
  size = 24, 
  className = "" 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 32 32" 
      width={size} 
      height={size}
      className={className}
    >
      {/* Solid blue background */}
      <rect width="32" height="32" rx="4" fill="#2563eb"/>
      {/* Letter P - larger and bolder */}
      <text 
        x="16" 
        y="23" 
        fontSize="20" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="white" 
        fontFamily="Arial, sans-serif"
      >
        P
      </text>
    </svg>
  );
};

export default PrintSoftLogo;
