
export const getBasePrintStyles = () => `
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  body { 
    font-family: 'Arial', 'Helvetica', sans-serif; 
    margin: 0; 
    padding: 15mm 20mm; 
    font-size: 11px; 
    line-height: 1.4; 
    color: #000;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .print-content { 
    max-width: 170mm; 
    margin: 0 auto; 
    background: white; 
    position: relative;
    min-height: 267mm;
    padding: 15mm 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  
  /* Consistent spacing */
  .mb-6 { margin-bottom: 24px; }
  .mb-5 { margin-bottom: 20px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-1 { margin-bottom: 4px; }
  
  .mt-6 { margin-top: 24px; }
  .mt-5 { margin-top: 20px; }
  .mt-4 { margin-top: 16px; }
  .mt-3 { margin-top: 12px; }
  .mt-2 { margin-top: 8px; }
  .mt-1 { margin-top: 4px; }
  
  .p-4 { padding: 16px; }
  .p-3 { padding: 12px; }
  .p-2 { padding: 8px; }
  .p-1 { padding: 4px; }
  
  .px-4 { padding-left: 16px; padding-right: 16px; }
  .px-3 { padding-left: 12px; padding-right: 12px; }
  .px-2 { padding-left: 8px; padding-right: 8px; }
  
  .py-3 { padding-top: 12px; padding-bottom: 12px; }
  .py-2 { padding-top: 8px; padding-bottom: 8px; }
  
  .flex { display: flex; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .items-start { align-items: flex-start; }
  .items-center { align-items: center; }
  
  .font-bold { font-weight: bold; }
  .font-semibold { font-weight: 600; }
  
  .text-2xl { font-size: 24px; }
  .text-xl { font-size: 20px; }
  .text-lg { font-size: 18px; }
  .text-base { font-size: 16px; }
  .text-sm { font-size: 14px; }
  .text-xs { font-size: 12px; }
  
  .border { border: 1px solid; }
  .border-2 { border: 2px solid; }
  .border-t-0 { border-top: 0; }
  .border-b-2 { border-bottom: 2px solid; }
  
  .relative { position: relative; }
  .absolute { position: absolute; }
  
  .w-full { width: 100%; }
  .w-80 { width: 320px; }
  .h-full { height: 100%; }
  
  .gap-6 { gap: 24px; }
  .gap-4 { gap: 16px; }
  .gap-2 { gap: 8px; }
  
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  
  .leading-relaxed { line-height: 1.625; }
  .leading-normal { line-height: 1.5; }
  
  /* Color utilities with print color adjustment */
  .text-gray-800 { 
    color: #2d3748; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .text-gray-700 { 
    color: #4a5568; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .text-gray-600 { 
    color: #718096; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-gray-100 { 
    background-color: #f7fafc; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-gray-700 { 
    background-color: #4a5568; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .border-gray-800 { 
    border-color: #2d3748; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .border-gray-300 { 
    border-color: #e2e8f0; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .text-white { 
    color: white; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-white { 
    background-color: white; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Z-index management */
  .z-10 { z-index: 10; }
  .z-\[200\] { z-index: 200; }
`;
