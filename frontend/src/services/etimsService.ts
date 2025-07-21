import { Invoice, EtimsSettings } from '@/types/businessDocuments';

interface EtimsInvoiceData {
  invoiceNumber: string;
  businessRegistrationNumber: string;
  dateOfSale: string;
  customerName: string;
  customerPin?: string;
  items: Array<{
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    taxAmount: number;
    taxRate: number;
  }>;
  totalAmount: number;
  totalTaxAmount: number;
  invoiceType: 'NORMAL' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
}

interface EtimsQRCodeData {
  qrData: string;
  controlUnit: string;
  internalData: string;
  receiptSignature: string;
  date: string;
  time: string;
}

export class EtimsService {
  private static instance: EtimsService;
  private settings: EtimsSettings | null = null;

  private constructor() {}

  public static getInstance(): EtimsService {
    if (!EtimsService.instance) {
      EtimsService.instance = new EtimsService();
    }
    return EtimsService.instance;
  }

  public setSettings(settings: EtimsSettings): void {
    this.settings = settings;
  }

  public isEnabled(): boolean {
    return this.settings?.enabled || false;
  }

  public async submitInvoice(invoice: Invoice): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    if (!this.settings?.enabled) {
      return { success: false, error: 'eTIMS integration is not enabled' };
    }

    try {
      const etimsData = this.convertInvoiceToEtimsFormat(invoice);
      
      // In a real implementation, this would make an API call to eTIMS
      const response = await this.makeEtimsApiCall('/invoice/submit', etimsData);
      
      if (response.success) {
        const qrCodeData = await this.generateQRCode(response.data);
        return {
          success: true,
          qrCode: qrCodeData.qrData
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to submit invoice to eTIMS'
        };
      }
    } catch (error) {
      console.error('eTIMS submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private convertInvoiceToEtimsFormat(invoice: Invoice): EtimsInvoiceData {
    return {
      invoiceNumber: invoice.documentNumber,
      businessRegistrationNumber: invoice.company.etimsPin || invoice.company.taxId,
      dateOfSale: invoice.invoiceDate,
      customerName: invoice.customer.name,
      customerPin: invoice.customer.taxId,
      items: invoice.items.map(item => ({
        itemCode: item.itemCode,
        itemName: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.total,
        taxAmount: item.taxAmount || 0,
        taxRate: item.taxRate || 0
      })),
      totalAmount: invoice.total,
      totalTaxAmount: invoice.taxAmount,
      invoiceType: 'NORMAL'
    };
  }

  private async makeEtimsApiCall(endpoint: string, data: any): Promise<any> {
    if (!this.settings) {
      throw new Error('eTIMS settings not configured');
    }

    // Mock implementation - in reality, this would use the actual eTIMS API
    // with proper authentication, certificates, etc.
    console.log(`Making eTIMS API call to ${endpoint}:`, data);
    
    // Simulate API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            controlUnit: 'CU001',
            internalData: 'ID123456',
            receiptSignature: 'SIG789',
            timestamp: new Date().toISOString()
          }
        });
      }, 1000);
    });
  }

  private async generateQRCode(etimsResponse: any): Promise<EtimsQRCodeData> {
    const timestamp = new Date();
    const qrData = this.buildQRCodeString({
      invoiceNumber: etimsResponse.invoiceNumber || 'INV001',
      controlUnit: etimsResponse.controlUnit,
      internalData: etimsResponse.internalData,
      receiptSignature: etimsResponse.receiptSignature,
      timestamp
    });

    return {
      qrData,
      controlUnit: etimsResponse.controlUnit,
      internalData: etimsResponse.internalData,
      receiptSignature: etimsResponse.receiptSignature,
      date: timestamp.toISOString().split('T')[0],
      time: timestamp.toTimeString().split(' ')[0]
    };
  }

  private buildQRCodeString(data: any): string {
    // eTIMS QR code format (simplified version)
    const qrComponents = [
      data.invoiceNumber,
      data.controlUnit,
      data.internalData,
      data.receiptSignature,
      data.timestamp.getTime().toString()
    ];
    
    return qrComponents.join('|');
  }

  public generateMockQRCode(invoice: Invoice): string {
    // Generate a mock QR code for demonstration purposes
    const timestamp = new Date().getTime();
    const qrComponents = [
      invoice.documentNumber,
      'CU001', // Control Unit
      'ID' + timestamp.toString().slice(-6), // Internal Data
      'SIG' + Math.random().toString(36).substr(2, 9), // Receipt Signature
      timestamp.toString()
    ];
    
    return qrComponents.join('|');
  }

  public async validateInvoice(invoice: Invoice): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    if (!invoice.documentNumber) {
      errors.push('Invoice number is required');
    }

    if (!invoice.customer.name) {
      errors.push('Customer name is required');
    }

    if (!invoice.company.etimsPin && !invoice.company.taxId) {
      errors.push('Business registration number (eTIMS PIN or Tax ID) is required');
    }

    if (invoice.items.length === 0) {
      errors.push('At least one item is required');
    }

    for (const item of invoice.items) {
      if (!item.itemCode) {
        errors.push(`Item code is required for item: ${item.description}`);
      }
      if (item.quantity <= 0) {
        errors.push(`Quantity must be greater than 0 for item: ${item.description}`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Unit price cannot be negative for item: ${item.description}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public getSubmissionStatus(invoiceNumber: string): Promise<{ status: string; details?: any }> {
    // Mock implementation
    return Promise.resolve({
      status: 'submitted',
      details: {
        submittedAt: new Date().toISOString(),
        qrCode: 'mock-qr-code-data'
      }
    });
  }
}

export const etimsService = EtimsService.getInstance();
