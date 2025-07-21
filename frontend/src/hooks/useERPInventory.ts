// Clean ERP inventory hook without business document dependencies
import { useState, useEffect } from 'react';
import { ERPInventoryItem, ERPStockMovement } from '../types/erpTypes';
import { erpDataService } from '../services/erpDataService';

export interface UseERPInventoryReturn {
  items: ERPInventoryItem[];
  movements: ERPStockMovement[];
  loading: boolean;
  error: string | null;
  searchItems: (query: string) => ERPInventoryItem[];
  saveItem: (item: ERPInventoryItem) => Promise<ERPInventoryItem>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => ERPInventoryItem | undefined;
  addStockMovement: (movement: ERPStockMovement) => Promise<ERPStockMovement>;
  getInventoryStats: () => any;
  refreshInventory: () => void;
}

export function useERPInventory(): UseERPInventoryReturn {
  const [items, setItems] = useState<ERPInventoryItem[]>([]);
  const [movements, setMovements] = useState<ERPStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = () => {
    try {
      setLoading(true);
      setError(null);
      const itemsData = erpDataService.getInventoryItems();
      const movementsData = erpDataService.getStockMovements();
      setItems(itemsData);
      setMovements(movementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const searchItems = (query: string): ERPInventoryItem[] => {
    try {
      return erpDataService.searchInventory(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    }
  };

  const saveItem = async (item: ERPInventoryItem): Promise<ERPInventoryItem> => {
    try {
      setError(null);
      const savedItem = erpDataService.saveInventoryItem(item);
      loadInventory(); // Refresh the list
      return savedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      setError(null);
      erpDataService.deleteInventoryItem(id);
      loadInventory(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getItem = (id: string): ERPInventoryItem | undefined => {
    return items.find(item => item.id === id);
  };

  const addStockMovement = async (movement: ERPStockMovement): Promise<ERPStockMovement> => {
    try {
      setError(null);
      const savedMovement = erpDataService.addStockMovement(movement);
      loadInventory(); // Refresh to get updated quantities
      return savedMovement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add stock movement';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getInventoryStats = () => {
    try {
      return erpDataService.getInventoryStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get stats');
      return {
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      };
    }
  };

  const refreshInventory = () => {
    loadInventory();
  };

  return {
    items,
    movements,
    loading,
    error,
    searchItems,
    saveItem,
    deleteItem,
    getItem,
    addStockMovement,
    getInventoryStats,
    refreshInventory
  };
}
