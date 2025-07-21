import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  MapPin, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Warehouse,
  Box,
  Activity
} from 'lucide-react';
import { enhancedInventoryApi } from '@/api/enhanced-inventory';
import { InventoryDashboardData } from '@/types/enhanced-database';

export const EnhancedInventoryDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn: enhancedInventoryApi.getInventoryDashboardData
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center p-8">No data available</div>;
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory performance and status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_parts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_locations}</div>
            <p className="text-xs text-muted-foreground">
              Storage locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.total_stock_value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData.low_stock_items}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Value</CardTitle>
            <CardDescription>
              Highest value product categories in your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.top_categories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Box className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{category.category}</p>
                      <p className="text-xs text-gray-500">{category.count} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(category.value)}
                    </p>
                    <Progress 
                      value={(category.value / dashboardData.top_categories[0].value) * 100} 
                      className="w-16 h-2 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>
              Latest inventory transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recent_movements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{movement.movement_number}</p>
                      <p className="text-xs text-gray-500">
                        {movement.part?.name} - {movement.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={movement.movement_type === 'in' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {movement.movement_type.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(movement.movement_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {dashboardData.stock_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Stock Alerts</span>
            </CardTitle>
            <CardDescription>
              Items that require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.stock_alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{alert.part?.name}</h4>
                      <p className="text-xs text-gray-600">{alert.part?.part_number}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-orange-300 text-orange-700"
                    >
                      {alert.alert_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-orange-700">
                      Current: {alert.current_quantity} units
                    </p>
                    {alert.threshold_quantity && (
                      <p className="text-xs text-gray-600">
                        Threshold: {alert.threshold_quantity} units
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedInventoryDashboard;
