
import { useState, useEffect } from 'react';
import { BaseDocument, DocumentType, LineItem } from '@/types/businessDocuments';
import { calculateItemTotal, calculateDocumentTotals } from '@/utils/documentCalculations';
import UnifiedNumberService from '@/services/unifiedNumberService';

interface UseBusinessDocumentFormProps {
  documentType: DocumentType;
  document?: BaseDocument | null;
  userSettings: {
    company: any;
    currency: string;
  };
}

export const useBusinessDocumentForm = ({
  documentType,
  document,
  userSettings
}: UseBusinessDocumentFormProps) => {
  const getDocumentPrefix = () => {
    switch (documentType) {
      case 'purchase-order': return 'PO';
      case 'invoice': return 'INV';
      case 'quote': return 'QT';
      case 'sales-order': return 'SO';
      case 'payment-receipt': return 'REC';
      case 'delivery-note': return 'DN';
      case 'financial-report': return 'RPT';
      case 'credit-note': return 'CN';
      case 'payment': return 'PAY';
      case 'customer-return': return 'CR';
      case 'goods-return': return 'GR';
      default: return 'DOC';
    }
  };

  const getDefaultFormData = (): BaseDocument => {
    const baseData = {
      id: '',
      documentNumber: '',
      date: new Date().toISOString().split('T')[0],
      currency: userSettings.currency || 'KES', // Use currency from user settings
      company: userSettings.company,
      items: documentType === 'financial-report' ? [] : [
        {
          itemCode: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          taxRate: 16, // Default Kenya VAT rate
          taxAmount: 0
        }
      ],
      total: 0,
      subtotal: 0,
      taxAmount: 0,
      taxSettings: {
        type: 'exclusive' as const,
        defaultRate: 16 // Kenya VAT rate
      },
      qrCodeData: '',
      notes: '',
      terms: 'Payment Terms: Net 30 Days\nDelivery: As specified\nWarranty: As per manufacturer terms'
    };

    // Add specific fields for different document types
    if (documentType === 'purchase-order') {
      return {
        ...baseData,
        vendor: {
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          expectedDelivery: new Date().toISOString().split('T')[0],
          phone: '',
          email: '',
          taxId: '',
          capabilities: [],
          preferredCurrency: userSettings.currency,
          paymentTerms: 'Net 30',
          leadTime: 7
        },
        status: 'draft' as const,
        approvalStatus: 'pending' as const
      } as any;
    }

    if (documentType === 'payment-receipt') {
      return {
        ...baseData,
        paymentMethod: '',
        reference: '',
        amountPaid: 0,
        invoiceTotal: 0,
        receiptType: 'customer' as const,
        relatedInvoice: '',
        status: 'draft' as const
      } as any;
    }

    if (documentType === 'delivery-note') {
      return {
        ...baseData,
        deliveryDate: new Date().toISOString().split('T')[0],
        carrier: '',
        trackingNumber: '',
        deliveryAddress: '',
        receivedBy: '',
        deliveredBy: '',
        relatedOrder: ''
      } as any;
    }

    if (documentType === 'financial-report') {
      return {
        ...baseData,
        reportType: 'monthly' as const,
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        cashFlow: 0,
        transactions: [],
        budgetAnalysis: []
      } as any;
    }

    if (documentType === 'customer-return') {
      return {
        ...baseData,
        customer: {
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          email: '',
          taxId: ''
        },
        returnDate: new Date().toISOString().split('T')[0],
        reason: '',
        returnType: 'defective' as const,
        status: 'pending' as const,
        refundMethod: 'credit' as const,
        inspectionNotes: '',
        refundAmount: 0,
        originalOrder: ''
      } as any;
    }

    return baseData;
  };

  const [formData, setFormData] = useState<BaseDocument>(getDefaultFormData());

  useEffect(() => {
    if (document) {
      setFormData(document);
    } else {
      // Generate document number using unified service
      const generateNumber = async () => {
        try {
          const docNumber = await UnifiedNumberService.generateDocumentNumber(documentType);
          
          const defaultData = getDefaultFormData();
          setFormData(prev => ({
            ...defaultData,
            documentNumber: docNumber,
            qrCodeData: docNumber,
            company: userSettings.company,
            currency: userSettings.currency || 'KES' // Use currency from user settings
          }));
        } catch (error) {
          console.error('Error generating document number:', error);
          // Fallback to sync generation if async fails
          const docNumber = UnifiedNumberService.generateDocumentNumberSync(documentType);
          
          const defaultData = getDefaultFormData();
          setFormData(prev => ({
            ...defaultData,
            documentNumber: docNumber,
            qrCodeData: docNumber,
            company: userSettings.company,
            currency: userSettings.currency || 'KES' // Use currency from user settings
          }));
        }
      };
      
      generateNumber();
    }
  }, [document, userSettings, documentType]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const taxRate = field === 'taxRate' ? (value as number) : (updatedItems[index].taxRate || formData.taxSettings.defaultRate);
      const { total, taxAmount } = calculateItemTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice,
        taxRate,
        formData.taxSettings
      );
      updatedItems[index].total = total;
      updatedItems[index].taxAmount = taxAmount;
      updatedItems[index].taxRate = taxRate;
    }
    
    const totals = calculateDocumentTotals(updatedItems, formData.taxSettings);
    
    setFormData(prev => ({ 
      ...prev, 
      items: updatedItems,
      ...totals
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemCode: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          taxRate: prev.taxSettings.defaultRate,
          taxAmount: 0,
          unit: 'pcs'
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      const totals = calculateDocumentTotals(updatedItems, formData.taxSettings);
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        ...totals
      }));
    }
  };

  const handleFormDataUpdate = (updates: Partial<BaseDocument>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleItemsChange = (updatedItems: LineItem[]) => {
    const totals = calculateDocumentTotals(updatedItems, formData.taxSettings);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      ...totals
    }));
  };

  return {
    formData,
    updateItem,
    addItem,
    removeItem,
    handleFormDataUpdate,
    handleItemsChange,
    setFormData
  };
};
