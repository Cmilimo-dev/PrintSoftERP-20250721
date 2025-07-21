import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarDays, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileBarChart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Calculator
} from 'lucide-react';
import { useFinancialTransactions } from '@/hooks/useFinancial';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';

interface FinancialReport {
  id: string;
  name: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'trial-balance' | 'income-statement' | 'custom';
  period: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'finalized' | 'published';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  data?: any;
  metadata?: {
    totalRevenue?: number;
    totalExpenses?: number;
    netIncome?: number;
    grossProfit?: number;
    operatingIncome?: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  sections: string[];
  defaultPeriod: string;
}

const EnhancedFinancialReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<string>('');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportName, setReportName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { data: transactions } = useFinancialTransactions();

  // Mock financial reports data
  const financialReports: FinancialReport[] = [
    {
      id: '1',
      name: 'Q4 2024 Profit & Loss Statement',
      type: 'profit-loss',
      period: 'Q4 2024',
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      status: 'finalized',
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-15T00:00:00Z',
      createdBy: 'John Smith',
      metadata: {
        totalRevenue: 485000,
        totalExpenses: 325000,
        netIncome: 160000,
        grossProfit: 295000,
        operatingIncome: 175000
      }
    },
    {
      id: '2',
      name: 'December 2024 Balance Sheet',
      type: 'balance-sheet',
      period: 'December 2024',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      status: 'published',
      createdAt: '2024-12-31T00:00:00Z',
      updatedAt: '2024-12-31T00:00:00Z',
      createdBy: 'Sarah Johnson',
      metadata: {
        totalRevenue: 125000,
        totalExpenses: 85000,
        netIncome: 40000
      }
    },
    {
      id: '3',
      name: 'Weekly Cash Flow Analysis',
      type: 'cash-flow',
      period: 'Week 51, 2024',
      startDate: '2024-12-16',
      endDate: '2024-12-22',
      status: 'draft',
      createdAt: '2024-12-23T00:00:00Z',
      updatedAt: '2024-12-23T00:00:00Z',
      createdBy: 'Michael Chen',
      metadata: {
        totalRevenue: 28000,
        totalExpenses: 22000,
        netIncome: 6000
      }
    },
    {
      id: '4',
      name: 'Year-End Trial Balance 2024',
      type: 'trial-balance',
      period: 'Year 2024',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'finalized',
      createdAt: '2024-12-30T00:00:00Z',
      updatedAt: '2024-12-31T00:00:00Z',
      createdBy: 'Lisa Williams',
      metadata: {
        totalRevenue: 1250000,
        totalExpenses: 890000,
        netIncome: 360000
      }
    }
  ];

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Standard Profit & Loss',
      type: 'profit-loss',
      description: 'Comprehensive P&L statement with revenue, expenses, and net income analysis',
      sections: ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Operating Income', 'Other Income/Expenses', 'Net Income'],
      defaultPeriod: 'monthly'
    },
    {
      id: '2',
      name: 'Detailed Balance Sheet',
      type: 'balance-sheet',
      description: 'Complete balance sheet with assets, liabilities, and equity breakdown',
      sections: ['Current Assets', 'Fixed Assets', 'Current Liabilities', 'Long-term Liabilities', 'Equity'],
      defaultPeriod: 'quarterly'
    },
    {
      id: '3',
      name: 'Cash Flow Statement',
      type: 'cash-flow',
      description: 'Operating, investing, and financing activities cash flow analysis',
      sections: ['Operating Activities', 'Investing Activities', 'Financing Activities', 'Net Cash Flow'],
      defaultPeriod: 'monthly'
    },
    {
      id: '4',
      name: 'Trial Balance Report',
      type: 'trial-balance',
      description: 'All account balances with debit and credit totals',
      sections: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'],
      defaultPeriod: 'monthly'
    }
  ];

  const filteredReports = useMemo(() => {
    return financialReports.filter(report => {
      const statusMatch = filterStatus === 'all' || report.status === filterStatus;
      const typeMatch = filterType === 'all' || report.type === filterType;
      return statusMatch && typeMatch;
    });
  }, [financialReports, filterStatus, filterType]);

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      published: 'default',
      finalized: 'secondary',
      draft: 'outline'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'profit-loss': <BarChart3 className="h-4 w-4" />,
      'balance-sheet': <LineChart className="h-4 w-4" />,
      'cash-flow': <TrendingUp className="h-4 w-4" />,
      'trial-balance': <Calculator className="h-4 w-4" />,
      'income-statement': <DollarSign className="h-4 w-4" />,
      'custom': <PieChart className="h-4 w-4" />
    };
    return icons[type] || <FileBarChart className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'profit-loss': 'Profit & Loss',
      'balance-sheet': 'Balance Sheet',
      'cash-flow': 'Cash Flow',
      'trial-balance': 'Trial Balance',
      'income-statement': 'Income Statement',
      'custom': 'Custom Report'
    };
    return labels[type] || type;
  };

  const handleCreateReport = () => {
    if (!reportName || !reportType) {
      return;
    }

    // Here you would normally create the report in your data store
    console.log('Creating report:', {
      name: reportName,
      type: reportType,
      period: reportPeriod,
      startDate,
      endDate
    });

    // Reset form and close dialog
    setReportName('');
    setReportType('');
    setReportPeriod('monthly');
    setIsCreateDialogOpen(false);
  };

  const handleViewReport = (report: FinancialReport) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleExportReport = async (report: FinancialReport, format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Create a financial report document structure
      const reportDocument = {
        id: report.id,
        documentNumber: report.name.replace(/\s+/g, '-').toUpperCase(),
        date: report.endDate,
        total: report.metadata?.netIncome || 0,
        currency: 'KES',
        company: {
          name: 'Priority Solutions Inc.',
          address: '123 Business Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          phone: '+1 (555) 123-4567',
          email: 'info@prioritysolutions.com',
          taxId: 'TAX123456789'
        },
        reportType: report.type,
        reportPeriod: report.period,
        fromDate: report.startDate,
        toDate: report.endDate,
        totalRevenue: report.metadata?.totalRevenue || 0,
        totalExpenses: report.metadata?.totalExpenses || 0,
        netProfit: report.metadata?.netIncome || 0,
        cashFlow: (report.metadata?.totalRevenue || 0) - (report.metadata?.totalExpenses || 0),
        items: [], // Reports don't have line items
        subtotal: 0,
        taxAmount: 0,
        taxSettings: { type: 'exclusive' as const, defaultRate: 16 },
        transactions: [
          {
            date: report.startDate,
            description: 'Sample Revenue Transaction',
            type: 'credit',
            amount: report.metadata?.totalRevenue || 0
          },
          {
            date: report.startDate,
            description: 'Sample Expense Transaction',
            type: 'debit',
            amount: report.metadata?.totalExpenses || 0
          }
        ],
        budgetAnalysis: [
          {
            category: 'Revenue',
            budgeted: (report.metadata?.totalRevenue || 0) * 0.9,
            actual: report.metadata?.totalRevenue || 0,
            variance: (report.metadata?.totalRevenue || 0) * 0.1
          },
          {
            category: 'Expenses',
            budgeted: (report.metadata?.totalExpenses || 0) * 1.1,
            actual: report.metadata?.totalExpenses || 0,
            variance: (report.metadata?.totalExpenses || 0) * -0.1
          }
        ]
      };

      if (format === 'pdf') {
        await UnifiedDocumentExportService.exportDocument(
          reportDocument,
          'financial-report',
          {
            format: 'pdf',
            filename: `Financial-Report-${report.name}`,
            colorMode: 'monochrome',
            includeLogo: true
          }
        );
      } else if (format === 'excel' || format === 'csv') {
        // For list data export
        await UnifiedDocumentExportService.exportListData(
          {
            title: `${report.name} - Financial Report`,
            data: reportDocument.transactions || [],
            columns: [
              { key: 'date', label: 'Date' },
              { key: 'description', label: 'Description' },
              { key: 'type', label: 'Type' },
              { key: 'amount', label: 'Amount' }
            ]
          },
          format === 'excel' ? 'excel' : 'csv',
          {
            company: reportDocument.company,
            logo: { enabled: true },
            typography: {
              bodyFont: 'Arial',
              bodyFontSize: 11,
              bodyColor: '#000000',
              headingColor: '#2563eb',
              documentTitleFont: 'Arial',
              documentTitleSize: 16
            },
            includeFooter: true,
            footerText: `Generated on ${new Date().toLocaleDateString()}`
          }
        );
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const generateMockReportData = (report: FinancialReport) => {
    if (report.type === 'profit-loss') {
      return {
        revenue: {
          'Product Sales': 325000,
          'Service Revenue': 160000,
          'Other Revenue': 12000
        },
        expenses: {
          'Cost of Goods Sold': 195000,
          'Salaries & Benefits': 85000,
          'Rent & Utilities': 22000,
          'Marketing': 15000,
          'Other Expenses': 8000
        },
        grossProfit: 302000,
        netIncome: 177000
      };
    }
    
    if (report.type === 'balance-sheet') {
      return {
        assets: {
          current: 145000,
          fixed: 325000,
          total: 470000
        },
        liabilities: {
          current: 85000,
          longTerm: 125000,
          total: 210000
        },
        equity: {
          total: 260000
        }
      };
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Enhanced Financial Reports</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="analytics">Quick Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="finalized">Finalized</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Report Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                      <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                      <SelectItem value="cash-flow">Cash Flow</SelectItem>
                      <SelectItem value="trial-balance">Trial Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{report.name}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span>Type: {getTypeLabel(report.type)}</span>
                            <span>Period: {report.period}</span>
                            <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>Created by: {report.createdBy}</div>
                        </div>
                        
                        {/* Quick metrics */}
                        {report.metadata && (
                          <div className="flex items-center gap-6 mt-3 p-3 bg-gray-50 rounded-lg">
                            {report.metadata.totalRevenue && (
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Revenue</div>
                                <div className="font-semibold text-green-600">
                                  KES {report.metadata.totalRevenue.toLocaleString()}
                                </div>
                              </div>
                            )}
                            {report.metadata.totalExpenses && (
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Expenses</div>
                                <div className="font-semibold text-red-600">
                                  KES {report.metadata.totalExpenses.toLocaleString()}
                                </div>
                              </div>
                            )}
                            {report.metadata.netIncome && (
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Net Income</div>
                                <div className={`font-semibold ${report.metadata.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  <div className="flex items-center gap-1">
                                    {report.metadata.netIncome >= 0 ? 
                                      <TrendingUp className="h-4 w-4" /> : 
                                      <TrendingDown className="h-4 w-4" />
                                    }
                                    KES {Math.abs(report.metadata.netIncome).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleExportReport(report, 'pdf')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        {getTypeIcon(template.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="font-medium">Default Period:</span> {template.defaultPeriod}
                          </div>
                          <div>
                            <span className="font-medium">Sections:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.sections.map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setReportType(template.type);
                          setReportPeriod(template.defaultPeriod);
                          setReportName(`${template.name} - ${new Date().toLocaleDateString()}`);
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Quick Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">+12.5%</div>
                <p className="text-sm text-muted-foreground">vs last month</p>
                <div className="mt-4 h-20 bg-green-50 rounded flex items-end justify-center">
                  <div className="text-xs text-green-600">Revenue trending upward</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">23.8%</div>
                <p className="text-sm text-muted-foreground">Current margin</p>
                <div className="mt-4 h-20 bg-blue-50 rounded flex items-center justify-center">
                  <div className="text-xs text-blue-600">Healthy profit margins</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">-5.2%</div>
                <p className="text-sm text-muted-foreground">Needs attention</p>
                <div className="mt-4 h-20 bg-orange-50 rounded flex items-center justify-center">
                  <div className="text-xs text-orange-600">Monitor cash flow</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Financial Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Report Name</Label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit-loss">Profit & Loss Statement</SelectItem>
                    <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                    <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                    <SelectItem value="trial-balance">Trial Balance</SelectItem>
                    <SelectItem value="income-statement">Income Statement</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Period Type</Label>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport}>
                Create Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedReport?.name}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectedReport && handleExportReport(selectedReport, 'pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectedReport && handleExportReport(selectedReport, 'excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report metadata */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Period</div>
                  <div className="text-sm text-muted-foreground">{selectedReport.period}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div>{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Created By</div>
                  <div className="text-sm text-muted-foreground">{selectedReport.createdBy}</div>
                </div>
              </div>

              {/* Report content preview */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
                {(() => {
                  const mockData = generateMockReportData(selectedReport);
                  
                  if (selectedReport.type === 'profit-loss' && mockData) {
                    return (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">REVENUE</h4>
                          {Object.entries(mockData.revenue).map(([item, amount]) => (
                            <div key={item} className="flex justify-between py-1">
                              <span>{item}</span>
                              <span>KES {amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Total Revenue</span>
                            <span>KES {Object.values(mockData.revenue).reduce((a, b) => a + b, 0).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">EXPENSES</h4>
                          {Object.entries(mockData.expenses).map(([item, amount]) => (
                            <div key={item} className="flex justify-between py-1">
                              <span>{item}</span>
                              <span>KES {amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Total Expenses</span>
                            <span>KES {Object.values(mockData.expenses).reduce((a, b) => a + b, 0).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Net Income</span>
                            <span className="text-green-600">KES {mockData.netIncome.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return <div className="text-center text-muted-foreground py-8">Report preview not available</div>;
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedFinancialReports;
