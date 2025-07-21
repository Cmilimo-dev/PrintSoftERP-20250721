
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VendorSelector from '@/components/business-document/VendorSelector';
import { Vendor } from '@/types/businessDocuments';

interface VendorInfoSectionProps {
  vendor?: Vendor;
  onVendorUpdate?: (vendor: Vendor) => void;
  onUpdate?: (updates: Partial<Vendor>) => void;
  onQueryVendors?: () => void;
}

const VendorInfoSection: React.FC<VendorInfoSectionProps> = ({ 
  vendor = {}, 
  onVendorUpdate,
  onUpdate = () => {}, 
  onQueryVendors = () => {} 
}) => {
  // Handle both old and new prop patterns for backward compatibility
  const handleVendorUpdate = (updates: Partial<Vendor>) => {
    if (onVendorUpdate) {
      const updatedVendor = { ...vendor, ...updates };
      onVendorUpdate(updatedVendor);
    } else {
      onUpdate(updates);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Information</CardTitle>
      </CardHeader>
      <CardContent>
        <VendorSelector
          vendor={vendor}
          onUpdate={handleVendorUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default VendorInfoSection;
