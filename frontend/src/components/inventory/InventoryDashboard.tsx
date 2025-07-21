
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts, useInventory } from '@/hooks/useInventory';
import { Package, AlertTriangle, TrendingUp, Warehouse } from 'lucide-react';
import { DashboardStatsGrid } from '@/components/ui/mobile-dashboard-layout';

const InventoryDashboard: React.FC = () => {
  const { data: products } = useProducts();
  const { data: inventory } = useInventory();

  const totalProducts = products?.length || 0;
  const lowStockProducts = products?.filter(p => p.current_stock <= p.reorder_point).length || 0;
  const outOfStockProducts = products?.filter(p => p.current_stock <= 0).length || 0;
  const totalInventoryValue = products?.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0) || 0;

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: 'Inventory Value',
      value: `KES ${totalInventoryValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ];

  return (
    <DashboardStatsGrid columns={4}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </DashboardStatsGrid>
  );
};

export default InventoryDashboard;
