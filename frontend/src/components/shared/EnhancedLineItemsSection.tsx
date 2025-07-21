import React, { useCallback } from 'react';
import { LineItem, TaxSettings } from '@/types/businessDocuments';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';

interface EnhancedLineItemsSectionProps {
  items: LineItem[];
  onItemsChange?: (items: LineItem[]) => void;
  currency: string;
  taxSettings?: TaxSettings;
  showProductSearch?: boolean;
  showTaxCalculation?: boolean;
  readOnly?: boolean;
  documentType?: 'purchase-order' | 'sales-order' | 'quote' | 'invoice' | 'delivery-note' | 'goods-receiving-voucher' | 'inventory-adjustment';
  // Legacy props for backward compatibility
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  onUpdateItem?: (index: number, field: any, value: string | number) => void;
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
  hidePricing?: boolean;
  allowNewItems?: boolean;
  showStock?: boolean;
}

const EnhancedLineItemsSection: React.FC<EnhancedLineItemsSectionProps> = ({
  items,
  onItemsChange,
  currency,
  taxSettings = { type: 'exclusive', defaultRate: 16 },
  showProductSearch = true,
  showTaxCalculation = true,
  readOnly = false,
  documentType = 'invoice',
  // Legacy props for backward compatibility
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  hidePricing = false,
  allowNewItems = true,
  showStock = true
}) => {
  // This component now serves as a wrapper/adapter for the SmartLineItemComponent
  // to maintain backward compatibility while using the new enhanced component
  
  // Handle legacy props by creating a combined onItemsChange handler
  const handleItemsChange = useCallback(
    onItemsChange || ((updatedItems: LineItem[]) => {
      // If using legacy props, we don't have direct items update capability
      // This is a fallback for components that haven't been updated yet
      console.warn('Using legacy line items interface. Consider updating to use onItemsChange prop.');
    }),
    [onItemsChange]
  );
  
  return (
    <SmartLineItemComponent
      items={items}
      onItemsChange={handleItemsChange}
      currency={currency}
      taxSettings={taxSettings}
      documentType={documentType}
      readOnly={readOnly || hidePricing}
      showStock={showStock && showProductSearch}
      enableBulkImport={allowNewItems}
      enableBarcodeScanning={allowNewItems}
    />
  );
};

export default EnhancedLineItemsSection;
