import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface WarehouseFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

interface WarehouseFormProps {
  onSubmit: (data: WarehouseFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<WarehouseFormData>;
  title?: string;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  title = "Add Warehouse" 
}) => {
  const isMobile = useIsMobile();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<WarehouseFormData>({
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      is_active: initialData?.is_active !== false
    }
  });

  const onFormSubmit = (data: WarehouseFormData) => {
    onSubmit(data);
  };

  return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            <div>
              <Label htmlFor="name">Warehouse Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Warehouse name is required' })}
                placeholder="Enter warehouse name"
              />
              {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
            </div>
            
            <div>
              <Label htmlFor="code">Warehouse Code *</Label>
              <Input
                id="code"
                {...register('code', { required: 'Warehouse code is required' })}
                placeholder="e.g., WH-001"
              />
              {errors.code && <span className="text-destructive text-sm">{errors.code.message}</span>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter warehouse address"
            />
          </div>
          
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <div className={cn(
            "flex gap-2",
            isMobile ? "flex-col" : "flex-row justify-end"
          )}>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className={isMobile ? "w-full" : ""}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              className={isMobile ? "w-full" : ""}
            >
              {initialData ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </div>
        </form>
  );
};

export default WarehouseForm;
