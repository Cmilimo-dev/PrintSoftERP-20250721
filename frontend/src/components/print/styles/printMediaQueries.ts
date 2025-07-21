
export const getPrintMediaQueries = () => `
  @page {
    size: A4;
    margin: 15mm 20mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    
    body { 
      margin: 0 !important; 
      padding: 0 !important; 
      font-size: 10px !important;
      background: white !important;
      font-family: 'Arial', 'Helvetica', sans-serif !important;
      line-height: 1.4 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .print-content { 
      margin: 0 !important; 
      padding: 0 !important; 
      box-shadow: none !important; 
      max-width: none !important;
      width: 100% !important;
      min-height: auto !important;
      background: white !important;
      position: relative !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Header Section */
    .header-section {
      display: flex !important;
      justify-content: space-between !important;
      align-items: flex-start !important;
      margin-bottom: 20px !important;
      border-bottom: 2px solid #2d3748 !important;
      padding-bottom: 12px !important;
      page-break-inside: avoid !important;
      position: relative !important;
      z-index: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .company-info {
      flex: 1 !important;
      padding-right: 15px !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .company-name {
      font-size: 16px !important;
      font-weight: bold !important;
      color: #2d3748 !important;
      margin-bottom: 6px !important;
      line-height: 1.2 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .company-details {
      font-size: 9px !important;
      color: #4a5568 !important;
      line-height: 1.4 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .po-info {
      text-align: right !important;
      flex: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .po-title {
      font-size: 20px !important;
      font-weight: bold !important;
      color: #4a5568 !important;
      margin-bottom: 8px !important;
      line-height: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .po-details {
      font-size: 9px !important;
      color: #2d3748 !important;
      line-height: 1.4 !important;
      margin-bottom: 12px !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .po-details div {
      margin-bottom: 2px !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* QR Code positioning */
    .flex.justify-end {
      display: flex !important;
      justify-content: flex-end !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Vendor/Customer Sections */
    .vendor-section {
      margin-bottom: 15px !important;
      page-break-inside: avoid !important;
      position: relative !important;
      z-index: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .section-header {
      background-color: #f7fafc !important;
      padding: 6px 10px !important;
      border: 1px solid #e2e8f0 !important;
      font-weight: bold !important;
      font-size: 10px !important;
      color: #2d3748 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .vendor-content {
      padding: 10px !important;
      border: 1px solid #e2e8f0 !important;
      border-top: none !important;
      font-size: 9px !important;
      background: white !important;
      line-height: 1.4 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .vendor-name {
      font-weight: bold !important;
      margin-bottom: 6px !important;
      color: #2d3748 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Items Table */
    .items-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 12px 0 !important;
      table-layout: fixed !important;
      border: 1px solid #2d3748 !important;
      page-break-inside: avoid !important;
      position: relative !important;
      z-index: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .items-table th {
      background-color: #4a5568 !important;
      color: white !important;
      padding: 6px 4px !important;
      text-align: left !important;
      font-size: 9px !important;
      font-weight: bold !important;
      border: 1px solid #2d3748 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .items-table td {
      padding: 5px 4px !important;
      border: 1px solid #cbd5e0 !important;
      font-size: 8px !important;
      vertical-align: top !important;
      background: white !important;
      line-height: 1.3 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .items-table tr:nth-child(even) td {
      background-color: #f7fafc !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .item-code {
      font-weight: bold !important;
      color: #2d3748 !important;
      margin-bottom: 2px !important;
      background: inherit !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .item-description {
      color: #4a5568 !important;
      font-size: 8px !important;
      background: inherit !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Column widths */
    .col-ln { width: 8% !important; }
    .col-desc { width: 45% !important; }
    .col-qty { width: 12% !important; }
    .col-price { width: 15% !important; }
    .col-total { width: 20% !important; }
    
    /* Totals Section */
    .totals-section {
      margin-top: 15px !important;
      display: flex !important;
      justify-content: flex-end !important;
      page-break-inside: avoid !important;
      clear: both !important;
      position: relative !important;
      z-index: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .totals-table {
      width: 280px !important;
      border-collapse: collapse !important;
      border: 2px solid #000000 !important;
      background: white !important;
      position: relative !important;
      z-index: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .totals-table td {
      padding: 8px 12px !important;
      border: 1px solid #000000 !important;
      font-size: 10px !important;
      background: white !important;
      position: relative !important;
      z-index: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .totals-label {
      background-color: #f7fafc !important;
      font-weight: bold !important;
      text-align: right !important;
      width: 60% !important;
      color: #2d3748 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .totals-amount {
      text-align: right !important;
      width: 40% !important;
      background: white !important;
      color: #2d3748 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .total-final {
      background-color: #2d3748 !important;
      color: white !important;
      font-weight: bold !important;
      font-size: 11px !important;
      border: 1px solid #1a202c !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Footer Sections */
    .footer-section {
      display: flex !important;
      justify-content: space-between !important;
      gap: 15px !important;
      margin: 20px 0 15px 0 !important;
      page-break-inside: avoid !important;
      position: relative !important;
      z-index: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .signature-column {
      flex: 1 !important;
      background: white !important;
      position: relative !important;
      z-index: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .section-title {
      font-weight: bold !important;
      font-size: 11px !important;
      color: #2d3748 !important;
      margin-bottom: 8px !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .notes-section {
      margin: 15px 0 !important;
      background: white !important;
      position: relative !important;
      z-index: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .page-footer {
      margin-top: 20px !important;
      background: white !important;
      position: relative !important;
      z-index: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Document-specific sections */
    .payment-receipt-section,
    .delivery-note-section,
    .financial-report-section {
      margin-bottom: 15px !important;
      page-break-inside: avoid !important;
      position: relative !important;
      z-index: 1 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .payment-details,
    .delivery-info,
    .financial-summary {
      margin-bottom: 12px !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .payment-content,
    .delivery-content,
    .financial-content {
      padding: 10px !important;
      border: 1px solid #000 !important;
      border-top: none !important;
      font-size: 9px !important;
      background: white !important;
      line-height: 1.4 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Ensure all text elements preserve colors */
    .text-gray-800, .print\\:text-gray-800 {
      color: #2d3748 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .text-gray-700, .print\\:text-gray-700 {
      color: #4a5568 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .text-gray-600, .print\\:text-gray-600 {
      color: #718096 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .bg-gray-100, .print\\:bg-gray-100 {
      background-color: #f7fafc !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .bg-gray-200, .print\\:bg-gray-200 {
      background-color: #edf2f7 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .bg-gray-700, .print\\:bg-gray-700 {
      background-color: #4a5568 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .border-gray-800, .print\\:border-gray-800 {
      border-color: #2d3748 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .border-gray-300, .print\\:border-gray-300 {
      border-color: #e2e8f0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .text-white, .print\\:text-white {
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .bg-white, .print\\:bg-white {
      background-color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Utility classes for print */
    .print\\:hidden {
      display: none !important;
    }
    
    .print\\:block {
      display: block !important;
    }
    
    .print\\:flex {
      display: flex !important;
    }
    
    .print\\:mb-5 {
      margin-bottom: 20px !important;
    }
    
    .print\\:mb-4 {
      margin-bottom: 16px !important;
    }
    
    .print\\:mb-3 {
      margin-bottom: 12px !important;
    }
    
    .print\\:mb-2 {
      margin-bottom: 8px !important;
    }
    
    .print\\:mb-1 {
      margin-bottom: 4px !important;
    }
    
    .print\\:p-1 {
      padding: 4px !important;
    }
    
    .print\\:px-3 {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
    
    .print\\:py-2 {
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }
    
    .print\\:text-xs {
      font-size: 12px !important;
    }
    
    .print\\:text-base {
      font-size: 16px !important;
    }
    
    /* Grid layouts */
    .grid {
      display: grid !important;
    }
    
    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    
    .gap-6 {
      gap: 24px !important;
    }
    
    .gap-4 {
      gap: 16px !important;
    }
    
    /* Flexbox utilities */
    .flex {
      display: flex !important;
    }
    
    .justify-between {
      justify-content: space-between !important;
    }
    
    .justify-end {
      justify-content: flex-end !important;
    }
    
    .items-start {
      align-items: flex-start !important;
    }
    
    .items-center {
      align-items: center !important;
    }
    
    /* Ensure proper page breaks */
    .header-section,
    .vendor-section,
    .items-table,
    .totals-section,
    .footer-section {
      page-break-inside: avoid !important;
    }
    
    /* Reset any transform or positioning that might cause issues */
    * {
      transform: none !important;
    }
    
    .totals-section *,
    .header-section *,
    .vendor-section *,
    .footer-section * {
      position: relative !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;
