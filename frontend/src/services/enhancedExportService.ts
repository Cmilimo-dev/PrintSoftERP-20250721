import { DocumentStorageService } from './documentStorageService';
import { UnifiedDocumentExportService } from './unifiedDocumentExportService';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';

export interface ExportTemplate {
  id: string;
  name: string;
  type: DocumentType;
  format: 'pdf' | 'excel' | 'csv' | 'html';
  customization: {
    showHeader: boolean;
    showFooter: boolean;
    showLogo: boolean;
    showWatermark: boolean;
    headerHeight: number;
    footerHeight: number;
    margins: { top: number; right: number; bottom: number; left: number };
    fontSize: number;
    fontFamily: string;
    colorScheme: string;
    layout: 'compact' | 'standard' | 'detailed';
  };
  elements: {
    id: string;
    type: 'table' | 'header' | 'footer' | 'card' | 'text' | 'image';
    position: { x: number; y: number };
    size: { width: number; height: number };
    properties: Record<string, any>;
    visible: boolean;
  }[];
}

export interface ExportOptions {
  templateId?: string;
  format?: 'pdf' | 'excel' | 'csv' | 'html';
  includeWatermark?: boolean;
  compressionLevel?: number;
  filename?: string;
}

/**
 * Enhanced Export Service
 * Bridges the UI component with the actual export functionality
 */
export class EnhancedExportService {
  
  /**
   * Get all available templates
   */
  static getTemplates(): ExportTemplate[] {
    const templates = localStorage.getItem('export-templates');
    return templates ? JSON.parse(templates) : [];
  }

  /**
   * Save a template
   */
  static saveTemplate(template: ExportTemplate): boolean {
    try {
      const templates = this.getTemplates();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem('export-templates', JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Failed to save template:', error);
      return false;
    }
  }

  /**
   * Delete a template
   */
  static deleteTemplate(templateId: string): boolean {
    try {
      const templates = this.getTemplates().filter(t => t.id !== templateId);
      localStorage.setItem('export-templates', JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  /**
   * Export documents using a specific template
   */
  static async exportWithTemplate(
    documentIds: string[],
    documentType: DocumentType,
    templateId: string,
    options: ExportOptions = {}
  ): Promise<boolean> {
    try {
      const template = this.getTemplates().find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const documents = this.getDocumentsByType(documentType);
      const documentsToExport = documents.filter(doc => documentIds.includes(doc.id));

      if (documentsToExport.length === 0) {
        throw new Error('No documents found to export');
      }

      // Apply template customization and export each document
      for (const document of documentsToExport) {
        const enhancedDocument = this.applyTemplateToDocument(document, template);
        
        await UnifiedDocumentExportService.exportDocument(
          enhancedDocument,
          documentType,
          {
            format: options.format || template.format || 'pdf',
            filename: options.filename || `${document.documentNumber}_${template.name}`,
            includeLogo: template.customization.showLogo,
            watermark: template.customization.showWatermark ? 'COPY' : undefined,
            colorMode: 'color'
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }

  /**
   * Batch export multiple documents
   */
  static async batchExport(
    documentsMap: Record<DocumentType, string[]>,
    templateId: string,
    options: ExportOptions = {}
  ): Promise<boolean> {
    try {
      const template = this.getTemplates().find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const results = [];

      for (const [documentType, documentIds] of Object.entries(documentsMap)) {
        if (documentIds.length > 0) {
          const result = await this.exportWithTemplate(
            documentIds,
            documentType as DocumentType,
            templateId,
            options
          );
          results.push(result);
        }
      }

      return results.every(result => result === true);
    } catch (error) {
      console.error('Batch export failed:', error);
      return false;
    }
  }

  /**
   * Generate preview data for a template
   */
  static generatePreviewData(template: ExportTemplate): any {
    const sampleDocument = this.createSampleDocument(template.type);
    return {
      template,
      document: this.applyTemplateToDocument(sampleDocument, template)
    };
  }

  /**
   * Get export statistics
   */
  static getExportStats(): {
    totalTemplates: number;
    totalExports: number;
    lastExportDate: string | null;
    popularFormat: string;
  } {
    const templates = this.getTemplates();
    const exportHistory = JSON.parse(localStorage.getItem('export-history') || '[]');
    
    const formatCounts = exportHistory.reduce((acc: Record<string, number>, exportRecord: any) => {
      acc[exportRecord.format] = (acc[exportRecord.format] || 0) + 1;
      return acc;
    }, {});

    const popularFormat = Object.keys(formatCounts).reduce((a, b) => 
      formatCounts[a] > formatCounts[b] ? a : b, 'pdf'
    );

    return {
      totalTemplates: templates.length,
      totalExports: exportHistory.length,
      lastExportDate: exportHistory.length > 0 ? exportHistory[exportHistory.length - 1].date : null,
      popularFormat
    };
  }

  /**
   * Record export for statistics
   */
  static recordExport(templateId: string, format: string, documentCount: number): void {
    try {
      const exportHistory = JSON.parse(localStorage.getItem('export-history') || '[]');
      exportHistory.push({
        templateId,
        format,
        documentCount,
        date: new Date().toISOString()
      });
      
      // Keep only last 100 exports
      if (exportHistory.length > 100) {
        exportHistory.splice(0, exportHistory.length - 100);
      }
      
      localStorage.setItem('export-history', JSON.stringify(exportHistory));
    } catch (error) {
      console.error('Failed to record export:', error);
    }
  }

  /**
   * Private helper methods
   */
  private static getDocumentsByType(documentType: DocumentType): BaseDocument[] {
    const storageKeys: Record<DocumentType, string> = {
      'quotation': 'quote',
      'sales_order': 'sales-order', 
      'invoice': 'invoice',
      'delivery_note': 'delivery-note'
    };

    const storageKey = storageKeys[documentType];
    if (!storageKey) return [];

    return DocumentStorageService.getDocuments(storageKey);
  }

  private static applyTemplateToDocument(document: BaseDocument, template: ExportTemplate): BaseDocument {
    // Apply template customizations to the document
    const customizedDocument = {
      ...document,
      templateSettings: {
        showHeader: template.customization.showHeader,
        showFooter: template.customization.showFooter,
        showLogo: template.customization.showLogo,
        layout: template.customization.layout,
        colorScheme: template.customization.colorScheme,
        fontSize: template.customization.fontSize,
        fontFamily: template.customization.fontFamily,
        margins: template.customization.margins
      }
    };

    return customizedDocument;
  }

  private static createSampleDocument(documentType: DocumentType): BaseDocument {
    const baseDoc = {
      id: 'SAMPLE-001',
      documentNumber: 'SAMPLE-001',
      date: new Date().toISOString().split('T')[0],
      customer: {
        id: 'customer-1',
        name: 'Sample Customer Inc.',
        email: 'customer@example.com',
        phone: '+1-555-0123',
        address: '123 Customer Street',
        city: 'Sample City',
        state: 'SC',
        zip: '12345',
        country: 'USA'
      },
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          itemCode: 'ITEM001',
          description: 'Sample Product 1',
          quantity: 2,
          unitPrice: 100,
          total: 200,
          taxRate: 16,
          taxAmount: 27.59
        },
        {
          id: 'item-2',
          productId: 'product-2',
          itemCode: 'ITEM002',
          description: 'Sample Product 2',
          quantity: 1,
          unitPrice: 250,
          total: 250,
          taxRate: 16,
          taxAmount: 34.48
        }
      ],
      subtotal: 450,
      taxAmount: 62.07,
      total: 512.07,
      currency: 'USD',
      status: 'pending',
      company: {
        name: 'Priority Solutions Inc.',
        address: '123 Business Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@prioritysolutions.com',
        taxId: 'TAX123456789'
      },
      taxSettings: {
        type: 'exclusive',
        defaultRate: 16
      },
      notes: 'This is a sample document for template preview.'
    };

    // Add document-type specific fields
    switch (documentType) {
      case 'invoice':
        return {
          ...baseDoc,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paidAmount: 0,
          balanceAmount: baseDoc.total
        };
      case 'delivery_note':
        return {
          ...baseDoc,
          deliveryAddress: '456 Delivery Street, Delivery City, DC 67890',
          deliveryDate: new Date().toISOString().split('T')[0]
        };
      default:
        return baseDoc;
    }
  }
}
