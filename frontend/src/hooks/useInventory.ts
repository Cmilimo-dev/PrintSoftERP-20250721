
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductCategory, Warehouse, Inventory, StockMovement } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/config/api';

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }

  return response.json();
};

// Development mode flag to use localStorage instead of database
const isDevelopmentMode = false; // Set to true only for offline development

// Mock data for development
const getMockProducts = () => [
  {
    id: '1',
    name: 'Sample Widget',
    sku: 'WID-001',
    unit_price: 25.99,
    cost_price: 15.00,
    description: 'A sample widget product',
    unit_of_measure: 'pcs',
    minimum_stock: 10,
    reorder_point: 10,
    is_active: true,
    current_stock: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const getMockCategories = () => [
  { id: '1', name: 'General', description: 'General products', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Electronics', description: 'Electronic products', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Office Supplies', description: 'Office supplies and equipment', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const getMockWarehouses = () => [
  { id: '1', name: 'Main Warehouse', code: 'WH-001', address: '123 Storage St', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Secondary Warehouse', code: 'WH-002', address: '456 Storage Ave', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

// Helper function to get/set products from localStorage
const getLocalProducts = () => {
  try {
    const stored = localStorage.getItem('erp_products');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalProducts = (products: any[]) => {
  try {
    localStorage.setItem('erp_products', JSON.stringify(products));
  } catch (error) {
    console.warn('Failed to save products to localStorage:', error);
  }
};

// Helper functions for categories
const getLocalCategories = () => {
  try {
    const stored = localStorage.getItem('erp_categories');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalCategories = (categories: any[]) => {
  try {
    localStorage.setItem('erp_categories', JSON.stringify(categories));
  } catch (error) {
    console.warn('Failed to save categories to localStorage:', error);
  }
};

// Helper functions for warehouses
const getLocalWarehouses = () => {
  try {
    const stored = localStorage.getItem('erp_warehouses');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalWarehouses = (warehouses: any[]) => {
  try {
    localStorage.setItem('erp_warehouses', JSON.stringify(warehouses));
  } catch (error) {
    console.warn('Failed to save warehouses to localStorage:', error);
  }
};

// Helper functions for stock movements
const getLocalStockMovements = () => {
  try {
    const stored = localStorage.getItem('erp_stock_movements');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalStockMovements = (movements: any[]) => {
  try {
    localStorage.setItem('erp_stock_movements', JSON.stringify(movements));
  } catch (error) {
    console.warn('Failed to save stock movements to localStorage:', error);
  }
};

// Export helper functions for use in components
export { getLocalCategories, setLocalCategories, getLocalWarehouses, setLocalWarehouses, getLocalStockMovements, setLocalStockMovements };

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // In development mode, use localStorage only
      if (isDevelopmentMode) {
        console.log('Development mode: Using localStorage for products');
        const localProducts = getLocalProducts();
        
        if (localProducts.length > 0) {
          return localProducts;
        }
        
        // Initialize with mock data if no local products exist
        const mockData = getMockProducts();
        setLocalProducts(mockData);
        return mockData;
      }
      
      try {
        // Try to fetch from API
        const data = await apiRequest('/rest/v1/parts?order=name');
        
        // Merge database data with local products
        const localProducts = getLocalProducts();
        const combinedProducts = [...data, ...localProducts];
        
        // Return data directly with proper transformation for components that expect Product interface
        const transformedProducts = combinedProducts.map(part => ({
          ...part,
          sku: part.part_number || part.sku, // Add sku field for compatibility
          unit_price: part.selling_price || part.unit_price, // Map selling_price to unit_price for compatibility
          cost_price: part.unit_cost || part.cost_price, // Map unit_cost to cost_price for compatibility
          current_stock: part.current_stock || part.stock_quantity || 0,
          stock_quantity: part.stock_quantity || part.current_stock || 0,
          maximum_stock: part.maximum_stock || null,
          lead_time_days: part.lead_time_days || 1,
          is_serialized: part.is_serialized || false,
          tax_rate: part.tax_rate || 16,
          warranty_period: part.warranty_period || null
        }));
        
        return transformedProducts;
      } catch (error) {
        console.warn('Error fetching products from API, checking localStorage:', error);
        
        // Try to get locally stored products first
        const localProducts = getLocalProducts();
        if (localProducts.length > 0) {
          console.log('Using locally stored products:', localProducts.length);
          return localProducts;
        }
        
        // Fallback to mock data
        const mockData = getMockProducts();
        setLocalProducts(mockData);
        return mockData;
      }
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product_categories'],
    queryFn: async () => {
      // In development mode, use localStorage for categories
      if (isDevelopmentMode) {
        console.log('Development mode: Using localStorage for categories');
        const localCategories = getLocalCategories();
        
        if (localCategories.length > 0) {
          return localCategories;
        }
        
        // Initialize with mock data if no local categories exist
        const mockData = getMockCategories();
        setLocalCategories(mockData);
        return mockData;
      }
      
      try {
        const data = await apiRequest('/rest/v1/product-categories?is_active=eq.true&order=sort_order');
        return data || [];
      } catch (error) {
        console.log('Error fetching product categories, using mock data:', error);
        return getMockCategories();
      }
    },
  });
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      // In development mode, use localStorage for warehouses
      if (isDevelopmentMode) {
        console.log('Development mode: Using localStorage for warehouses');
        const localWarehouses = getLocalWarehouses();
        
        if (localWarehouses.length > 0) {
          return localWarehouses;
        }
        
        // Initialize with mock data if no local warehouses exist
        const mockData = getMockWarehouses();
        setLocalWarehouses(mockData);
        return mockData;
      }
      
      try {
        // Use locations table
        const data = await apiRequest('/rest/v1/locations?order=name');
        
        // Transform locations to warehouses
        return data.map(location => ({
          id: location.id,
          name: location.name,
          code: location.code,
          address: location.address,
          created_at: location.created_at,
          updated_at: location.updated_at
        })) as Warehouse[];
      } catch (error) {
        console.log('Error fetching warehouses, returning mock data:', error);
        return getMockWarehouses();
      }
    },
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      try {
        // Try current_inventory view first
        const data = await apiRequest('/rest/v1/current-inventory?order=updated_at.desc');
        return data || [];
      } catch (error) {
        console.log('Current_inventory view not found, trying parts table:', error);
        try {
          // Fallback to parts table
          const partsData = await apiRequest('/rest/v1/parts?order=updated_at.desc');
          return partsData || [];
        } catch (partsError) {
          console.log('Parts table not found either, returning empty array:', partsError);
          return [];
        }
      }
    },
  });
};

export const useStockMovements = () => {
  return useQuery({
    queryKey: ['stock_movements'],
    queryFn: async () => {
      try {
        // Try stock_movements table first
        const data = await apiRequest('/rest/v1/stock-movements?order=movement_date.desc&limit=20');
        return data || [];
      } catch (error) {
        console.log('Stock movements query failed, trying simpler query:', error);
        try {
          // Fallback to inventory-transactions
          const transactionData = await apiRequest('/rest/v1/inventory-transactions?order=transaction_date.desc&limit=20');
          return transactionData || [];
        } catch (transactionError) {
          console.log('Inventory transactions table not found, returning empty array:', transactionError);
          return [];
        }
      }
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('useCreateProduct: Received product data:', product);
      
      // Validate required fields
      if (!product.sku || !product.name || product.unit_price === undefined) {
        const error = new Error('Missing required fields: SKU, name, and unit price are required');
        console.error('useCreateProduct: Validation error:', error.message);
        throw error;
      }
      
      // In development mode, save directly to localStorage
      if (isDevelopmentMode) {
        console.log('Development mode: Saving product to localStorage');
        const localProducts = getLocalProducts();
        const newProduct = {
          id: Date.now().toString(),
          ...product,
          sku: product.sku,
          unit_price: product.unit_price,
          cost_price: product.cost_price || 0,
          current_stock: product.current_stock || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedProducts = [...localProducts, newProduct];
        setLocalProducts(updatedProducts);
        
        console.log('useCreateProduct: Product saved to localStorage:', newProduct);
        return newProduct;
      }
      
      try {
        // Transform Product to parts table schema (matching existing database)
        const productData = {
          name: product.name,
          part_number: product.sku, // parts table uses part_number instead of sku
          description: product.description || null,
          category_id: product.category_id || null,
          selling_price: product.unit_price, // parts table uses selling_price
          unit_cost: product.cost_price || 0,
          current_stock: product.current_stock || 0,
          minimum_stock: product.minimum_stock || 0,
          reorder_point: product.reorder_point || product.minimum_stock || 0,
          unit_of_measure: product.unit_of_measure || 'pcs',
          barcode: product.barcode || null,
          weight: product.weight || null,
          dimensions: product.dimensions || null,
          lead_time_days: product.lead_time_days || 7,
          is_serialized: product.is_serialized || false,
          tax_rate: product.tax_rate || 16,
          warranty_period: product.warranty_period || null,
          is_active: product.is_active !== false
        };
        
        console.log('useCreateProduct: Transformed product data for parts table:', productData);

        const data = await apiRequest('/rest/v1/parts', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        
        console.log('useCreateProduct: Success, created inventory item:', data);
        return data;
      } catch (error) {
        console.warn('useCreateProduct: Database connection failed, saving to localStorage:', error);
        
        // Fallback to localStorage when database connection fails
        const localProducts = getLocalProducts();
        const newProduct = {
          id: Date.now().toString(),
          ...product,
          sku: product.sku,
          unit_price: product.unit_price,
          cost_price: product.cost_price || 0,
          current_stock: product.current_stock || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedProducts = [...localProducts, newProduct];
        setLocalProducts(updatedProducts);
        
        console.log('useCreateProduct: Product saved to localStorage (fallback):', newProduct);
        return newProduct;
      }
    },
    onSuccess: (data) => {
      console.log('useCreateProduct: Mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: `Product "${data.name}" created successfully`,
      });
    },
    onError: (error) => {
      console.error('useCreateProduct: Mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to create product: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (movement: Omit<StockMovement, 'id' | 'created_at'>) => {
      console.log('useCreateStockMovement: Received movement data:', movement);
      
      // In development mode, save to localStorage
      if (isDevelopmentMode) {
        console.log('Development mode: Saving stock movement to localStorage');
        const localMovements = getLocalStockMovements();
        const newMovement = {
          id: Date.now().toString(),
          ...movement,
          created_at: new Date().toISOString()
        };
        
        const updatedMovements = [...localMovements, newMovement];
        setLocalStockMovements(updatedMovements);
        
        console.log('useCreateStockMovement: Stock movement saved to localStorage:', newMovement);
        return newMovement;
      }
      
      // Transform to inventory_transactions schema for the backend API
      const transactionData = {
        part_id: movement.product_id,
        location_id: movement.warehouse_id,
        transaction_type: movement.movement_type,
        quantity: movement.quantity,
        unit_cost: movement.unit_cost,
        reference_type: movement.reference_type,
        reference_id: movement.reference_id,
        notes: movement.notes,
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_number: `TXN-${Date.now()}`
      };

      try {
        console.log('useCreateStockMovement: Sending to API:', transactionData);
        const data = await apiRequest('/rest/v1/inventory-transactions', {
          method: 'POST',
          body: JSON.stringify(transactionData),
        });
        
        console.log('useCreateStockMovement: API response:', data);
        return data;
      } catch (error) {
        console.warn('useCreateStockMovement: API call failed, saving to localStorage:', error);
        
        // Fallback to localStorage when API is unavailable
        const localMovements = getLocalStockMovements();
        const newMovement = {
          id: Date.now().toString(),
          ...movement,
          created_at: new Date().toISOString()
        };
        
        const updatedMovements = [...localMovements, newMovement];
        setLocalStockMovements(updatedMovements);
        
        console.log('useCreateStockMovement: Stock movement saved to localStorage (fallback):', newMovement);
        return newMovement;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Stock movement recorded successfully",
      });
    },
    onError: (error) => {
      console.error('useCreateStockMovement: Mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to record stock movement: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
};
