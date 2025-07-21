
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useERPVendors } from '@/hooks/useERPVendors';
import { Vendor } from '@/types/businessDocuments';
import { ERPVendor } from '@/types/erpTypes';
import { Search, Plus } from 'lucide-react';

interface VendorSelectorProps {
  vendor?: Vendor;
  onUpdate: (updates: Partial<Vendor>) => void;
  onAddNew?: () => void;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ vendor = {}, onUpdate, onAddNew }) => {
  const { vendors, loading: isLoading, searchVendors } = useERPVendors();
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  const filteredVendors = searchTerm ? 
    searchVendors(searchTerm) : 
    vendors || [];

  const handleVendorSelect = (vendorId: string) => {
    const selectedVendor = vendors?.find(v => v.id === vendorId);
    if (selectedVendor) {
      onUpdate({
        name: selectedVendor.name || '',
        address: selectedVendor.address || '',
        city: selectedVendor.city || '',
        state: selectedVendor.state || '',
        zip: selectedVendor.postal_code || '',
        phone: selectedVendor.phone || '',
        email: selectedVendor.email || '',
        taxId: selectedVendor.tax_number || '',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: selectedVendor.payment_terms?.toString() || '30'
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading vendors...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Vendor Information</Label>
        <div className="flex gap-2">
          {onAddNew && (
            <Button type="button" variant="outline" size="sm" onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </Button>
          )}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsManualEntry(!isManualEntry)}
          >
            {isManualEntry ? 'Select from List' : 'Manual Entry'}
          </Button>
        </div>
      </div>

      {!isManualEntry ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name, email, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select onValueChange={handleVendorSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {filteredVendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{vendor.name}</span>
                    {vendor.email && (
                      <span className="text-sm text-muted-foreground">{vendor.email}</span>
                    )}
                    {vendor.contact_person && (
                      <span className="text-xs text-muted-foreground">Contact: {vendor.contact_person}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* Manual entry or selected vendor details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendor-name">Company Name *</Label>
          <Input
            id="vendor-name"
            value={vendor?.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Vendor company name"
            required
          />
        </div>
        <div>
          <Label htmlFor="vendor-email">Email</Label>
          <Input
            id="vendor-email"
            type="email"
            value={vendor?.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="vendor@example.com"
          />
        </div>
        <div>
          <Label htmlFor="vendor-phone">Phone</Label>
          <Input
            id="vendor-phone"
            value={vendor?.phone || ''}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="Phone number"
          />
        </div>
        <div>
          <Label htmlFor="vendor-delivery">Expected Delivery</Label>
          <Input
            id="vendor-delivery"
            type="date"
            value={vendor?.expectedDelivery || ''}
            onChange={(e) => onUpdate({ expectedDelivery: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vendor-address">Address</Label>
        <Input
          id="vendor-address"
          value={vendor?.address || ''}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vendor-city">City</Label>
          <Input
            id="vendor-city"
            value={vendor?.city || ''}
            onChange={(e) => onUpdate({ city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="vendor-state">State/Province</Label>
          <Input
            id="vendor-state"
            value={vendor?.state || ''}
            onChange={(e) => onUpdate({ state: e.target.value })}
            placeholder="State"
          />
        </div>
        <div>
          <Label htmlFor="vendor-zip">ZIP/Postal Code</Label>
          <Input
            id="vendor-zip"
            value={vendor?.zip || ''}
            onChange={(e) => onUpdate({ zip: e.target.value })}
            placeholder="ZIP code"
          />
        </div>
      </div>
    </div>
  );
};

export default VendorSelector;
