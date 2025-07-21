import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Supplier } from '@/types/customers';
import { Building2, Mail, Phone, MapPin, CreditCard, FileText } from 'lucide-react';
import { MobileFormCard, MobileFormGrid, MobileFormActions } from '@/components/ui/mobile-form-layout';
import { useIsMobile } from '@/hooks/use-mobile';

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel }) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    company_name: supplier?.company_name || '',
    name: supplier?.name || '',
    contact_person: supplier?.contact_person || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    zip: supplier?.zip || '',
    country: supplier?.country || 'Kenya',
    supplier_code: supplier?.supplier_code || '',
    supplier_type: supplier?.supplier_type || 'manufacturer',
    tax_number: supplier?.tax_number || '',
    credit_limit: supplier?.credit_limit || 0,
    preferred_currency: supplier?.preferred_currency || 'KES',
    payment_terms: supplier?.payment_terms || 30,
    notes: supplier?.notes || '',
    is_active: supplier?.is_active ?? true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={isMobile ? "space-y-4" : "space-y-6"}>
      {/* Basic Information */}
      <MobileFormCard
        title="Basic Information"
        icon={<Building2 className="h-5 w-5" />}
      >
        <MobileFormGrid columns={2}>
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              required
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div>
            <Label htmlFor="supplier_code">Supplier Code</Label>
            <Input
              id="supplier_code"
              value={formData.supplier_code}
              onChange={(e) => handleInputChange('supplier_code', e.target.value)}
              placeholder="Auto-generated if empty"
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div>
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div>
            <Label htmlFor="supplier_type">Supplier Type</Label>
            <Select value={formData.supplier_type} onValueChange={(value) => handleInputChange('supplier_type', value)}>
              <SelectTrigger className={isMobile ? "h-12" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tax_number">Tax Number</Label>
            <Input
              id="tax_number"
              value={formData.tax_number}
              onChange={(e) => handleInputChange('tax_number', e.target.value)}
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div>
            <Label htmlFor="is_active">Status</Label>
            <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => handleInputChange('is_active', value === 'active')}>
              <SelectTrigger className={isMobile ? "h-12" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </MobileFormGrid>
      </MobileFormCard>

      {/* Contact Information */}
      <MobileFormCard
        title="Contact Information"
        icon={<Mail className="h-5 w-5" />}
      >
        <MobileFormGrid columns={2}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={isMobile ? "h-12" : ""}
            />
          </div>
        </MobileFormGrid>
      </MobileFormCard>

      {/* Address Information */}
      <MobileFormCard
        title="Address Information"
        icon={<MapPin className="h-5 w-5" />}
        collapsible={isMobile}
        defaultCollapsed={isMobile}
      >
        <div className={isMobile ? "space-y-3" : "space-y-4"}>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={isMobile ? 2 : 2}
              className={isMobile ? "min-h-[80px]" : ""}
            />
          </div>

          <MobileFormGrid columns={4}>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={isMobile ? "h-12" : ""}
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={isMobile ? "h-12" : ""}
              />
            </div>

            <div>
              <Label htmlFor="zip">ZIP/Postal Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
                className={isMobile ? "h-12" : ""}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger className={isMobile ? "h-12" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                  <SelectItem value="Burundi">Burundi</SelectItem>
                  <SelectItem value="South Sudan">South Sudan</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </MobileFormGrid>
        </div>
      </MobileFormCard>

      {/* Financial Information */}
      <MobileFormCard
        title="Financial Information"
        icon={<CreditCard className="h-5 w-5" />}
        collapsible={isMobile}
        defaultCollapsed={isMobile}
      >
        <MobileFormGrid columns={3}>
          <div>
            <Label htmlFor="credit_limit">Credit Limit</Label>
            <Input
              id="credit_limit"
              type="number"
              value={formData.credit_limit}
              onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div>
            <Label htmlFor="preferred_currency">Currency</Label>
            <Select value={formData.preferred_currency} onValueChange={(value) => handleInputChange('preferred_currency', value)}>
              <SelectTrigger className={isMobile ? "h-12" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_terms">Payment Terms (days)</Label>
            <Input
              id="payment_terms"
              type="number"
              value={formData.payment_terms}
              onChange={(e) => handleInputChange('payment_terms', parseInt(e.target.value) || 30)}
              min="0"
              className={isMobile ? "h-12" : ""}
            />
          </div>
        </MobileFormGrid>
      </MobileFormCard>

      {/* Additional Information */}
      <MobileFormCard
        title="Additional Information"
        icon={<FileText className="h-5 w-5" />}
        collapsible={isMobile}
        defaultCollapsed={isMobile}
      >
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={isMobile ? 2 : 3}
            placeholder="Additional notes or comments about this supplier..."
            className={isMobile ? "min-h-[80px]" : ""}
          />
        </div>
      </MobileFormCard>

      {/* Form Actions */}
      <MobileFormActions>
        <Button type="button" variant="outline" onClick={onCancel} className={isMobile ? "w-full" : ""}>
          Cancel
        </Button>
        <Button type="submit" className={isMobile ? "w-full" : ""}>
          {supplier ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </MobileFormActions>
    </form>
  );
};

export default SupplierForm;
