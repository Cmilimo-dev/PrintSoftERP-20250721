
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Company } from '@/types/purchaseOrder';

interface CompanyInfoSectionProps {
  company: Company;
  onUpdate: (updates: Partial<Company>) => void;
}

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({ company, onUpdate }) => {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        onUpdate({ logo: logoData });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="logo">Company Logo</Label>
          <div className="flex items-center gap-4">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="flex-1"
            />
            {company.logo && (
              <img 
                src={company.logo} 
                alt="Company Logo" 
                className="w-16 h-16 object-contain border rounded"
              />
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={company.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={company.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={company.city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={company.state}
              onChange={(e) => onUpdate({ state: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input
              id="zip"
              value={company.zip}
              onChange={(e) => onUpdate({ zip: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={company.country}
            onChange={(e) => onUpdate({ country: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={company.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={company.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            value={company.taxId}
            onChange={(e) => onUpdate({ taxId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={company.website || ''}
            onChange={(e) => onUpdate({ website: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoSection;
