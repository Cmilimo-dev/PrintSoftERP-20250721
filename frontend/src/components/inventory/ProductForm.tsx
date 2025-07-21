
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Wand2, RotateCcw } from 'lucide-react';
import { useProductCategories, useCreateProduct } from '@/hooks/useInventory';
import { Product } from '@/types/inventory';
import { SKUGenerationService } from '@/services/skuGenerationService';
import { MobileFormLayout, MobileFormCard, MobileFormGrid, MobileFormActions } from '@/components/mobile/MobileFormLayout';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
interface ProductFormProps {
  onSubmit?: () => void;
  initialData?: Partial<Product>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const { data: categories } = useProductCategories();
  const createProduct = useCreateProduct();
  const [skuConfig, setSKUConfig] = useState(SKUGenerationService.getConfig());
  const [skuPreview, setSKUPreview] = useState('');
  const isMobile = useIsMobile();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Omit<Product, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      ...initialData,
      unit_of_measure: initialData?.unit_of_measure || 'piece',
      tax_rate: initialData?.tax_rate || 16,
      current_stock: initialData?.current_stock || 0,
      minimum_stock: initialData?.minimum_stock || 0,
      reorder_point: initialData?.reorder_point || 0,
      lead_time_days: initialData?.lead_time_days || 7,
      is_active: initialData?.is_active !== false,
      is_serialized: initialData?.is_serialized || false
    }
  });

  const categoryId = watch('category_id');

  useEffect(() => {
    if (skuConfig.enabled) {
      updateSKUPreview();
    }
  }, [categoryId, skuConfig]);

  const updateSKUPreview = () => {
    if (skuConfig.enabled) {
      const categoryCode = categories?.find(c => c.id === categoryId)?.name?.substring(0, 3).toUpperCase();
      const preview = SKUGenerationService.previewSKU(categoryCode);
      setSKUPreview(preview);
    }
  };

  const generateSKU = () => {
    const categoryCode = categories?.find(c => c.id === categoryId)?.name?.substring(0, 3).toUpperCase();
    const newSKU = SKUGenerationService.generateSKU(categoryCode);
    setValue('sku', newSKU);
  };

  const onFormSubmit = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Form submitted with data:', data);
      
      // Validate required fields
      if (!data.sku || !data.name || !data.unit_price) {
        console.error('Missing required fields:', { sku: data.sku, name: data.name, unit_price: data.unit_price });
        return;
      }
      
      // Set default values for required fields
      const productData = {
        ...data,
        is_active: data.is_active !== false,
        is_serialized: data.is_serialized || false,
        unit_of_measure: data.unit_of_measure || 'piece',
        tax_rate: data.tax_rate || 16,
        current_stock: data.current_stock || 0,
        minimum_stock: data.minimum_stock || 0,
        reorder_point: data.reorder_point || 0,
        lead_time_days: data.lead_time_days || 7
      };
      
      console.log('Processed product data before submission:', productData);
      
      await createProduct.mutateAsync(productData);
      console.log('Product created successfully, resetting form');
      reset();
      onSubmit?.();
    } catch (error) {
      // Better error handling
      console.error('Form submission error:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        cause: error?.cause,
        stack: error?.stack,
        error: error
      });
      
      // Also check if it's a Supabase error
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Supabase error code:', error.code);
        console.error('Supabase error details:', error.details);
        console.error('Supabase error hint:', error.hint);
      }
    }
  };

  return (
    <MobileFormLayout>
      <MobileFormCard title="Add New Product">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <MobileFormGrid cols={isMobile ? 1 : 2}>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <div className="space-y-2">
                <div className={cn(
                  "flex gap-2",
                  isMobile ? "flex-col" : "flex-row"
                )}>
                  <Input
                    id="sku"
                    {...register('sku', { required: 'SKU is required' })}
                    placeholder="Enter product SKU or generate automatically"
                    className="flex-1"
                  />
                  {skuConfig.enabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size={isMobile ? "default" : "sm"}
                      onClick={generateSKU}
                      className={cn(
                        "shrink-0",
                        isMobile ? "w-full" : ""
                      )}
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  )}
                </div>
                {skuConfig.enabled && skuPreview && (
                  <div className={cn(
                    "flex items-center gap-2",
                    isMobile ? "flex-col items-start" : "flex-row"
                  )}>
                    <Badge variant="outline" className="text-xs">
                      Next: {skuPreview}
                    </Badge>
                    <span className={cn(
                      "text-xs text-muted-foreground",
                      isMobile ? "text-left" : ""
                    )}>
                      Auto-generated based on current settings
                    </span>
                  </div>
                )}
                {errors.sku && <span className="text-destructive text-sm">{errors.sku.message}</span>}
              </div>
            </div>
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
                placeholder="Enter product name"
              />
              {errors.name && <span className="text-destructive text-sm">{errors.name.message}</span>}
            </div>
          </MobileFormGrid>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description"
            />
          </div>

          <MobileFormGrid cols={isMobile ? 1 : 3}>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Input
                id="unit_of_measure"
                {...register('unit_of_measure')}
                // Removed defaultValue to maintain controlled input
                placeholder="e.g., piece, kg, meter"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Enter barcode"
              />
            </div>
          </MobileFormGrid>

          <MobileFormGrid cols={isMobile ? 1 : 2}>
            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                {...register('unit_price', { required: 'Unit price is required', valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.unit_price && <span className="text-destructive text-sm">{errors.unit_price.message}</span>}
            </div>
            <div>
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                {...register('cost_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                {...register('tax_rate', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
                placeholder="16.00"
              />
            </div>
            <div>
              <Label htmlFor="warranty_period">Warranty (days)</Label>
              <Input
                id="warranty_period"
                type="number"
                {...register('warranty_period', { valueAsNumber: true })}
                placeholder="365"
              />
            </div>
          </MobileFormGrid>

          <MobileFormGrid cols={isMobile ? 1 : 2}>
            <div>
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                {...register('current_stock', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
              />
            </div>
            <div>
              <Label htmlFor="minimum_stock">Minimum Stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                {...register('minimum_stock', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
              />
            </div>
            <div>
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                {...register('reorder_point', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
              />
            </div>
            <div>
              <Label htmlFor="lead_time_days">Lead Time (days)</Label>
              <Input
                id="lead_time_days"
                type="number"
                {...register('lead_time_days', { valueAsNumber: true })}
                // Removed defaultValue to maintain controlled input
              />
            </div>
          </MobileFormGrid>

          <MobileFormGrid cols={isMobile ? 1 : 2}>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                {...register('weight', { valueAsNumber: true })}
                placeholder="0.000"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions (L×W×H)</Label>
              <Input
                id="dimensions"
                {...register('dimensions')}
                placeholder="e.g., 10×5×3 cm"
              />
            </div>
          </MobileFormGrid>

          <div className={cn(
            "flex items-center space-x-4",
            isMobile ? "flex-col space-x-0 space-y-4" : "flex-row"
          )}>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_serialized"
                checked={watch('is_serialized')}
                onCheckedChange={(checked) => setValue('is_serialized', checked)}
              />
              <Label htmlFor="is_serialized">Is Serialized</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Is Active</Label>
            </div>
          </div>

          <MobileFormActions>
            <Button 
              type="submit" 
              disabled={createProduct.isPending}
              className={isMobile ? "w-full" : ""}
            >
              {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </MobileFormActions>
        </form>
      </MobileFormCard>
    </MobileFormLayout>
  );
};

export default ProductForm;
