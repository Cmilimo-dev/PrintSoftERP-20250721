import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PurchaseOrder, LineItem } from '@/types/businessDocuments';
import VendorInfoSection from './purchase-order/VendorInfoSection';
import TaxSettingsSection from './purchase-order/TaxSettingsSection';
import AdditionalInfoSection from './purchase-order/AdditionalInfoSection';
import LineItemsSection from './purchase-order/LineItemsSection';

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onSave: (po: PurchaseOrder) => void;
  onCancel: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrder,
  onSave,
  onCancel
}) => {

  // Default user settings - in a real app, these would come from user preferences/database
  const [userSettings, setUserSettings] = useState({
    company: {
      name: 'Priority Solutions Inc.',
      address: '123 Business Park Drive',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
      phone: '+1 (555) 123-4567',
      email: 'info@prioritysolutions.com',
      taxId: 'TAX123456789',
      website: 'www.prioritysolutions.com',
      logo: ''
    },
    currency: 'USD'
  });

  const [formData, setFormData] = useState<PurchaseOrder>({
    id: '',
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    currency: userSettings.currency,
    company: userSettings.company,
    vendor: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      expectedDelivery: '',
      phone: '',
      email: '',
      capabilities: [],
      preferredCurrency: 'USD'
    },
    items: [
      {
        itemCode: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxRate: 0,
        taxAmount: 0
      }
    ],
    total: 0,
    subtotal: 0,
    taxAmount: 0,
    taxSettings: {
      type: 'exclusive',
      defaultRate: 16
    },
    qrCodeData: '',
    notes: '',
    terms: 'Payment Terms: Net 30 Days\nDelivery: As specified\nWarranty: As per manufacturer terms'
  });

  useEffect(() => {
    if (purchaseOrder) {
      setFormData(purchaseOrder);
    } else {
      const docNumber = `PO-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setFormData(prev => ({
        ...prev,
        documentNumber: docNumber,
        qrCodeData: docNumber,
        company: userSettings.company,
        currency: userSettings.currency
      }));
    }
  }, [purchaseOrder, userSettings]);

  const handleUserSettingsUpdate = (newSettings: { company: any; currency: string }) => {
    setUserSettings(newSettings);
    // Update current form data with new defaults
    setFormData(prev => ({
      ...prev,
      company: newSettings.company,
      currency: newSettings.currency
    }));
  };

  const calculateItemTotal = (quantity: number, unitPrice: number, taxRate: number = 0) => {
    const baseTotal = quantity * unitPrice;
    const taxAmount = formData.taxSettings.type === 'inclusive' ? 
      (baseTotal * taxRate) / (100 + taxRate) : 
      baseTotal * (taxRate / 100);
    
    return {
      total: formData.taxSettings.type === 'inclusive' ? baseTotal : baseTotal + taxAmount,
      taxAmount: taxAmount
    };
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      const taxRate = field === 'taxRate' ? (value as number) : (updatedItems[index].taxRate || formData.taxSettings.defaultRate);
      const { total, taxAmount } = calculateItemTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice,
        taxRate
      );
      updatedItems[index].total = total;
      updatedItems[index].taxAmount = taxAmount;
      updatedItems[index].taxRate = taxRate;
    }
    
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalTaxAmount = updatedItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const grandTotal = formData.taxSettings.type === 'overall' ? 
      subtotal + (subtotal * formData.taxSettings.defaultRate / 100) :
      updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    setFormData(prev => ({ 
      ...prev, 
      items: updatedItems,
      subtotal: subtotal,
      taxAmount: formData.taxSettings.type === 'overall' ? subtotal * formData.taxSettings.defaultRate / 100 : totalTaxAmount,
      total: grandTotal
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
          taxAmount: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalTaxAmount = updatedItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        subtotal: subtotal,
        taxAmount: totalTaxAmount,
        total: updatedItems.reduce((sum, item) => sum + item.total, 0)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) = {
    e.preventDefault();
    
    try {
      console.log('Form submitted with data:', formData);
      
      // Validation
      if (!formData.documentNumber) {
        console.error('Purchase Order number is required');
        alert('Purchase Order number is required');
        return;
      }
      
      if (!formData.date) {
        console.error('Date is required');
        alert('Date is required');
        return;
      }
      
      if (!formData.items.length) {
        console.error('At least one item is required');
        alert('Please add at least one item');
        return;
      }
      
      console.log('Processed purchase order data before submission:', formData);
      
      onSave(formData);
      
      console.log('Purchase order saved successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save purchase order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {purchaseOrder ? 'Edit' : 'Create'} Purchase Order
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Number, Date and Currency - Simplified */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Document Number</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
          </div>

          <VendorInfoSection 
            vendor={formData.vendor}
            onUpdate={(updates) => setFormData(prev => ({ 
              ...prev, 
              vendor: { ...prev.vendor, ...updates }
            }))}
            onQueryVendors={() => {}}
          />

          <TaxSettingsSection 
            taxSettings={formData.taxSettings}
            onUpdate={(updates) => setFormData(prev => ({
              ...prev,
              taxSettings: { ...prev.taxSettings, ...updates }
            }))}
          />

          <LineItemsSection 
            items={formData.items}
            taxSettings={formData.taxSettings}
            currency={formData.currency}
            subtotal={formData.subtotal}
            taxAmount={formData.taxAmount}
            total={formData.total}
            onUpdateItem={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />

          <AdditionalInfoSection 
            notes={formData.notes || ''}
            terms={formData.terms || ''}
            onUpdate={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          />
        </form>

      </div>
    </div>
  );
};

export default PurchaseOrderForm;
