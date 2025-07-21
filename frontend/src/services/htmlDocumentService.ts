
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { generateHTMLTemplate } from '@/utils/htmlTemplateGenerator';

export class HTMLDocumentService {
  static generateHTMLBlob(document: BaseDocument, documentType: DocumentType): Blob {
    const htmlContent = generateHTMLTemplate(document, documentType);
    return new Blob([htmlContent], { type: 'text/html' });
  }

  static downloadAsHTML(document: BaseDocument, documentType: DocumentType): void {
    const blob = this.generateHTMLBlob(document, documentType);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    
    link.href = url;
    link.download = `${document.documentNumber}.html`;
    window.document.body.appendChild(link);
    link.click();
    
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static printHTML(document: BaseDocument, documentType: DocumentType): void {
    const htmlContent = generateHTMLTemplate(document, documentType);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  }

  static previewHTML(document: BaseDocument, documentType: DocumentType): string {
    return generateHTMLTemplate(document, documentType);
  }
}
