import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { Tags, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useBackendData';
import { getLocalCategories, setLocalCategories } from '@/hooks/useInventory';

export const ProductCategoryManager = () => {
  const isMobile = useIsMobile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Backend hooks
  const { data: backendCategories, isLoading, error } = useCategories('product');
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  
  // Fallback to localStorage if backend fails
  const [localCategories, setLocalCategories] = useState(getLocalCategories());
  
  // Use backend data if available, otherwise use localStorage
  const categories = backendCategories || localCategories;
  const isBackendAvailable = !error && backendCategories;

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (isBackendAvailable) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
        console.error('Error deleting category:', error);
      }
    } else {
      // Fallback to localStorage
      const updatedCategories = localCategories.filter(cat => cat.id !== categoryId);
      setLocalCategories(updatedCategories);
      setLocalCategories(updatedCategories);
      toast.success('Category deleted successfully (local storage)');
    }
  };

  const handleFormSubmit = async (newCategory) => {
    if (isBackendAvailable) {
      try {
        if (editingCategory) {
          await updateCategoryMutation.mutateAsync({
            id: editingCategory.id,
            data: { ...newCategory, type: 'product' }
          });
          toast.success('Category updated successfully');
        } else {
          await createCategoryMutation.mutateAsync({ ...newCategory, type: 'product' });
          toast.success('Category created successfully');
        }
        setIsFormOpen(false);
      } catch (error) {
        toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
        console.error('Error saving category:', error);
      }
    } else {
      // Fallback to localStorage
      const updatedCategories = editingCategory 
        ? localCategories.map(cat => cat.id === editingCategory.id ? { ...cat, ...newCategory } : cat)
        : [...localCategories, { id: Date.now().toString(), ...newCategory }];
      setLocalCategories(updatedCategories);
      setLocalCategories(updatedCategories);
      setIsFormOpen(false);
      toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully (local storage)`);
    }
  };

  return (
    <div className={cn(
      "space-y-4",
      isMobile ? "p-2" : ""
    )}>
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center justify-between",
            isMobile ? "text-lg" : ""
          )}>
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Product Categories
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                </DialogHeader>
                <CategoryForm 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setIsFormOpen(false)}
                  initialData={editingCategory} 
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading categories...</span>
            </div>
          ) : (
            <>
              {!isBackendAvailable && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Backend unavailable. Using local storage. Changes will sync when backend is available.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No categories available. Click "Add Category" to get started.
                  </p>
                ) : (
                  categories.map(category => (
                    <div key={category.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditCategory(category)}
                          disabled={updateCategoryMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          {deleteCategoryMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCategoryManager;
