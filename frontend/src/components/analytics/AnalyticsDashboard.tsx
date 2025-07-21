import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MobileDashboardLayout,
  DashboardStatsGrid,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  Download,
  RefreshCw,
  Calendar,
  AlertCircle,
  Eye,
  FileText,
  ShoppingCart,
  Lightbulb
} from 'lucide-react';
import { DateRange } from '@/components/ui/date-range-picker';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [autoRefresh, setAutoRefresh] = useState(false);

  const analyticsRange = dateRange ? {
    startDate: dateRange.from?.toISOString().split('T')[0] || '',
    endDate: dateRange.to?.toISOString().split('T')[0] || '',
  } : {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };

  const {
    analyticsData,
    salesChartData,
    inventoryTrendData,
    customerSegmentData,
    kpis,
    insights,
    isLoading,
    error,
    refreshAll,
    exportToPDF,
    exportToExcel,
    exportToCSV,
    formatCurrency,
    formatPercentage,
    isExportingPDF,
    isExportingExcel,
    isExportingCSV,
  } = useAnalytics({
    dateRange: analyticsRange,
    autoRefresh,
    refreshInterval: 300000, // 5 minutes
  });

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!analyticsData) return;
    
    switch (format) {
      case 'pdf':
        exportToPDF(analyticsData);
        break;
      case 'excel':
        exportToExcel(analyticsData);
        break;
      case 'csv':
        exportToCSV(analyticsData);
        break;
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading analytics: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <MobileDashboardLayout className={`space-y-6 ${className}`}>
      {/* Header */}
      <DashboardHeader
        title="Analytics Dashboard"
        subtitle="Business insights and performance metrics"
      >
        <div className="flex items-center gap-3">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={isExportingPDF || !analyticsData}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={isExportingExcel || !analyticsData}
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExportingCSV || !analyticsData}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </DashboardHeader>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {kpis && (
        <DashboardStatsGrid columns={4}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
              <div className={`flex items-center text-xs ${getGrowthColor(kpis.revenueGrowth)}`}>
                {getGrowthIcon(kpis.revenueGrowth)}
                <span className="ml-1">{formatPercentage(Math.abs(kpis.revenueGrowth))} from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalOrders.toLocaleString()}</div>
              <div className={`flex items-center text-xs ${getGrowthColor(kpis.orderGrowth)}`}>
                {getGrowthIcon(kpis.orderGrowth)}
                <span className="ml-1">{formatPercentage(Math.abs(kpis.orderGrowth))} from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.averageOrderValue)}</div>
              <div className={`flex items-center text-xs ${getGrowthColor(kpis.aovGrowth)}`}>
                {getGrowthIcon(kpis.aovGrowth)}
                <span className="ml-1">{formatPercentage(Math.abs(kpis.aovGrowth))} from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(kpis.profitMargin)}</div>
              <div className="text-xs text-muted-foreground">
                Net: {formatCurrency(analyticsData?.financial.netProfit || 0)}
              </div>
            </CardContent>
          </Card>
        </DashboardStatsGrid>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Status Overview */}
            {analyticsData && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Quotes</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{analyticsData.documents.quotes.total}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(analyticsData.documents.quotes.conversionRate)} conversion
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Invoices</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{analyticsData.documents.invoices.total}</Badge>
                      <Badge variant="secondary">{analyticsData.documents.invoices.paid} paid</Badge>
                      <Badge variant="destructive">{analyticsData.documents.invoices.overdue} overdue</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Purchase Orders</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{analyticsData.documents.purchaseOrders.total}</Badge>
                      <Badge variant="secondary">{analyticsData.documents.purchaseOrders.fulfilled} fulfilled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            {analyticsData && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Customer Retention</span>
                    <Badge variant="outline">{formatPercentage(analyticsData.customers.customerRetentionRate)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Inventory Turnover</span>
                    <Badge variant="outline">{analyticsData.inventory.turnoverRate}x</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low Stock Items</span>
                    <Badge variant={analyticsData.inventory.lowStockItems > 10 ? 'destructive' : 'secondary'}>
                      {analyticsData.inventory.lowStockItems}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Out of Stock</span>
                    <Badge variant={analyticsData.inventory.outOfStockItems > 0 ? 'destructive' : 'secondary'}>
                      {analyticsData.inventory.outOfStockItems}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-bold">{formatCurrency(analyticsData.sales.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-bold">{analyticsData.sales.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value:</span>
                    <span className="font-bold">{formatCurrency(analyticsData.sales.averageOrderValue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Revenue Growth:</span>
                    <div className={`flex items-center ${getGrowthColor(analyticsData.sales.growth.revenue)}`}>
                      {getGrowthIcon(analyticsData.sales.growth.revenue)}
                      <span className="ml-1 font-bold">{formatPercentage(Math.abs(analyticsData.sales.growth.revenue))}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Order Growth:</span>
                    <div className={`flex items-center ${getGrowthColor(analyticsData.sales.growth.orders)}`}>
                      {getGrowthIcon(analyticsData.sales.growth.orders)}
                      <span className="ml-1 font-bold">{formatPercentage(Math.abs(analyticsData.sales.growth.orders))}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AOV Growth:</span>
                    <div className={`flex items-center ${getGrowthColor(analyticsData.sales.growth.aov)}`}>
                      {getGrowthIcon(analyticsData.sales.growth.aov)}
                      <span className="ml-1 font-bold">{formatPercentage(Math.abs(analyticsData.sales.growth.aov))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-bold">{formatCurrency(analyticsData.inventory.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-bold">{analyticsData.inventory.totalItems.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turnover Rate:</span>
                    <span className="font-bold">{analyticsData.inventory.turnoverRate}x per year</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Low Stock Items:</span>
                    <Badge variant={analyticsData.inventory.lowStockItems > 10 ? 'destructive' : 'secondary'}>
                      {analyticsData.inventory.lowStockItems}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Out of Stock:</span>
                    <Badge variant={analyticsData.inventory.outOfStockItems > 0 ? 'destructive' : 'secondary'}>
                      {analyticsData.inventory.outOfStockItems}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Customers:</span>
                    <span className="font-bold">{analyticsData.customers.totalCustomers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Customers:</span>
                    <span className="font-bold">{analyticsData.customers.newCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Rate:</span>
                    <span className="font-bold">{formatPercentage(analyticsData.customers.customerRetentionRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Lifetime Value:</span>
                    <span className="font-bold">{formatCurrency(analyticsData.customers.customerLifetimeValue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.customers.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.orderCount} orders</p>
                        </div>
                        <span className="font-bold">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span className="font-bold text-green-600">{formatCurrency(analyticsData.financial.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-bold text-red-600">{formatCurrency(analyticsData.financial.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit:</span>
                    <span className={`font-bold ${analyticsData.financial.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(analyticsData.financial.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-bold">{formatPercentage(analyticsData.financial.profitMargin)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.financial.monthlyBreakdown.slice(-3).map((month, index) => (
                      <div key={month.month} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{month.month}</span>
                          <span className="font-bold">{formatCurrency(month.profit)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue: {formatCurrency(month.revenue)} | Orders: {month.orderCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MobileDashboardLayout>
  );
};

export default AnalyticsDashboard;
