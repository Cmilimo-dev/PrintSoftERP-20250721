// Clean Customer Form using current hooks and types
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCustomer } from '../../hooks/useCustomers';
import { Customer } from '../../types/customers';

interface CleanCustomerFormProps {
  customer?: Customer;
  onSave?: () => void;
  onCancel?: () => void;
}

const CleanCustomerForm: React.FC<CleanCustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const createCustomerMutation = useCreateCustomer();
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>({    
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
      state: customer?.state || '',
      postal_code: customer?.postal_code || '',
      country: customer?.country || 'Kenya',
      payment_terms: customer?.payment_terms || 30,
      credit_limit: customer?.credit_limit || 0,
      customer_type: customer?.customer_type || 'individual',
      preferred_currency: customer?.preferred_currency || 'KES',
      status: customer?.status || 'active'
    }
  });

  const onFormSubmit = async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Form submitted with data:', data);
    
    try {
      await createCustomerMutation.mutateAsync(data);
      console.log('Customer saved successfully, resetting form');
      reset();
      onSave?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Customer name is required' })}
                placeholder="Enter customer name"
              />
              {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
            </div>

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
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            
            <div>
              <Label htmlFor="address">Street Address</Label>
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
                <Label htmlFor="postal_code">ZIP/Postal Code</Label>
                <Input
                  id="postal_code"
                  {...register('postal_code')}
                  placeholder="Enter ZIP code"
                />
              </div>
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

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credit_limit">Credit Limit</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  {...register('credit_limit', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Credit limit must be non-negative' }
                  })}
                  placeholder="0.00"
                />
                {errors.credit_limit && <span className="text-destructive text-sm">{errors.credit_limit.message}</span>}
              </div>
              <div>
                <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
                <Input
                  id="payment_terms"
                  type="number"
                  {...register('payment_terms', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Payment terms must be non-negative' }
                  })}
                  placeholder="30"
                />
                {errors.payment_terms && <span className="text-destructive text-sm">{errors.payment_terms.message}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={createCustomerMutation.isPending} className="flex-1 md:flex-none">
              {createCustomerMutation.isPending ? 'Saving...' : (customer ? 'Update Customer' : 'Create Customer')}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 md:flex-none">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CleanCustomerForm;
