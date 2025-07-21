
export const getLayoutStyles = () => `
  .document-container {
    max-width: 170mm;
    margin: 0 auto;
    background: white;
    min-height: 267mm;
    position: relative;
    padding: 10mm 0;
    display: flex;
    flex-direction: column;
  }
  
  .content-section {
    margin-bottom: 20px;
    break-inside: avoid;
    page-break-inside: avoid;
    padding: 0 5mm;
  }
  
  .footer-section {
    position: relative;
    z-index: 100;
    background: white;
    margin-top: 25mm;
  }
  
  .signature-column {
    position: relative;
    z-index: 100;
    background: white;
  }
  
  .section-title {
    position: relative;
    z-index: 100;
    background: white;
    font-weight: bold;
    font-size: 11px;
    color: #2d3748;
    margin-bottom: 8px;
  }
  
  .signature-line {
    position: relative;
    z-index: 100;
    background: white;
  }
  
  .notes-section {
    position: relative;
    z-index: 10;
    background: white;
  }
  
  .page-footer {
    position: relative;
    z-index: 10;
    background: white;
  }
`;
