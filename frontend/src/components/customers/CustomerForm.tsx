
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/customers';

interface CustomerFormProps {
  onSubmit?: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
  customer?: Customer; // For edit mode
  isEdit?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel, customer, isEdit = false }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>({    
    defaultValues: isEdit && customer ? {
      customer_type: customer.customer_type || 'individual',
      preferred_currency: customer.preferred_currency || 'KES',
      credit_limit: customer.credit_limit || 0,
      payment_terms: customer.payment_terms || 30,
      country: customer.country || 'Kenya',
      status: customer.status || 'active',
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      company_name: customer.company_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      notes: customer.notes || '',
      customer_number: customer.customer_number || ''
    } : {
      customer_type: 'individual',
      preferred_currency: 'KES',
      credit_limit: 0,
      payment_terms: 30,
      country: 'Kenya',
      status: 'active'
    }
  });
  
  const customerType = watch('customer_type');
  
  // Auto-generate customer number for new customers only
  useEffect(() => {
    if (!isEdit) {
      const generateCustomerNumber = async () => {
        try {
          const UnifiedNumberService = await import('@/services/unifiedNumberService');
          const customerNumber = await UnifiedNumberService.default.generateCustomerNumber();
          setValue('customer_number', customerNumber);
        } catch (error) {
          console.warn('Failed to auto-generate customer number:', error);
          // Fallback to local generation
          try {
            const { FallbackNumberingService } = await import('@/services/fallbackNumberingService');
            const customerNumber = FallbackNumberingService.generateCustomerNumber();
            setValue('customer_number', customerNumber);
          } catch (fallbackError) {
            console.error('Fallback customer number generation failed:', fallbackError);
          }
        }
      };
      
      generateCustomerNumber();
    }
  }, [isEdit, setValue]);

  const onFormSubmit = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Form submitted with data:', data);
    
    try {
      setIsSubmitting(true);
      
      // Set default values for required fields
      const customerData = {
        ...data,
        status: data.status || 'active' as const,
        preferred_currency: data.preferred_currency || 'KES',
        credit_limit: data.credit_limit || 0,
        payment_terms: data.payment_terms || 30,
        customer_type: data.customer_type || 'individual' as const,
      };
      
      console.log('Processed customer data before submission:', customerData);
      
      // Pass data to parent for creation/update
      if (onSubmit) {
        console.log('Calling onSubmit with customer data:', customerData);
        await onSubmit(customerData);
        console.log(`Customer ${isEdit ? 'updated' : 'created'} successfully`);
        if (!isEdit) {
          reset(); // Only reset form for new customers
        }
      } else {
        console.warn('No onSubmit handler provided to CustomerForm');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="customer_type">Customer Type *</Label>
            <Select 
              defaultValue={isEdit && customer ? customer.customer_type : 'individual'}
              onValueChange={(value) => {
                console.log('Customer type selected:', value);
                setValue('customer_type', value as 'individual' | 'company');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {customerType === 'company' ? (
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                {...register('company_name', { required: customerType === 'company' ? 'Company name is required' : false })}
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
                  {...register('first_name', { required: customerType === 'individual' ? 'First name is required' : false })}
                  placeholder="Enter first name"
                />
                {errors.first_name && <span className="text-destructive text-sm">{errors.first_name.message}</span>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...register('last_name', { required: customerType === 'individual' ? 'Last name is required' : false })}
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
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms (days)</Label>
              <Input
                id="payment_terms"
                type="number"
                {...register('payment_terms', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="preferred_currency">Currency</Label>
              <Select 
                defaultValue={isEdit && customer ? customer.preferred_currency : 'KES'}
                onValueChange={(value) => setValue('preferred_currency', value)}
              >
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none">
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Customer' : 'Create Customer')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 md:flex-none">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerForm;
