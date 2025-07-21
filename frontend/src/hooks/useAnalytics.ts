import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsData, DateRange, ChartData } from '@/types/analytics';
import { AnalyticsService } from '@/services/analyticsService';

interface UseAnalyticsOptions {
  dateRange: DateRange;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAnalytics = ({ 
  dateRange, 
  autoRefresh = false, 
  refreshInterval = 300000 // 5 minutes
}: UseAnalyticsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main analytics data query
  const {
    data: analyticsData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => AnalyticsService.generateAnalyticsData(dateRange),
    staleTime: refreshInterval,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Sales chart data
  const {
    data: salesChartData,
    refetch: refetchSalesChart,
  } = useQuery({
    queryKey: ['salesChart', dateRange],
    queryFn: () => AnalyticsService.generateSalesChartData('month'),
    staleTime: refreshInterval,
  });

  // Inventory trend data
  const {
    data: inventoryTrendData,
    refetch: refetchInventoryTrend,
  } = useQuery({
    queryKey: ['inventoryTrend', dateRange],
    queryFn: () => AnalyticsService.generateInventoryTrendData(),
    staleTime: refreshInterval,
  });

  // Customer segment data
  const {
    data: customerSegmentData,
    refetch: refetchCustomerSegment,
  } = useQuery({
    queryKey: ['customerSegment', dateRange],
    queryFn: () => AnalyticsService.generateCustomerSegmentData(),
    staleTime: refreshInterval,
  });

  // Export state
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Export functions
  const exportToPDF = async (data: AnalyticsData) => {
    try {
      setIsExportingPDF(true);
      const blob = await AnalyticsService.exportToPDF(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportToExcel = async (data: AnalyticsData) => {
    try {
      setIsExportingExcel(true);
      const blob = await AnalyticsService.exportToExcel(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const exportToCSV = async (data: AnalyticsData) => {
    try {
      setIsExportingCSV(true);
      const blob = await AnalyticsService.exportToCSV(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        refetch(),
        refetchSalesChart(),
        refetchInventoryTrend(),
        refetchCustomerSegment(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate key performance indicators
  const kpis = analyticsData ? {
    totalRevenue: analyticsData.sales.totalRevenue,
    revenueGrowth: analyticsData.sales.growth.revenue,
    totalOrders: analyticsData.sales.totalOrders,
    orderGrowth: analyticsData.sales.growth.orders,
    averageOrderValue: analyticsData.sales.averageOrderValue,
    aovGrowth: analyticsData.sales.growth.aov,
    customerRetention: analyticsData.customers.customerRetentionRate,
    profitMargin: analyticsData.financial.profitMargin,
    inventoryTurnover: analyticsData.inventory.turnoverRate,
    conversionRate: analyticsData.documents.quotes.conversionRate,
  } : null;

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Generate insights based on data
  const insights = analyticsData ? generateInsights(analyticsData) : [];

  return {
    // Data
    analyticsData,
    salesChartData,
    inventoryTrendData,
    customerSegmentData,
    kpis,
    insights,

    // State
    isLoading: queryLoading || isLoading,
    error: queryError?.message || error,

    // Actions
    refreshAll,
    exportToPDF,
    exportToExcel,
    exportToCSV,

    // Utilities
    formatCurrency,
    formatPercentage,

    // Export states
    isExportingPDF,
    isExportingExcel,
    isExportingCSV,
  };
};

// Helper function to generate insights
function generateInsights(data: AnalyticsData): string[] {
  const insights: string[] = [];

  // Revenue insights
  if (data.sales.growth.revenue > 10) {
    insights.push(`Revenue has grown by ${data.sales.growth.revenue.toFixed(1)}% - excellent performance!`);
  } else if (data.sales.growth.revenue < -5) {
    insights.push(`Revenue has declined by ${Math.abs(data.sales.growth.revenue).toFixed(1)}% - consider reviewing strategy.`);
  }

  // Inventory insights
  if (data.inventory.outOfStockItems > 10) {
    insights.push(`${data.inventory.outOfStockItems} items are out of stock - consider restocking.`);
  }

  if (data.inventory.turnoverRate < 3) {
    insights.push('Inventory turnover rate is low - consider optimizing stock levels.');
  }

  // Customer insights
  if (data.customers.customerRetentionRate < 70) {
    insights.push('Customer retention rate is below 70% - focus on customer satisfaction.');
  }

  // Financial insights
  if (data.financial.profitMargin < 10) {
    insights.push('Profit margin is below 10% - review pricing and cost structure.');
  }

  // Conversion insights
  if (data.documents.quotes.conversionRate < 25) {
    insights.push('Quote conversion rate is low - consider improving quote quality and follow-up.');
  }

  return insights;
}

export default useAnalytics;
