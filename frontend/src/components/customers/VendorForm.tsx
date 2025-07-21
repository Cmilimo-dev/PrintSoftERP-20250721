
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useCustomers';
import { Supplier } from '@/types/customers';
import { ArrowLeft } from 'lucide-react';

interface VendorFormProps {
  onClose?: () => void;
  onSubmit?: () => void;
  vendor?: any; // Existing vendor to edit
}

const VendorForm: React.FC<VendorFormProps> = ({ onClose, onSubmit, vendor }) => {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const isEditing = !!vendor;
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>(
    {
      defaultValues: {
        supplier_type: 'company',
        preferred_currency: 'KES',
        credit_limit: 0,
        payment_terms: 30,
        country: 'Kenya'
      }
    }
  );
  
  const supplierType = watch('supplier_type');
  
  // Populate form when editing
  useEffect(() => {
    if (vendor) {
      // Map vendor data to form fields
      setValue('supplier_code', vendor.vendor_number || vendor.supplier_code || '');
      setValue('supplier_type', vendor.supplier_type || 'company');
      setValue('company_name', vendor.company_name || vendor.name || '');
      setValue('first_name', vendor.first_name || '');
      setValue('last_name', vendor.last_name || '');
      setValue('email', vendor.email || '');
      setValue('phone', vendor.phone || '');
      setValue('address', vendor.address || '');
      setValue('city', vendor.city || '');
      setValue('state', vendor.state || '');
      setValue('country', vendor.country || 'Kenya');
      setValue('credit_limit', vendor.credit_limit || 0);
      setValue('payment_terms', vendor.payment_terms || 30);
      setValue('preferred_currency', vendor.preferred_currency || 'KES');
      setValue('notes', vendor.notes || '');
    }
  }, [vendor, setValue]);
  
  // Auto-generate vendor code only for new vendors
  useEffect(() => {
    if (!isEditing) {
      const generateVendorCode = async () => {
        try {
          const UnifiedNumberService = (await import('@/services/unifiedNumberService')).default;
          const vendorCode = await UnifiedNumberService.generateVendorNumber();
          setValue('supplier_code', vendorCode);
        } catch (error) {
          console.warn('Database numbering failed, using fallback:', error);
          try {
            const { FallbackNumberingService } = await import('@/services/fallbackNumberingService');
            const vendorCode = FallbackNumberingService.generateVendorNumber();
            setValue('supplier_code', vendorCode);
          } catch (fallbackError) {
            console.error('Failed to auto-generate vendor code:', fallbackError);
          }
        }
      };
      
      generateVendorCode();
    }
  }, [isEditing, setValue]);

  const onFormSubmit = async (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate name based on vendor type
      const name = data.supplier_type === 'company' 
        ? data.company_name 
        : (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.last_name);
      
      const supplierData = {
        ...data,
        name: name || 'Unnamed Vendor',
        is_active: data.is_active !== false,
        preferred_currency: data.preferred_currency || 'KES',
        credit_limit: data.credit_limit || 0,
        payment_terms: data.payment_terms || 30,
        supplier_type: data.supplier_type || 'company' as const,
      };
      
      if (isEditing) {
        await updateSupplier.mutateAsync({
          id: vendor.id,
          supplier: supplierData
        });
      } else {
        await createSupplier.mutateAsync(supplierData);
      }
      
      reset();
      onSubmit?.();
    } catch (error) {
      console.error('Vendor form submission error:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_code">Vendor Code *</Label>
              <Input
                id="supplier_code"
                {...register('supplier_code', { required: 'Vendor code is required' })}
                placeholder="Auto-generated vendor code"
                readOnly
              />
              {errors.supplier_code && <span className="text-destructive text-sm">{errors.supplier_code.message}</span>}
            </div>
            <div>
              <Label htmlFor="supplier_type">Vendor Type *</Label>
              <Select 
                value={watch('supplier_type')}
                onValueChange={(value) => setValue('supplier_type', value as 'individual' | 'company')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {supplierType === 'company' ? (
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                {...register('company_name', { required: supplierType === 'company' ? 'Company name is required' : false })}
                placeholder="Enter company name"
              />
              {errors.company_name && <span className="text-destructive text-sm">{errors.company_name.message}</span>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  {...register('first_name', { required: supplierType === 'individual' ? 'First name is required' : false })}
                  placeholder="Enter first name"
                />
                {errors.first_name && <span className="text-destructive text-sm">{errors.first_name.message}</span>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...register('last_name', { required: supplierType === 'individual' ? 'Last name is required' : false })}
                  placeholder="Enter last name"
                />
                {errors.last_name && <span className="text-destructive text-sm">{errors.last_name.message}</span>}
              </div>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Enter street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="state">State/Region</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="Enter state or region"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                // Removed defaultValue to maintain controlled input
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="credit_limit">Credit Limit</Label>
              <Input
                id="credit_limit"
                type="number"
                step="0.01"
                {...register('credit_limit', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms (days)</Label>
              <Input
                id="payment_terms"
                type="number"
                {...register('payment_terms', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="preferred_currency">Currency</Label>
              <Select onValueChange={(value) => setValue('preferred_currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter additional notes"
            />
          </div>

          <Button type="submit" disabled={createSupplier.isPending || updateSupplier.isPending} className="w-full md:w-auto">
            {createSupplier.isPending ? 'Creating...' : updateSupplier.isPending ? 'Updating...' : isEditing ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorForm;
