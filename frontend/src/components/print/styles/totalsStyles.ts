
export const getTotalsStyles = () => `
  .totals-section { 
    margin-top: 20px; 
    display: flex; 
    justify-content: flex-end; 
    position: relative;
    z-index: 1;
    background: white;
    page-break-inside: avoid;
    clear: both;
  }
  
  /* Table-based totals styling (legacy) */
  .totals-table { 
    width: 300px; 
    border-collapse: collapse; 
    border: 2px solid #000000;
    background: white;
    position: relative;
    z-index: 1;
  }
  
  .totals-table td { 
    padding: 10px 15px; 
    border: 1px solid #000000; 
    font-size: 11px; 
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    position: relative;
    z-index: 1;
  }
  
  /* Flexible div-based totals styling (new) */
  .totals-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 300px;
    border: 1px solid #e2e8f0;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    position: relative;
    z-index: 1;
  }
  
  .totals-row.subtotal,
  .totals-row.tax {
    border-bottom: 1px solid #e2e8f0;
  }
  
  .totals-row.total {
    background: #2b6cb0;
    color: white;
    font-weight: bold;
    border: 1px solid #2b6cb0;
  }
  
  .totals-row.total .totals-label,
  .totals-row.total .totals-amount {
    background: #2b6cb0;
    color: white;
  }
  
  /* Label and amount styling (works for both table and div) */
  .totals-label { 
    background-color: #f7fafc; 
    font-weight: bold; 
    text-align: right; 
    width: 60%;
    padding: 10px 15px;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color: #2d3748;
    z-index: 1;
    border-right: 1px solid #e2e8f0;
  }
  
  .totals-amount { 
    text-align: right; 
    width: 40%;
    padding: 10px 15px;
    font-size: 11px;
    background: white;
    color: #2d3748;
    z-index: 1;
  }
  
  /* Final total row styling (works for both table and div) */
  .total-final { 
    background-color: #2d3748; 
    color: white; 
    font-weight: bold; 
    font-size: 12px;
    padding: 10px 15px;
    border: 1px solid #1a202c;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    z-index: 1;
  }
  
  /* Print-specific adjustments */
  @media print {
    .totals-section {
      margin-top: 15px;
    }
    
    .totals-row {
      border: 1px solid #666;
    }
    
    .totals-label,
    .totals-amount {
      padding: 8px 12px;
      font-size: 10px;
    }
    
    .totals-row.total {
      background: #2b6cb0 !important;
      color: white !important;
    }
    
    .total-final {
      background: #2b6cb0 !important;
      color: white !important;
      font-size: 10px;
      padding: 8px 12px;
    }
  }
  
  /* Responsive adjustments */
  @media only screen and (max-width: 768px) {
    .totals-section {
      justify-content: center;
      margin: 20px 0;
    }
    
    .totals-row,
    .totals-table {
      min-width: 280px;
      width: 100%;
      max-width: 320px;
    }
    
    .totals-label,
    .totals-amount,
    .totals-table td {
      font-size: 12px;
      padding: 12px 10px;
    }
  }
`;
