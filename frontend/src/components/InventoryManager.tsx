import React from 'react';
import { useERP } from '@/contexts/ERPContext';

const InventoryManager: React.FC = () => {
  const { state, fetchInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, adjustInventoryStock } = useERP();

  // Example of fetching inventory
  React.useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div>
      <h2>Inventory Management</h2>
      {state.loading.inventory ? (
        <p>Loading inventory...</p>
      ) : (
        <ul>
          {state.inventory.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> - {item.sku} - {item.quantity} {item.unit} at ${item.price} each
            </li>
          ))}
        </ul>
      )}
      {state.error.inventory && <p>Error: {state.error.inventory}</p>}
    </div>
  );
};

export default InventoryManager;

