// Clean ERP export service based on unified export service without business document dependencies
import { ERPExportOptions, ERPListExportData, ERPDocument } from '../types/erpTypes';

export type ExportFormat = 'mht' | 'pdf' | 'csv' | 'excel';

interface CleanExportOptions {
  format: ExportFormat;
  filename?: string;
  includeLogo?: boolean;
  includeSignature?: boolean;
  watermark?: string;
  colorMode?: 'color' | 'monochrome';
  logoDisplayMode?: 'none' | 'logo-only' | 'logo-with-name' | 'name-only';
  logoUrl?: string;
}

interface ERPExportSettings {
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  showWatermark: boolean;
  includeHeaders: boolean;
  dateFormat: string;
  currency: string;
}

export class ERPExportService {
  private settings: ERPExportSettings = {
    companyName: 'Your Company',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    fontSize: 12,
    showWatermark: false,
    includeHeaders: true,
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  };

  updateSettings(newSettings: Partial<ERPExportSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Export lists to CSV
  exportToCSV(data: ERPListExportData, options: ERPExportOptions = { format: 'csv' }): void {
    const { headers, rows, title } = data;
    const filename = options.filename || `${title || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    let csvContent = '';
    
    if (this.settings.includeHeaders && options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    
    rows.forEach(row => {
      const escapedRow = row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvContent += escapedRow.join(',') + '\n';
    });

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  // Export lists to Excel format (simplified)
  exportToExcel(data: ERPListExportData, options: ERPExportOptions = { format: 'excel' }): void {
    // For simplicity, we'll create a tab-separated file that Excel can open
    const { headers, rows, title } = data;
    const filename = options.filename || `${title || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    let content = '';
    
    if (this.settings.includeHeaders && options.includeHeaders !== false) {
      content += headers.join('\t') + '\n';
    }
    
    rows.forEach(row => {
      content += row.map(cell => String(cell || '')).join('\t') + '\n';
    });

    this.downloadFile(content, filename, 'application/vnd.ms-excel');
  }

  // Export to PDF (simplified HTML to PDF)
  exportToPDF(data: ERPListExportData, options: ERPExportOptions = { format: 'pdf' }): void {
    const { headers, rows, title, summary } = data;
    const filename = options.filename || `${title || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const htmlContent = this.generatePDFHTML(data, options);
    
    // Create a new window for printing/PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog (user can save as PDF)
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private generatePDFHTML(data: ERPListExportData, options: ERPExportOptions): string {
    const { headers, rows, title, summary } = data;
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title || 'Export'}</title>
          <style>
            @page {
              margin: 1in;
              size: A4;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: ${this.settings.fontSize}px;
              color: ${this.settings.primaryColor};
              margin: 0;
              padding: 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid ${this.settings.primaryColor};
              padding-bottom: 20px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: ${this.settings.primaryColor};
              margin-bottom: 10px;
            }
            
            .document-title {
              font-size: 18px;
              color: ${this.settings.secondaryColor};
              margin-bottom: 5px;
            }
            
            .export-date {
              font-size: 12px;
              color: ${this.settings.secondaryColor};
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            
            th {
              background-color: ${this.settings.primaryColor};
              color: white;
              font-weight: bold;
            }
            
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .summary {
              margin-top: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-left: 4px solid ${this.settings.primaryColor};
            }
            
            .summary-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: ${this.settings.primaryColor};
            }
            
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72px;
              color: rgba(200, 200, 200, 0.1);
              z-index: -1;
              pointer-events: none;
            }
            
            @media print {
              body { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${this.settings.showWatermark ? `<div class="watermark">${this.settings.companyName}</div>` : ''}
          
          <div class="header">
            <div class="company-name">${this.settings.companyName}</div>
            <div class="document-title">${title || 'Data Export'}</div>
            <div class="export-date">Generated on ${currentDate}</div>
          </div>
          
          <table>
            ${this.settings.includeHeaders && options.includeHeaders !== false ? `
              <thead>
                <tr>
                  ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
            ` : ''}
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${summary ? `
            <div class="summary">
              <div class="summary-title">Summary</div>
              <div>Total Records: ${summary.totalRecords}</div>
              ${summary.totalValue !== undefined ? `<div>Total Value: ${this.settings.currency} ${summary.totalValue.toFixed(2)}</div>` : ''}
            </div>
          ` : ''}
        </body>
      </html>
    `;
  }

  // Export to MHT format (Web Archive)
  exportToMHT(data: ERPListExportData, options: ERPExportOptions = { format: 'mht' }): void {
    const htmlContent = this.generatePDFHTML(data, options);
    const filename = options.filename || `${data.title || 'export'}_${new Date().toISOString().split('T')[0]}.mht`;
    
    const mhtContent = this.generateMHTContent(htmlContent, filename);
    this.downloadFile(mhtContent, filename, 'message/rfc822');
  }

  private generateMHTContent(htmlContent: string, filename: string): string {
    const boundary = '----=_NextPart_' + Date.now();
    const date = new Date().toUTCString();
    
    return `From: <ERP@export.com>
Subject: ${filename}
Date: ${date}
MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

${htmlContent}

--${boundary}--
`;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Helper method to prepare data for export
  prepareListData(
    items: any[],
    columns: { key: string; label: string; formatter?: (value: any) => string }[],
    title?: string
  ): ERPListExportData {
    const headers = columns.map(col => col.label);
    const rows = items.map(item => 
      columns.map(col => {
        const value = item[col.key];
        return col.formatter ? col.formatter(value) : value;
      })
    );

    const totalValue = items.reduce((sum, item) => {
      const total = item.total || item.amount || item.value || 0;
      return sum + (typeof total === 'number' ? total : 0);
    }, 0);

    return {
      headers,
      rows,
      title,
      summary: {
        totalRecords: items.length,
        totalValue: totalValue > 0 ? totalValue : undefined
      }
    };
  }

  // Method to export any list with custom formatting
  exportList(
    items: any[],
    columns: { key: string; label: string; formatter?: (value: any) => string }[],
    options: ERPExportOptions & { title?: string }
  ): void {
    const data = this.prepareListData(items, columns, options.title);
    
    switch (options.format) {
      case 'csv':
        this.exportToCSV(data, options);
        break;
      case 'excel':
        this.exportToExcel(data, options);
        break;
      case 'pdf':
        this.exportToPDF(data, options);
        break;
      case 'mht':
        this.exportToMHT(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
}

// Singleton instance
export const erpExportService = new ERPExportService();
