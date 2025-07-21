import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Target,
  Calendar,
  Percent
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');

  // Mock data for analytics
  const kpis = {
    totalRevenue: 101500,
    revenueGrowth: 12.5,
    totalPurchases: 61500,
    purchaseGrowth: -3.2,
    grossProfit: 40000,
    profitMargin: 39.4,
    totalCustomers: 48,
    customerGrowth: 8.3,
    totalVendors: 15,
    vendorGrowth: 2.1,
    inventoryValue: 85000,
    inventoryTurnover: 4.2
  };

  const topPerformers = {
    customers: [
      { name: 'Tech Solutions Inc', code: 'CUST-001', revenue: 37000, orders: 8 },
      { name: 'Global Enterprises', code: 'CUST-002', revenue: 25500, orders: 12 },
      { name: 'Enterprise Corp', code: 'CUST-005', revenue: 15000, orders: 3 }
    ],
    vendors: [
      { name: 'ABC Suppliers Ltd', code: 'VND-001', purchases: 18200, orders: 6 },
      { name: 'Global Parts Inc', code: 'VND-003', purchases: 22000, orders: 4 },
      { name: 'Tech Components Co', code: 'VND-004', purchases: 12800, orders: 3 }
    ],
    products: [
      { name: 'Professional Software License', code: 'PROD-001', sold: 25, revenue: 12500 },
      { name: 'Hardware Component A', code: 'PROD-002', sold: 40, revenue: 8000 },
      { name: 'Service Package Premium', code: 'PROD-003', sold: 15, revenue: 7500 }
    ]
  };

  const alerts = [
    { type: 'warning', message: 'Low inventory for 3 products', count: 3 },
    { type: 'danger', message: 'Overdue payments from 2 customers', count: 2 },
    { type: 'info', message: 'New purchase orders require approval', count: 5 }
  ];

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getAlertVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'danger': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Business Analytics</h2>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs">
                {getGrowthIcon(kpis.revenueGrowth)}
                <span className={getGrowthColor(kpis.revenueGrowth)}>
                  {Math.abs(kpis.revenueGrowth)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.totalPurchases.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs">
                {getGrowthIcon(kpis.purchaseGrowth)}
                <span className={getGrowthColor(kpis.purchaseGrowth)}>
                  {Math.abs(kpis.purchaseGrowth)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.grossProfit.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Percent className="h-3 w-3" />
                <span>{kpis.profitMargin}% margin</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.inventoryValue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{kpis.inventoryTurnover}x turnover ratio</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Alerts & Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <Badge variant={getAlertVariant(alert.type)}>
                    {alert.count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.customers.map((customer, index) => (
              <div key={customer.code} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{customer.name}</div>
                  <div className="text-xs text-muted-foreground">{customer.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${customer.revenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{customer.orders} orders</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Top Vendors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.vendors.map((vendor, index) => (
              <div key={vendor.code} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{vendor.name}</div>
                  <div className="text-xs text-muted-foreground">{vendor.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${vendor.purchases.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{vendor.orders} orders</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.products.map((product, index) => (
              <div key={product.code} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${product.revenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{product.sold} sold</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalCustomers}</div>
              <div className="flex items-center gap-1 text-xs">
                {getGrowthIcon(kpis.customerGrowth)}
                <span className={getGrowthColor(kpis.customerGrowth)}>
                  {Math.abs(kpis.customerGrowth)}% growth
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalVendors}</div>
              <div className="flex items-center gap-1 text-xs">
                {getGrowthIcon(kpis.vendorGrowth)}
                <span className={getGrowthColor(kpis.vendorGrowth)}>
                  {Math.abs(kpis.vendorGrowth)}% growth
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(kpis.totalRevenue / 28).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Sales orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">73.5%</div>
              <p className="text-xs text-muted-foreground">
                Quote to sale
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
