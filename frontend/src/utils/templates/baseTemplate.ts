
export const createBaseTemplate = (content: string, title: string, documentNumber: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} ${documentNumber}</title>
      <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(#bgGradient)"/><path d="M8 6h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6v8h-4V6zm4 4v6h6c1.1 0 2-.9 2-2s-.9-2-2-2h-6z" fill="#ffffff"/></svg>`)}" />
      <style>
        @page {
          size: A4;
          margin: 12mm;
        }
        
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
          padding: 0;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .document-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          padding: 20px;
          min-height: 297mm;
        }
        
        @media print {
          body { margin: 0; padding: 0; font-size: 10px; }
          .document-container { margin: 0; padding: 0; max-width: none; width: 100%; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="document-container">
        ${content}
      </div>
    </body>
    </html>
  `;
};
