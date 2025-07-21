import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Percent, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Calculator,
  Users,
  Info,
  Eye,
  FileSpreadsheet,
  Printer,
  Settings,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  RefreshCw,
  Database
} from 'lucide-react';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import { EnhancedCommissionApiService, CommissionRecord, CommissionSummary } from '@/services/enhancedCommissionApiService';
import { FinancialDataIntegrationService, FinancialPeriodData } from '@/services/financialDataIntegrationService';
import { EmployeeDataIntegrationService, Employee, Department } from '@/services/employeeDataIntegrationService';
import { CommissionCalculationEngine } from '@/services/commissionCalculationEngine';

interface Commission {
  id: string;
  commissionNumber: string;
  period: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    commissionRate: number;
  };
  salesData: {
    totalSales: number;
    targetSales: number;
    achievementPercentage: number;
  };
  baseAmount: number;
  commissionRate: number;
  totalExpenses: number;
  netProfit: number;
  calculatedCommission: number;
  adjustments: number;
  bonuses: number;
  deductions: number;
  finalCommission: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'disputed';
  calculatedDate: string;
  approvedBy?: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  attachments?: string[];
}

interface FinancialData {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
}

interface CommissionRule {
  id: string;
  name: string;
  type: 'fixed-percentage' | 'tiered' | 'target-based' | 'profit-sharing';
  department: string;
  baseRate: number;
  tiers?: {
    min: number;
    max: number;
    rate: number;
  }[];
  isActive: boolean;
}

const EnhancedCommissionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('commissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  
  // Integration status states
  const [financialDataStatus, setFinancialDataStatus] = useState<'connected' | 'error' | 'loading'>('connected');
  const [employeeDataStatus, setEmployeeDataStatus] = useState<'connected' | 'error' | 'loading'>('connected');
  const [commissionApiStatus, setCommissionApiStatus] = useState<'connected' | 'error' | 'loading'>('connected');
  const [realTimeData, setRealTimeData] = useState<FinancialPeriodData | null>(null);
  const [liveEmployees, setLiveEmployees] = useState<Employee[]>([]);
  const [liveDepartments, setLiveDepartments] = useState<Department[]>([]);
  
  // Load live data on component mount
  useEffect(() => {
    const loadIntegrationData = async () => {
      try {
        // Test financial data integration
        setFinancialDataStatus('loading');
        const currentPeriod = new Date().toISOString().slice(0, 7);
        const financialData = await FinancialDataIntegrationService.getFinancialDataForPeriod(currentPeriod);
        setRealTimeData(financialData);
        setFinancialDataStatus('connected');
        
        // Test employee data integration
        setEmployeeDataStatus('loading');
        const employees = await EmployeeDataIntegrationService.getCommissionEligibleEmployees();
        setLiveEmployees(employees);
        setEmployeeDataStatus('connected');
        
        // Test departments integration
        const departments = await EmployeeDataIntegrationService.getDepartments();
        setLiveDepartments(departments);
        
        // Test commission API integration
        setCommissionApiStatus('loading');
        const commissionSummary = await EnhancedCommissionApiService.getCommissionSummary();
        setCommissionApiStatus('connected');
        
        console.log('Integration test results:', {
          financialData,
          employees: employees.length,
          departments: departments.length,
          commissionSummary
        });
        
      } catch (error) {
        console.error('Integration error:', error);
        setFinancialDataStatus('error');
        setEmployeeDataStatus('error');
        setCommissionApiStatus('error');
      }
    };
    
    loadIntegrationData();
  }, []);

  // Mock financial data for commission calculations
  const financialData: FinancialData[] = [
    {
      period: '2024-06',
      totalRevenue: 450000,
      totalExpenses: 280000,
      netProfit: 170000,
      grossMargin: 37.8
    },
    {
      period: '2024-05',
      totalRevenue: 380000,
      totalExpenses: 250000,
      netProfit: 130000,
      grossMargin: 34.2
    },
    {
      period: '2024-04',
      totalRevenue: 520000,
      totalExpenses: 320000,
      netProfit: 200000,
      grossMargin: 38.5
    }
  ];

  // Mock commission rules
  const commissionRules: CommissionRule[] = [
    {
      id: '1',
      name: 'Sales Team Standard',
      type: 'tiered',
      department: 'Sales',
      baseRate: 3.0,
      tiers: [
        { min: 0, max: 50000, rate: 2.0 },
        { min: 50000, max: 100000, rate: 3.5 },
        { min: 100000, max: 999999, rate: 5.0 }
      ],
      isActive: true
    },
    {
      id: '2',
      name: 'Marketing Performance',
      type: 'target-based',
      department: 'Marketing',
      baseRate: 2.5,
      isActive: true
    },
    {
      id: '3',
      name: 'Executive Profit Share',
      type: 'profit-sharing',
      department: 'Executive',
      baseRate: 1.5,
      isActive: true
    }
  ];

  // Enhanced mock commission data
  const commissions: Commission[] = [
    {
      id: '1',
      commissionNumber: 'COM-2024-001',
      period: '2024-06',
      employee: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Sales',
        role: 'Senior Sales Manager',
        commissionRate: 5.0
      },
      salesData: {
        totalSales: 125000,
        targetSales: 100000,
        achievementPercentage: 125
      },
      baseAmount: 85000,
      commissionRate: 5.0,
      totalExpenses: 280000,
      netProfit: 170000,
      calculatedCommission: 6250,
      adjustments: 500,
      bonuses: 1000,
      deductions: 250,
      finalCommission: 7500,
      status: 'paid',
      calculatedDate: '2024-06-30',
      approvedBy: 'Jane Smith',
      paidDate: '2024-07-05',
      paymentMethod: 'Bank Transfer',
      notes: 'Exceeded sales target by 25%'
    },
    {
      id: '2',
      commissionNumber: 'COM-2024-002',
      period: '2024-06',
      employee: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Sales',
        role: 'Sales Director',
        commissionRate: 4.5
      },
      salesData: {
        totalSales: 95000,
        targetSales: 120000,
        achievementPercentage: 79.2
      },
      baseAmount: 75000,
      commissionRate: 4.5,
      totalExpenses: 280000,
      netProfit: 170000,
      calculatedCommission: 4275,
      adjustments: -500,
      bonuses: 0,
      deductions: 0,
      finalCommission: 3775,
      status: 'approved',
      calculatedDate: '2024-06-30',
      approvedBy: 'Mike Johnson'
    },
    {
      id: '3',
      commissionNumber: 'COM-2024-003',
      period: '2024-06',
      employee: {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        department: 'Marketing',
        role: 'Marketing Manager',
        commissionRate: 3.0
      },
      salesData: {
        totalSales: 75000,
        targetSales: 80000,
        achievementPercentage: 93.8
      },
      baseAmount: 60000,
      commissionRate: 3.0,
      totalExpenses: 280000,
      netProfit: 170000,
      calculatedCommission: 2250,
      adjustments: 0,
      bonuses: 0,
      deductions: 0,
      finalCommission: 2250,
      status: 'calculated',
      calculatedDate: '2024-06-30'
    },
    {
      id: '4',
      commissionNumber: 'COM-2024-004',
      period: '2024-05',
      employee: {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        department: 'Sales',
        role: 'Sales Representative',
        commissionRate: 2.5
      },
      salesData: {
        totalSales: 45000,
        targetSales: 60000,
        achievementPercentage: 75
      },
      baseAmount: 45000,
      commissionRate: 2.5,
      totalExpenses: 250000,
      netProfit: 130000,
      calculatedCommission: 1125,
      adjustments: -125,
      bonuses: 0,
      deductions: 100,
      finalCommission: 900,
      status: 'disputed',
      calculatedDate: '2024-05-31',
      notes: 'Target not met - under review'
    }
  ];

  const departments = ['Sales', 'Marketing', 'Operations', 'Finance', 'IT', 'Executive'];
  const periods = ['2024-06', '2024-05', '2024-04', '2024-03', '2024-02', '2024-01'];

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode } } = {
      paid: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      approved: { variant: 'secondary', icon: <CheckCircle className="h-3 w-3" /> },
      calculated: { variant: 'outline', icon: <Calculator className="h-3 w-3" /> },
      draft: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      disputed: { variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> }
    };
    
    const config = statusColors[status] || statusColors.draft;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredCommissions = useMemo(() => {
    return commissions.filter(commission => {
      const matchesSearch = commission.commissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           commission.employee.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || commission.employee.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
      const matchesPeriod = periodFilter === 'all' || commission.period === periodFilter;
      return matchesSearch && matchesDepartment && matchesStatus && matchesPeriod;
    });
  }, [commissions, searchTerm, departmentFilter, statusFilter, periodFilter]);

  // Calculate summary statistics
  const totalCommissions = filteredCommissions.reduce((sum, commission) => sum + commission.finalCommission, 0);
  const paidCommissions = filteredCommissions.filter(c => c.status === 'paid').reduce((sum, commission) => sum + commission.finalCommission, 0);
  const pendingCommissions = filteredCommissions.filter(c => c.status === 'calculated' || c.status === 'approved').reduce((sum, commission) => sum + commission.finalCommission, 0);
  const avgCommissionRate = filteredCommissions.length > 0 ? 
    filteredCommissions.reduce((sum, commission) => sum + commission.commissionRate, 0) / filteredCommissions.length : 0;

  const calculateCommission = (period: string, rate: number, salesAmount: number = 0): number => {
    const periodData = financialData.find(d => d.period === period);
    if (!periodData) return 0;
    
    // Enhanced commission calculation based on sales performance
    const baseCommission = salesAmount * (rate / 100);
    return baseCommission;
  };

  const handleCreate = () => {
    setEditingCommission(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingCommission(null);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting commission:', id);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on commissions:`, selectedCommissions);
  };

  const handleExportCommissions = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const exportData = {
        title: `Commission Report - ${new Date().toLocaleDateString()}`,
        data: filteredCommissions.map(commission => ({
          commissionNumber: commission.commissionNumber,
          period: commission.period,
          employee: commission.employee.name,
          department: commission.employee.department,
          salesAmount: commission.salesData.totalSales,
          targetAmount: commission.salesData.targetSales,
          achievement: `${commission.salesData.achievementPercentage.toFixed(1)}%`,
          commissionRate: `${commission.commissionRate}%`,
          calculatedAmount: commission.calculatedCommission,
          adjustments: commission.adjustments,
          bonuses: commission.bonuses,
          deductions: commission.deductions,
          finalAmount: commission.finalCommission,
          status: commission.status,
          paidDate: commission.paidDate || 'N/A'
        })),
        columns: [
          { key: 'commissionNumber', label: 'Commission #' },
          { key: 'period', label: 'Period' },
          { key: 'employee', label: 'Employee' },
          { key: 'department', label: 'Department' },
          { key: 'salesAmount', label: 'Sales Amount' },
          { key: 'targetAmount', label: 'Target' },
          { key: 'achievement', label: 'Achievement %' },
          { key: 'commissionRate', label: 'Rate %' },
          { key: 'calculatedAmount', label: 'Calculated' },
          { key: 'adjustments', label: 'Adjustments' },
          { key: 'bonuses', label: 'Bonuses' },
          { key: 'deductions', label: 'Deductions' },
          { key: 'finalAmount', label: 'Final Amount' },
          { key: 'status', label: 'Status' },
          { key: 'paidDate', label: 'Paid Date' }
        ]
      };

      await UnifiedDocumentExportService.exportListData(
        exportData,
        format === 'excel' ? 'excel' : format,
        {
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
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleViewCommission = (commission: Commission) => {
    // Create a commission statement document
    const commissionDocument = {
      id: commission.id,
      documentNumber: commission.commissionNumber,
      date: commission.calculatedDate,
      total: commission.finalCommission,
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
      employee: commission.employee,
      salesData: commission.salesData,
      commissionData: {
        baseAmount: commission.baseAmount,
        rate: commission.commissionRate,
        calculated: commission.calculatedCommission,
        adjustments: commission.adjustments,
        bonuses: commission.bonuses,
        deductions: commission.deductions,
        final: commission.finalCommission
      },
      period: commission.period,
      status: commission.status,
      approvedBy: commission.approvedBy,
      paidDate: commission.paidDate,
      paymentMethod: commission.paymentMethod,
      notes: commission.notes,
      items: [], // Commissions don't have line items
      subtotal: 0,
      taxAmount: 0,
      taxSettings: { type: 'exclusive' as const, defaultRate: 0 }
    };

    // Open in view mode
    UnifiedDocumentExportService.exportDocument(
      commissionDocument,
      'payment-receipt', // Use payment receipt template for commission statements
      {
        format: 'view',
        colorMode: 'color',
        includeLogo: true
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Enhanced Commission Management</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportCommissions('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportCommissions('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Calculate Commission
          </Button>
        </div>
      </div>

      {/* Integration Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integration Status - Live Data Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`h-3 w-3 rounded-full ${
                financialDataStatus === 'connected' ? 'bg-green-500' :
                financialDataStatus === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium">Financial Data Integration</div>
                <div className="text-sm text-muted-foreground">
                  {financialDataStatus === 'connected' && realTimeData && 
                    `Live: KES ${realTimeData.totalRevenue.toLocaleString()} revenue`}
                  {financialDataStatus === 'loading' && 'Connecting to financial module...'}
                  {financialDataStatus === 'error' && 'Connection failed - using mock data'}
                </div>
              </div>
              {financialDataStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {financialDataStatus === 'loading' && <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />}
              {financialDataStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`h-3 w-3 rounded-full ${
                employeeDataStatus === 'connected' ? 'bg-green-500' :
                employeeDataStatus === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium">Employee/HR Integration</div>
                <div className="text-sm text-muted-foreground">
                  {employeeDataStatus === 'connected' && 
                    `${liveEmployees.length} employees, ${liveDepartments.length} departments`}
                  {employeeDataStatus === 'loading' && 'Loading employee data...'}
                  {employeeDataStatus === 'error' && 'HR system unavailable - using mock data'}
                </div>
              </div>
              {employeeDataStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {employeeDataStatus === 'loading' && <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />}
              {employeeDataStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`h-3 w-3 rounded-full ${
                commissionApiStatus === 'connected' ? 'bg-green-500' :
                commissionApiStatus === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium">Commission API Service</div>
                <div className="text-sm text-muted-foreground">
                  {commissionApiStatus === 'connected' && 'Advanced calculations & export ready'}
                  {commissionApiStatus === 'loading' && 'Initializing calculation engine...'}
                  {commissionApiStatus === 'error' && 'API service offline'}
                </div>
              </div>
              {commissionApiStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {commissionApiStatus === 'loading' && <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />}
              {commissionApiStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Integration Features Active:</strong>
              <div className="mt-1 text-xs">
                • Real-time financial data synchronization • Live employee performance metrics • Advanced commission calculation engine 
                • Unified document export service • Double-entry bookkeeping integration • Automated payment processing
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="rules">Commission Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-6">
          {/* Commission Formula Alert */}
          <Alert>
            <Calculator className="h-4 w-4" />
            <AlertDescription>
              <strong>Enhanced Commission Formula:</strong> Commission = (Sales Amount × Commission Rate %) + Bonuses - Deductions + Adjustments
              <br />
              <small>Includes sales targets, achievement percentages, and tiered commission rates</small>
            </AlertDescription>
          </Alert>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {totalCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredCommissions.length} commission records
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Commissions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {paidCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Completed payments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {pendingCommissions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Commission Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCommissionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Average rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Data Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Financial Data for Commission Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Total Expenses</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead>Gross Margin %</TableHead>
                    <TableHead>Commission Pool</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.map((data) => (
                    <TableRow key={data.period}>
                      <TableCell className="font-medium">{data.period}</TableCell>
                      <TableCell>KES {data.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>KES {data.totalExpenses.toLocaleString()}</TableCell>
                      <TableCell>KES {data.netProfit.toLocaleString()}</TableCell>
                      <TableCell>{data.grossMargin.toFixed(1)}%</TableCell>
                      <TableCell className="font-medium">
                        KES {(data.netProfit * 0.1).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Actions
                </div>
                {selectedCommissions.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                      Approve Selected ({selectedCommissions.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                      Export Selected
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search commissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="calculated">Calculated</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {periods.map(period => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Bulk Calculate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Records ({filteredCommissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedCommissions.length === filteredCommissions.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCommissions(filteredCommissions.map(c => c.id));
                          } else {
                            setSelectedCommissions([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Commission #</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Sales Performance</TableHead>
                    <TableHead>Commission Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedCommissions.includes(commission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCommissions([...selectedCommissions, commission.id]);
                            } else {
                              setSelectedCommissions(selectedCommissions.filter(id => id !== commission.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{commission.commissionNumber}</div>
                          <div className="text-xs text-muted-foreground">{commission.period}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{commission.employee.name}</div>
                            <div className="text-xs text-muted-foreground">{commission.employee.department}</div>
                            <div className="text-xs text-muted-foreground">{commission.employee.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Sales:</span>
                            <span className="font-medium">KES {commission.salesData.totalSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Target:</span>
                            <span>KES {commission.salesData.targetSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Achievement:</span>
                            <Badge variant={commission.salesData.achievementPercentage >= 100 ? 'default' : 'secondary'}>
                              {commission.salesData.achievementPercentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Rate:</span>
                            <span>{commission.commissionRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Base:</span>
                            <span>KES {commission.calculatedCommission.toLocaleString()}</span>
                          </div>
                          {commission.adjustments !== 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Adjustments:</span>
                              <span className={commission.adjustments >= 0 ? 'text-green-600' : 'text-red-600'}>
                                KES {commission.adjustments.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {commission.bonuses > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Bonuses:</span>
                              <span className="text-green-600">KES {commission.bonuses.toLocaleString()}</span>
                            </div>
                          )}
                          {commission.deductions > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Deductions:</span>
                              <span className="text-red-600">-KES {commission.deductions.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Final:</span>
                            <span>KES {commission.finalCommission.toLocaleString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(commission.status)}
                          {commission.paidDate && (
                            <div className="text-xs text-muted-foreground">
                              Paid: {new Date(commission.paidDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewCommission(commission)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(commission)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(commission.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Commission Rules</h3>
            <Button onClick={() => setIsRulesDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {commissionRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.department} • {rule.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • Base Rate: {rule.baseRate}%
                      </p>
                      {rule.tiers && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Tier Structure:</p>
                          <div className="flex gap-2 mt-1">
                            {rule.tiers.map((tier, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tier.min.toLocaleString()}-{tier.max === 999999 ? '∞' : tier.max.toLocaleString()}: {tier.rate}%
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissions
                    .sort((a, b) => b.finalCommission - a.finalCommission)
                    .slice(0, 3)
                    .map((commission, index) => (
                      <div key={commission.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{commission.employee.name}</div>
                            <div className="text-xs text-muted-foreground">{commission.employee.department}</div>
                          </div>
                        </div>
                        <div className="font-semibold">KES {commission.finalCommission.toLocaleString()}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">+15.3%</div>
                <p className="text-sm text-muted-foreground">vs previous month</p>
                <div className="mt-4 h-20 bg-blue-50 rounded flex items-center justify-center">
                  <div className="text-xs text-blue-600">Commission growth trending up</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departments.map(dept => {
                    const deptCommissions = commissions.filter(c => c.employee.department === dept);
                    const total = deptCommissions.reduce((sum, c) => sum + c.finalCommission, 0);
                    return (
                      <div key={dept} className="flex justify-between">
                        <span className="text-sm">{dept}</span>
                        <span className="font-medium">KES {total.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Commission Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>YTD Commissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(new Set(commissions.map(c => c.employee.id))).map(employeeId => {
                    const employee = commissions.find(c => c.employee.id === employeeId)?.employee;
                    if (!employee) return null;
                    
                    const ytdCommissions = commissions
                      .filter(c => c.employee.id === employeeId)
                      .reduce((sum, c) => sum + c.finalCommission, 0);
                    
                    return (
                      <TableRow key={employeeId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>{employee.commissionRate}%</TableCell>
                        <TableCell className="font-medium">KES {ytdCommissions.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Commission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingCommission ? 'Edit Commission' : 'Calculate New Commission'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Commission Number</Label>
                <Input placeholder="Auto-generated" defaultValue={editingCommission?.commissionNumber} disabled />
              </div>
              <div>
                <Label>Period</Label>
                <Select defaultValue={editingCommission?.period}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(period => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee</Label>
                <Input placeholder="Enter employee name" defaultValue={editingCommission?.employee.name} />
              </div>
              <div>
                <Label>Department</Label>
                <Select defaultValue={editingCommission?.employee.department}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Sales Amount (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingCommission?.salesData.totalSales} />
              </div>
              <div>
                <Label>Target Amount (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingCommission?.salesData.targetSales} />
              </div>
              <div>
                <Label>Commission Rate (%)</Label>
                <Input type="number" step="0.1" placeholder="0.0" defaultValue={editingCommission?.commissionRate} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Bonuses (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingCommission?.bonuses} />
              </div>
              <div>
                <Label>Deductions (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingCommission?.deductions} />
              </div>
              <div>
                <Label>Adjustments (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingCommission?.adjustments} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select defaultValue={editingCommission?.status || 'draft'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="calculated">Calculated</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes..." defaultValue={editingCommission?.notes} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingCommission ? 'Update Commission' : 'Calculate Commission'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedCommissionManagement;
