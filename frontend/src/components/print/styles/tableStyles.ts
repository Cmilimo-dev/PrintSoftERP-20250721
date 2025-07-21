
export const getTableStyles = () => `
  .items-table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 15px 0; 
    table-layout: fixed;
    border: 1px solid #2d3748;
    position: relative;
    z-index: 10;
    background: white;
  }
  
  .items-table th { 
    background-color: #4a5568; 
    color: white; 
    padding: 10px 6px; 
    text-align: left; 
    font-size: 10px; 
    font-weight: bold; 
    border: 1px solid #2d3748; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .items-table td { 
    padding: 8px 6px; 
    border: 1px solid #cbd5e0; 
    font-size: 9px; 
    vertical-align: top;
    background: white;
  }
  
  .items-table tr:nth-child(even) td { 
    background-color: #f7fafc; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .col-ln { width: 8%; }
  .col-desc { width: 45%; }
  .col-qty { width: 12%; }
  .col-price { width: 15%; }
  .col-total { width: 20%; }
  
  .item-code {
    font-weight: normal;
    color: #6b7280;
    font-size: 8px;
    display: inline;
    margin-right: 8px;
  }
  
  .item-description {
    color: #2d3748;
    font-size: 11px;
    font-weight: bold;
    display: inline;
  }
`;
