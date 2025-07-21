export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growth: {
    revenue: number;
    orders: number;
    aov: number;
  };
}

export interface InventoryMetrics {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  turnoverRate: number;
  topMovingProducts: Product[];
  slowMovingProducts: Product[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  value: number;
  velocity: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
  topCustomers: Customer[];
  customerRetentionRate: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: CashFlowData[];
  monthlyBreakdown: MonthlyData[];
}

export interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orderCount: number;
}

export interface DocumentMetrics {
  quotes: {
    total: number;
    converted: number;
    conversionRate: number;
  };
  invoices: {
    total: number;
    paid: number;
    overdue: number;
    pending: number;
  };
  purchaseOrders: {
    total: number;
    fulfilled: number;
    pending: number;
  };
}

export interface AnalyticsData {
  sales: SalesMetrics;
  inventory: InventoryMetrics;
  customers: CustomerMetrics;
  financial: FinancialMetrics;
  documents: DocumentMetrics;
  dateRange: DateRange;
  lastUpdated: string;
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'financial' | 'customer' | 'comprehensive';
  dateRange: DateRange;
  filters: ReportFilters;
  format: 'pdf' | 'excel' | 'csv';
  schedule?: ReportSchedule;
}

export interface ReportFilters {
  customers?: string[];
  products?: string[];
  categories?: string[];
  documentTypes?: string[];
  status?: string[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  enabled: boolean;
}

export interface ChartData {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

export interface AnalyticsWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'progress';
  size: 'sm' | 'md' | 'lg' | 'xl';
  data: any;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut';
}
