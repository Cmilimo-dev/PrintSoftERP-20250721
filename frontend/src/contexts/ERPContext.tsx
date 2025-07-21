import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { orders, inventory, customers } from '@/lib/api';

// Types for ERP entities
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  orderDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  location: string;
  minStock: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ERPStats {
  orders: {
    totalOrders: number;
    totalRevenue: number;
    statusBreakdown: Record<string, number>;
    priorityBreakdown: Record<string, number>;
    ordersDueSoon: number;
    recentOrdersCount: number;
    averageOrderValue: number;
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    categories: number;
    categoryBreakdown: Array<{ category: string; itemCount: number; totalValue: number }>;
  };
}

// State interface
interface ERPState {
  orders: Order[];
  inventory: InventoryItem[];
  customers: Customer[];
  stats: ERPStats | null;
  loading: {
    orders: boolean;
    inventory: boolean;
    customers: boolean;
    stats: boolean;
  };
  error: {
    orders: string | null;
    inventory: string | null;
    customers: string | null;
    stats: string | null;
  };
}

// Action types
type ERPAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { section: keyof ERPState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { section: keyof ERPState['error']; error: string | null } }
  
  // Orders actions
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: number }
  
  // Inventory actions
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: number }
  
  // Customers actions
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: number }
  
  // Stats actions
  | { type: 'SET_STATS'; payload: ERPStats };

// Initial state
const initialState: ERPState = {
  orders: [],
  inventory: [],
  customers: [],
  stats: null,
  loading: {
    orders: false,
    inventory: false,
    customers: false,
    stats: false,
  },
  error: {
    orders: null,
    inventory: null,
    customers: null,
    stats: null,
  },
};

// Reducer
const erpReducer = (state: ERPState, action: ERPAction): ERPState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.section]: action.payload.loading },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.section]: action.payload.error },
      };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
      };
    
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload),
      };
    
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    
    case 'ADD_INVENTORY_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload),
      };
    
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        ),
      };
    
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    default:
      return state;
  }
};

// Context interface
interface ERPContextType {
  state: ERPState;
  
  // Orders methods
  fetchOrders: (params?: any) => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<void>;
  updateOrder: (id: number, orderData: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: number, status: string, notes?: string) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  
  // Inventory methods
  fetchInventory: (params?: any) => Promise<void>;
  createInventoryItem: (itemData: Partial<InventoryItem>) => Promise<void>;
  updateInventoryItem: (id: number, itemData: Partial<InventoryItem>) => Promise<void>;
  adjustInventoryStock: (id: number, adjustment: number, reason: string) => Promise<void>;
  deleteInventoryItem: (id: number) => Promise<void>;
  
  // Customers methods
  fetchCustomers: () => Promise<void>;
  createCustomer: (customerData: Partial<Customer>) => Promise<void>;
  updateCustomer: (id: number, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  
  // Stats methods
  fetchStats: () => Promise<void>;
  
  // Utility methods
  refreshAll: () => Promise<void>;
}

// Create context
const ERPContext = createContext<ERPContextType | undefined>(undefined);

// Provider component
export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(erpReducer, initialState);

  // Helper function for error handling
  const handleApiCall = async <T,>(
    section: keyof ERPState['loading'],
    apiCall: () => Promise<{ data: T; success: boolean }>,
    onSuccess: (data: T) => void
  ): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { section, loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { section, error: null } });
    
    try {
      const response = await apiCall();
      if (response.success) {
        onSuccess(response.data);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { section, error: (error as Error).message },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section, loading: false } });
    }
  };

  // Orders methods
  const fetchOrders = async (params?: any) => {
    await handleApiCall(
      'orders',
      () => orders.getAll(params),
      (data) => dispatch({ type: 'SET_ORDERS', payload: data })
    );
  };

  const createOrder = async (orderData: Partial<Order>) => {
    await handleApiCall(
      'orders',
      () => orders.create(orderData),
      (data) => dispatch({ type: 'ADD_ORDER', payload: data })
    );
  };

  const updateOrder = async (id: number, orderData: Partial<Order>) => {
    await handleApiCall(
      'orders',
      () => orders.update(id.toString(), orderData),
      (data) => dispatch({ type: 'UPDATE_ORDER', payload: data })
    );
  };

  const updateOrderStatus = async (id: number, status: string, notes?: string) => {
    await handleApiCall(
      'orders',
      () => orders.updateStatus(id.toString(), { status, notes }),
      (data) => dispatch({ type: 'UPDATE_ORDER', payload: data })
    );
  };

  const deleteOrder = async (id: number) => {
    await handleApiCall(
      'orders',
      () => orders.delete(id.toString()),
      () => dispatch({ type: 'DELETE_ORDER', payload: id })
    );
  };

  // Inventory methods
  const fetchInventory = async (params?: any) => {
    await handleApiCall(
      'inventory',
      () => inventory.getAll(params),
      (data) => dispatch({ type: 'SET_INVENTORY', payload: data })
    );
  };

  const createInventoryItem = async (itemData: Partial<InventoryItem>) => {
    await handleApiCall(
      'inventory',
      () => inventory.create(itemData),
      (data) => dispatch({ type: 'ADD_INVENTORY_ITEM', payload: data })
    );
  };

  const updateInventoryItem = async (id: number, itemData: Partial<InventoryItem>) => {
    await handleApiCall(
      'inventory',
      () => inventory.update(id.toString(), itemData),
      (data) => dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: data })
    );
  };

  const adjustInventoryStock = async (id: number, adjustment: number, reason: string) => {
    await handleApiCall(
      'inventory',
      () => inventory.adjust(id.toString(), { adjustment, reason }),
      (data) => dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: data })
    );
  };

  const deleteInventoryItem = async (id: number) => {
    await handleApiCall(
      'inventory',
      () => inventory.delete(id.toString()),
      () => dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: id })
    );
  };

  // Customers methods
  const fetchCustomers = async () => {
    await handleApiCall(
      'customers',
      () => customers.getAll(),
      (data) => dispatch({ type: 'SET_CUSTOMERS', payload: data })
    );
  };

  const createCustomer = async (customerData: Partial<Customer>) => {
    await handleApiCall(
      'customers',
      () => customers.create(customerData),
      (data) => dispatch({ type: 'ADD_CUSTOMER', payload: data })
    );
  };

  const updateCustomer = async (id: number, customerData: Partial<Customer>) => {
    // Note: This assumes customers API has update method
    // await handleApiCall(
    //   'customers',
    //   () => customers.update(id.toString(), customerData),
    //   (data) => dispatch({ type: 'UPDATE_CUSTOMER', payload: data })
    // );
  };

  const deleteCustomer = async (id: number) => {
    // Note: This assumes customers API has delete method
    // await handleApiCall(
    //   'customers',
    //   () => customers.delete(id.toString()),
    //   () => dispatch({ type: 'DELETE_CUSTOMER', payload: id })
    // );
  };

  // Stats methods
  const fetchStats = async () => {
    dispatch({ type: 'SET_LOADING', payload: { section: 'stats', loading: true } });
    
    try {
      const [ordersStats, inventoryStats] = await Promise.all([
        orders.getStats(),
        inventory.getStats(),
      ]);
      
      if (ordersStats.success && inventoryStats.success) {
        dispatch({
          type: 'SET_STATS',
          payload: {
            orders: ordersStats.data,
            inventory: inventoryStats.data,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { section: 'stats', error: (error as Error).message },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { section: 'stats', loading: false } });
    }
  };

  // Utility methods
  const refreshAll = async () => {
    await Promise.all([
      fetchOrders(),
      fetchInventory(),
      fetchCustomers(),
      fetchStats(),
    ]);
  };

  // Initial data loading
  useEffect(() => {
    refreshAll();
  }, []);

  const contextValue: ERPContextType = {
    state,
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    adjustInventoryStock,
    deleteInventoryItem,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchStats,
    refreshAll,
  };

  return (
    <ERPContext.Provider value={contextValue}>
      {children}
    </ERPContext.Provider>
  );
};

// Hook for using ERP context
export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

export default ERPContext;
