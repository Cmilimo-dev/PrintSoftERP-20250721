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

interface CategoryFormData {
  name: string;
  description?: string;
  is_active: boolean;
}

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<CategoryFormData>;
  title?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  title = "Add Category" 
}) => {
  const isMobile = useIsMobile();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      is_active: initialData?.is_active !== false
    }
  });

  const onFormSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Category name is required' })}
          placeholder="Enter category name"
        />
        {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter category description"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          defaultChecked={initialData?.is_active !== false}
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
          {initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
