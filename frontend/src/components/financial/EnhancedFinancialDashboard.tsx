import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Activity,
  PieChart,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { DashboardStatsGrid } from '@/components/ui/mobile-dashboard-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { FinancialReportService } from '@/services/financialReportService';
import { FinancialDatabaseService } from '@/services/financialDatabaseService';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import FinancialCharts from './FinancialCharts';

interface FinancialReport {
  name: string;
  period: string;
  analytics: any;
  generatedAt: string;
}

interface EnhancedFinancialDashboardProps {
  totalRevenue?: number;
  totalReceivables?: number;
  chartOfAccountsCount?: number;
  transactionsCount?: number;
}

const EnhancedFinancialDashboard: React.FC<EnhancedFinancialDashboardProps> = ({
  totalRevenue = 0,
  totalReceivables = 0,
  chartOfAccountsCount = 0,
  transactionsCount = 0
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('profit-loss');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    to: new Date() // Today
  });
  const [financialAnalytics, setFinancialAnalytics] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);

  // Load financial analytics and storage stats
  useEffect(() => {
    loadFinancialData();
    loadStorageStats();
  }, [dateRange]);

  const loadFinancialData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setIsLoading(true);
    try {
      const analytics = await FinancialDatabaseService.calculateFinancialAnalytics(
        dateRange.from.toISOString().split('T')[0],
        dateRange.to.toISOString().split('T')[0]
      );
      setFinancialAnalytics(analytics);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await FinancialDatabaseService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!dateRange?.from || !dateRange?.to) return;

    setIsLoading(true);
    try {
      let report: FinancialReport;
      
      switch (selectedReport) {
        case 'profit-loss':
          report = await FinancialReportService.generateProfitAndLoss(
            dateRange.from.toISOString().split('T')[0],
            dateRange.to.toISOString().split('T')[0]
          );
          break;
        case 'balance-sheet':
          report = await FinancialReportService.generateBalanceSheet(
            dateRange.to.toISOString().split('T')[0]
          );
          break;
        default:
          throw new Error('Unknown report type');
      }

      FinancialReportService.exportReport(report, { format });
      
      toast({
        title: 'Export Started',
        description: `${report.name} export to ${format.toUpperCase()} initiated`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export the report',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced stats with real data
  const enhancedStats = [
    {
      title: 'Total Revenue',
      value: `KES ${(financialAnalytics?.operatingCashFlow || totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      trend: financialAnalytics?.revenueGrowth || 0,
      description: 'Current period revenue'
    },
    {
      title: 'Net Profit Margin',
      value: `${(financialAnalytics?.netProfitMargin || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      trend: financialAnalytics?.profitGrowth || 0,
      description: 'Profitability ratio'
    },
    {
      title: 'Working Capital',
      value: `KES ${(financialAnalytics?.workingCapital || totalReceivables).toLocaleString()}`,
      icon: CreditCard,
      color: 'text-purple-600',
      trend: 0,
      description: 'Current assets minus liabilities'
    },
    {
      title: 'Chart of Accounts',
      value: storageStats?.accounts || chartOfAccountsCount,
      icon: BookOpen,
      color: 'text-orange-600',
      trend: 0,
      description: 'Active accounts in system'
    },
    {
      title: 'Transactions',
      value: storageStats?.transactions || transactionsCount,
      icon: FileText,
      color: 'text-indigo-600',
      trend: 0,
      description: 'Total transactions recorded'
    },
    {
      title: 'Current Ratio',
      value: (financialAnalytics?.currentRatio || 0).toFixed(2),
      icon: Activity,
      color: 'text-emerald-600',
      trend: 0,
      description: 'Liquidity indicator'
    }
  ];

  const keyMetrics = [
    {
      label: 'Return on Assets',
      value: `${(financialAnalytics?.returnOnAssets || 0).toFixed(1)}%`,
      trend: 'up'
    },
    {
      label: 'Return on Equity',
      value: `${(financialAnalytics?.returnOnEquity || 0).toFixed(1)}%`,
      trend: 'up'
    },
    {
      label: 'Debt to Equity',
      value: (financialAnalytics?.debtToEquity || 0).toFixed(2),
      trend: 'down'
    },
    {
      label: 'Gross Profit Margin',
      value: `${(financialAnalytics?.grossProfitMargin || 0).toFixed(1)}%`,
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your financial performance and key metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
            className="w-full sm:w-auto"
          />
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit-loss">Profit & Loss</SelectItem>
              <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
              <SelectItem value="cash-flow">Cash Flow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <DashboardStatsGrid columns={3}>
        {enhancedStats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositiveTrend = stat.trend >= 0;
          const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  {stat.trend !== 0 && (
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-3 w-3 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-xs ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(stat.trend).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </DashboardStatsGrid>

      {/* Key Financial Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Key Financial Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="mt-1">
                  {metric.trend === 'up' ? '↗' : '↘'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Reports
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate and export comprehensive financial reports
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => handleExportReport('pdf')} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('excel')} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('csv')} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            <Separator />
            
            {financialAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Period Overview</h4>
                  <p className="text-muted-foreground">
                    {financialAnalytics.period} | Generated: {new Date(financialAnalytics.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Currency</h4>
                  <p className="text-muted-foreground">{financialAnalytics.currency}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Charts & Visualizations */}
      {financialAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Financial Analysis & Charts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visual representation of key financial ratios and metrics
            </p>
          </CardHeader>
          <CardContent>
            <FinancialCharts analytics={financialAnalytics} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFinancialDashboard;
