import React from 'react';
import { useERP } from '@/contexts/ERPContext';

const OrdersManager: React.FC = () => {
  const { state, fetchOrders, createOrder, updateOrder, deleteOrder, updateOrderStatus } = useERP();

  // Example of fetching orders
  React.useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Orders Management</h2>
      {state.loading.orders ? (
        <p>Loading orders...</p>
      ) : (
        <ul>
          {state.orders.map((order) => (
            <li key={order.id}>
              <strong>{order.orderNumber}</strong> - {order.customerName} - ${order.total}
            </li>
          ))}
        </ul>
      )}
      {state.error.orders && <p>Error: {state.error.orders}</p>}
    </div>
  );
};

export default OrdersManager;

