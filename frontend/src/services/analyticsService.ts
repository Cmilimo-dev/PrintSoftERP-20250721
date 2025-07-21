import { 
  AnalyticsData, 
  DateRange, 
  SalesMetrics, 
  InventoryMetrics, 
  CustomerMetrics, 
  FinancialMetrics, 
  DocumentMetrics,
  ChartData,
  Product,
  Customer,
  CashFlowData,
  MonthlyData
} from '@/types/analytics';

export class AnalyticsService {
  
  // Generate mock analytics data for demonstration
  static async generateAnalyticsData(dateRange: DateRange): Promise<AnalyticsData> {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate sales metrics
    const salesMetrics: SalesMetrics = {
      totalRevenue: this.randomBetween(50000, 500000),
      totalOrders: this.randomBetween(100, 1000),
      averageOrderValue: 0, // Will be calculated
      growth: {
        revenue: this.randomBetween(-15, 25),
        orders: this.randomBetween(-10, 30),
        aov: this.randomBetween(-5, 15),
      }
    };
    salesMetrics.averageOrderValue = salesMetrics.totalRevenue / salesMetrics.totalOrders;

    // Generate inventory metrics
    const inventoryMetrics: InventoryMetrics = {
      totalValue: this.randomBetween(100000, 1000000),
      totalItems: this.randomBetween(500, 5000),
      lowStockItems: this.randomBetween(10, 50),
      outOfStockItems: this.randomBetween(0, 15),
      turnoverRate: this.randomBetween(2, 8),
      topMovingProducts: this.generateMockProducts(5, 'fast'),
      slowMovingProducts: this.generateMockProducts(5, 'slow'),
    };

    // Generate customer metrics
    const customerMetrics: CustomerMetrics = {
      totalCustomers: this.randomBetween(200, 2000),
      newCustomers: this.randomBetween(20, 100),
      returningCustomers: this.randomBetween(150, 800),
      customerLifetimeValue: this.randomBetween(500, 5000),
      topCustomers: this.generateMockCustomers(10),
      customerRetentionRate: this.randomBetween(60, 95),
    };

    // Generate financial metrics
    const financialMetrics: FinancialMetrics = {
      totalIncome: salesMetrics.totalRevenue,
      totalExpenses: salesMetrics.totalRevenue * this.randomBetween(0.6, 0.8),
      netProfit: 0, // Will be calculated
      profitMargin: 0, // Will be calculated
      cashFlow: this.generateCashFlowData(daysDiff),
      monthlyBreakdown: this.generateMonthlyData(6),
    };
    financialMetrics.netProfit = financialMetrics.totalIncome - financialMetrics.totalExpenses;
    financialMetrics.profitMargin = (financialMetrics.netProfit / financialMetrics.totalIncome) * 100;

    // Generate document metrics
    const documentMetrics: DocumentMetrics = {
      quotes: {
        total: this.randomBetween(50, 200),
        converted: 0,
        conversionRate: 0,
      },
      invoices: {
        total: salesMetrics.totalOrders,
        paid: Math.floor(salesMetrics.totalOrders * 0.8),
        overdue: Math.floor(salesMetrics.totalOrders * 0.1),
        pending: Math.floor(salesMetrics.totalOrders * 0.1),
      },
      purchaseOrders: {
        total: this.randomBetween(30, 150),
        fulfilled: 0,
        pending: 0,
      },
    };
    documentMetrics.quotes.converted = Math.floor(documentMetrics.quotes.total * 0.3);
    documentMetrics.quotes.conversionRate = (documentMetrics.quotes.converted / documentMetrics.quotes.total) * 100;
    documentMetrics.purchaseOrders.fulfilled = Math.floor(documentMetrics.purchaseOrders.total * 0.7);
    documentMetrics.purchaseOrders.pending = documentMetrics.purchaseOrders.total - documentMetrics.purchaseOrders.fulfilled;

    return {
      sales: salesMetrics,
      inventory: inventoryMetrics,
      customers: customerMetrics,
      financial: financialMetrics,
      documents: documentMetrics,
      dateRange,
      lastUpdated: new Date().toISOString(),
    };
  }

  static generateSalesChartData(period: 'week' | 'month' | 'quarter' | 'year'): ChartData[] {
    const dataPoints = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
    const data: ChartData[] = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - i));
      
      data.push({
        label: date.toISOString().split('T')[0],
        value: this.randomBetween(1000, 10000),
        date: date.toISOString().split('T')[0],
      });
    }
    
    return data;
  }

  static generateInventoryTrendData(): ChartData[] {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
    return categories.map(category => ({
      label: category,
      value: this.randomBetween(50, 500),
      category,
    }));
  }

  static generateCustomerSegmentData(): ChartData[] {
    const segments = ['New', 'Regular', 'VIP', 'Inactive'];
    return segments.map(segment => ({
      label: segment,
      value: this.randomBetween(10, 100),
      category: segment,
    }));
  }

  // Helper methods
  private static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static generateMockProducts(count: number, velocity: 'fast' | 'slow'): Product[] {
    const products: Product[] = [];
    for (let i = 0; i < count; i++) {
      products.push({
        id: `prod-${i + 1}`,
        name: `Product ${i + 1}`,
        sku: `SKU-${1000 + i}`,
        category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4],
        currentStock: this.randomBetween(0, 100),
        value: this.randomBetween(10, 1000),
        velocity: velocity === 'fast' ? this.randomBetween(50, 100) : this.randomBetween(1, 20),
      });
    }
    return products;
  }

  private static generateMockCustomers(count: number): Customer[] {
    const customers: Customer[] = [];
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
    
    for (let i = 0; i < count; i++) {
      customers.push({
        id: `cust-${i + 1}`,
        name: names[i % names.length] || `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        totalSpent: this.randomBetween(500, 50000),
        orderCount: this.randomBetween(1, 50),
        lastOrderDate: new Date(Date.now() - this.randomBetween(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  private static generateCashFlowData(days: number): CashFlowData[] {
    const data: CashFlowData[] = [];
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      
      const income = this.randomBetween(1000, 10000);
      const expenses = this.randomBetween(500, 8000);
      
      data.push({
        date: date.toISOString().split('T')[0],
        income,
        expenses,
        net: income - expenses,
      });
    }
    
    return data;
  }

  private static generateMonthlyData(months: number): MonthlyData[] {
    const data: MonthlyData[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - i - 1));
      
      const revenue = this.randomBetween(10000, 100000);
      const expenses = this.randomBetween(5000, 80000);
      
      data.push({
        month: monthNames[date.getMonth()],
        revenue,
        expenses,
        profit: revenue - expenses,
        orderCount: this.randomBetween(50, 500),
      });
    }
    
    return data;
  }

  // Export functions
  static async exportToPDF(data: AnalyticsData): Promise<Blob> {
    // In a real implementation, this would use a PDF library like jsPDF
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/pdf' });
  }

  static async exportToExcel(data: AnalyticsData): Promise<Blob> {
    // In a real implementation, this would use a library like xlsx
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  static async exportToCSV(data: AnalyticsData): Promise<Blob> {
    let csv = 'Metric,Value\n';
    csv += `Total Revenue,${data.sales.totalRevenue}\n`;
    csv += `Total Orders,${data.sales.totalOrders}\n`;
    csv += `Average Order Value,${data.sales.averageOrderValue}\n`;
    csv += `Total Customers,${data.customers.totalCustomers}\n`;
    csv += `Net Profit,${data.financial.netProfit}\n`;
    
    return new Blob([csv], { type: 'text/csv' });
  }
}
