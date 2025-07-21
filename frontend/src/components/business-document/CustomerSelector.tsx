
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types/businessDocuments';
import { Search, Plus } from 'lucide-react';

interface CustomerSelectorProps {
  customer: Customer;
  onUpdate: (updates: Partial<Customer>) => void;
  onAddNew?: () => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ customer, onUpdate, onAddNew }) => {
  const { data: customers, isLoading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  const filteredCustomers = customers?.filter(c => 
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers?.find(c => c.id === customerId);
    if (selectedCustomer) {
      onUpdate({
        name: selectedCustomer.customer_type === 'company' 
          ? selectedCustomer.company_name || ''
          : `${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}`.trim(),
        address: selectedCustomer.address || '',
        city: selectedCustomer.city || '',
        state: selectedCustomer.state || '',
        zip: selectedCustomer.postal_code || '',
        phone: selectedCustomer.phone || '',
        email: selectedCustomer.email || '',
        taxId: selectedCustomer.tax_id || '',
        paymentTerms: selectedCustomer.payment_terms?.toString() || '30'
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading customers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Customer Information</Label>
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
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select onValueChange={handleCustomerSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {filteredCustomers.map((cust) => (
                <SelectItem key={cust.id} value={cust.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {cust.customer_type === 'company' 
                        ? cust.company_name 
                        : `${cust.first_name} ${cust.last_name}`}
                    </span>
                    {cust.email && (
                      <span className="text-sm text-muted-foreground">{cust.email}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {/* Manual entry or selected customer details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer-name">Company/Name *</Label>
          <Input
            id="customer-name"
            value={customer.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Customer name"
            required
          />
        </div>
        <div>
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            value={customer.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="customer@example.com"
          />
        </div>
        <div>
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            value={customer.phone || ''}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="Phone number"
          />
        </div>
        <div>
          <Label htmlFor="customer-tax-id">Tax ID</Label>
          <Input
            id="customer-tax-id"
            value={customer.taxId || ''}
            onChange={(e) => onUpdate({ taxId: e.target.value })}
            placeholder="Tax identification number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customer-address">Address</Label>
        <Input
          id="customer-address"
          value={customer.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="customer-city">City</Label>
          <Input
            id="customer-city"
            value={customer.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="customer-state">State/Province</Label>
          <Input
            id="customer-state"
            value={customer.state}
            onChange={(e) => onUpdate({ state: e.target.value })}
            placeholder="State"
          />
        </div>
        <div>
          <Label htmlFor="customer-zip">ZIP/Postal Code</Label>
          <Input
            id="customer-zip"
            value={customer.zip}
            onChange={(e) => onUpdate({ zip: e.target.value })}
            placeholder="ZIP code"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerSelector;
