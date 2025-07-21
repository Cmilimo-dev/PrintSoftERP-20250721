import { useState, useEffect } from 'react';
import { Inventory } from '@/types/inventory';

interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'reorder_point';
  currentStock: number;
  threshold: number;
  message: string;
  timestamp: string;
}

interface UseInventoryMonitoringReturn {
  alerts: InventoryAlert[];
  clearAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export const useInventoryMonitoring = (): UseInventoryMonitoringReturn => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkInventoryLevels = async () => {
    try {
      // In a real application, this would fetch from your API
      // For now, we'll simulate inventory checking with simpler data
      const mockInventoryData: Inventory[] = [
        {
          id: '1',
          product_id: 'PROD001',
          warehouse_id: 'WH001',
          quantity: 5,
          reserved_quantity: 2,
          available_quantity: 3,
          minimum_stock: 10,
          maximum_stock: 100,
          reorder_point: 15,
          last_counted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          product_id: 'PROD002',
          warehouse_id: 'WH001',
          quantity: 0,
          reserved_quantity: 0,
          available_quantity: 0,
          minimum_stock: 5,
          maximum_stock: 50,
          reorder_point: 10,
          last_counted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      const newAlerts: InventoryAlert[] = [];

      mockInventoryData.forEach(inventory => {
        const productName = `Product ${inventory.product_id}`; // In real app, fetch product name

        // Check for out of stock
        if (inventory.available_quantity === 0) {
          newAlerts.push({
            id: `alert-${inventory.product_id}-out-of-stock`,
            productId: inventory.product_id,
            productName,
            type: 'out_of_stock',
            currentStock: inventory.available_quantity,
            threshold: 0,
            message: `${productName} is out of stock`,
            timestamp: new Date().toISOString(),
          });
        }
        // Check for low stock
        else if (inventory.available_quantity <= inventory.minimum_stock) {
          newAlerts.push({
            id: `alert-${inventory.product_id}-low-stock`,
            productId: inventory.product_id,
            productName,
            type: 'low_stock',
            currentStock: inventory.available_quantity,
            threshold: inventory.minimum_stock,
            message: `${productName} is running low (${inventory.available_quantity} remaining)`,
            timestamp: new Date().toISOString(),
          });
        }
        // Check for reorder point
        else if (inventory.available_quantity <= inventory.reorder_point) {
          newAlerts.push({
            id: `alert-${inventory.product_id}-reorder`,
            productId: inventory.product_id,
            productName,
            type: 'reorder_point',
            currentStock: inventory.available_quantity,
            threshold: inventory.reorder_point,
            message: `${productName} has reached reorder point (${inventory.available_quantity} remaining)`,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Update alerts, avoiding duplicates
      setAlerts(prevAlerts => {
        const existingAlertIds = new Set(prevAlerts.map(alert => alert.id));
        const filteredNewAlerts = newAlerts.filter(alert => !existingAlertIds.has(alert.id));
        return [...prevAlerts, ...filteredNewAlerts];
      });

    } catch (error) {
      console.error('Error checking inventory levels:', error);
    }
  };

  const clearAlert = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isMonitoring) {
      // Check immediately
      checkInventoryLevels();
      
      // Then check every 30 seconds
      interval = setInterval(checkInventoryLevels, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring]);

  return {
    alerts,
    clearAlert,
    clearAllAlerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
};

export default useInventoryMonitoring;
