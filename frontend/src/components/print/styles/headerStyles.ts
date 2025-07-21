
export const getHeaderStyles = () => `
  .header-section { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
    margin-bottom: 25px; 
    border-bottom: 2px solid #2d3748; 
    padding-bottom: 15px; 
    position: relative;
    z-index: 10;
    background: white;
  }
  
  .company-info { 
    flex: 1; 
    padding-right: 20px;
  }
  
  .company-name { 
    font-size: 18px; 
    font-weight: bold; 
    color: #2d3748; 
    margin-bottom: 8px; 
    line-height: 1.2;
  }
  
  .company-details { 
    font-size: 10px; 
    color: #4a5568; 
    line-height: 1.5; 
  }
  
  .po-info { 
    text-align: right; 
    flex: 1; 
  }
  
  .po-title { 
    font-size: 24px; 
    font-weight: bold; 
    color: #4a5568; 
    margin-bottom: 10px; 
    line-height: 1;
  }
  
  .po-details { 
    font-size: 10px; 
    color: #2d3748; 
    line-height: 1.6;
  }
  
  .po-details div {
    margin-bottom: 2px;
  }
`;
