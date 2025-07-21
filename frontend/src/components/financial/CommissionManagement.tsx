import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface Commission {
  id: string;
  commissionNumber: string;
  period: string;
  employee: string;
  department: string;
  baseAmount: number;
  commissionRate: number;
  totalExpenses: number;
  netProfit: number;
  calculatedCommission: number;
  adjustments: number;
  finalCommission: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  calculatedDate: string;
  approvedBy?: string;
  paidDate?: string;
  notes?: string;
}

interface FinancialData {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

const CommissionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const isMobile = useIsMobile();

  // Mock financial data for commission calculations
  const financialData: FinancialData[] = [
    {
      period: '2024-06',
      totalRevenue: 250000,
      totalExpenses: 150000,
      netProfit: 100000
    },
    {
      period: '2024-05',
      totalRevenue: 220000,
      totalExpenses: 140000,
      netProfit: 80000
    },
    {
      period: '2024-04',
      totalRevenue: 280000,
      totalExpenses: 160000,
      netProfit: 120000
    }
  ];

  // Mock commission data
  const commissions: Commission[] = [
    {
      id: '1',
      commissionNumber: 'COM-2024-001',
      period: '2024-06',
      employee: 'John Doe',
      department: 'Sales',
      baseAmount: 50000,
      commissionRate: 5, // 5%
      totalExpenses: 150000,
      netProfit: 100000,
      calculatedCommission: 50000, // 150000 - 100000 = 50000
      adjustments: 0,
      finalCommission: 50000,
      status: 'paid',
      calculatedDate: '2024-06-30',
      approvedBy: 'Jane Smith',
      paidDate: '2024-07-05'
    },
    {
      id: '2',
      commissionNumber: 'COM-2024-002',
      period: '2024-06',
      employee: 'Jane Smith',
      department: 'Sales',
      baseAmount: 45000,
      commissionRate: 4.5,
      totalExpenses: 150000,
      netProfit: 100000,
      calculatedCommission: 50000,
      adjustments: -5000,
      finalCommission: 45000,
      status: 'approved',
      calculatedDate: '2024-06-30',
      approvedBy: 'Mike Johnson'
    },
    {
      id: '3',
      commissionNumber: 'COM-2024-003',
      period: '2024-06',
      employee: 'Mike Johnson',
      department: 'Marketing',
      baseAmount: 30000,
      commissionRate: 3,
      totalExpenses: 150000,
      netProfit: 100000,
      calculatedCommission: 50000,
      adjustments: -20000,
      finalCommission: 30000,
      status: 'calculated',
      calculatedDate: '2024-06-30'
    },
    {
      id: '4',
      commissionNumber: 'COM-2024-004',
      period: '2024-05',
      employee: 'Sarah Wilson',
      department: 'Sales',
      baseAmount: 20000,
      commissionRate: 2.5,
      totalExpenses: 140000,
      netProfit: 80000,
      calculatedCommission: 60000, // 140000 - 80000 = 60000
      adjustments: -40000,
      finalCommission: 20000,
      status: 'draft',
      calculatedDate: '2024-05-31'
    }
  ];

  const departments = ['Sales', 'Marketing', 'Operations', 'Finance', 'IT'];
  const periods = ['2024-06', '2024-05', '2024-04', '2024-03', '2024-02', '2024-01'];

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      paid: 'default',
      approved: 'secondary',
      calculated: 'outline',
      draft: 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.commissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || commission.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || commission.period === periodFilter;
    return matchesSearch && matchesDepartment && matchesStatus && matchesPeriod;
  });

  // Calculate summary statistics
  const totalCommissions = filteredCommissions.reduce((sum, commission) => sum + commission.finalCommission, 0);
  const paidCommissions = filteredCommissions.filter(c => c.status === 'paid').reduce((sum, commission) => sum + commission.finalCommission, 0);
  const pendingCommissions = filteredCommissions.filter(c => c.status === 'calculated' || c.status === 'approved').reduce((sum, commission) => sum + commission.finalCommission, 0);
  const avgCommissionRate = filteredCommissions.length > 0 ? 
    filteredCommissions.reduce((sum, commission) => sum + commission.commissionRate, 0) / filteredCommissions.length : 0;

  const calculateCommission = (period: string, rate: number): number => {
    const periodData = financialData.find(d => d.period === period);
    if (!periodData) return 0;
    
    // Commission = Total Expenses - Net Profit
    const baseCommission = periodData.totalExpenses - periodData.netProfit;
    return (baseCommission * rate) / 100;
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      console.log(`Exporting commission data as ${format}`);
      alert(`Export as ${format.toUpperCase()} feature coming soon!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCommission(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingCommission(null);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting commission:', id);
  };

  return (
    <div className="space-y-6">
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col gap-4" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isMobile ? "flex-col text-center" : ""
        )}>
          <Percent className={cn(
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Commission Management</h2>
        </div>
        <div className={cn(
          "gap-2",
          isMobile ? "grid grid-cols-1 w-full space-y-2" : "flex"
        )}>
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Excel" : "Export Excel"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "PDF" : "Export PDF"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleCreate}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Calculate" : "Calculate Commission"}
          </Button>
        </div>
      </div>

      {/* Commission Formula Alert */}
      <Alert>
        <Calculator className="h-4 w-4" />
        <AlertDescription>
          <strong>Commission Formula:</strong> Commission = (Total Expenses - Net Profit) × Commission Rate %
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
      )}>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
                <TableHead>Commission Base</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData.map((data) => (
                <TableRow key={data.period}>
                  <TableCell className="font-medium">{data.period}</TableCell>
                  <TableCell>KES {data.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>KES {data.totalExpenses.toLocaleString()}</TableCell>
                  <TableCell>KES {data.netProfit.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">
                    KES {(data.totalExpenses - data.netProfit).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-5"
          )}>
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
            <Button 
              variant="outline"
              className={cn(
                isMobile ? "w-full" : ""
              )}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isMobile ? "Bulk Calc" : "Bulk Calculate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Records ({filteredCommissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commission #</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Rate %</TableHead>
                <TableHead>Commission Base</TableHead>
                <TableHead>Calculated</TableHead>
                <TableHead>Adjustments</TableHead>
                <TableHead>Final Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.commissionNumber}</TableCell>
                  <TableCell>{commission.period}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {commission.employee}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{commission.department}</Badge>
                  </TableCell>
                  <TableCell>{commission.commissionRate}%</TableCell>
                  <TableCell>KES {(commission.totalExpenses - commission.netProfit).toLocaleString()}</TableCell>
                  <TableCell>KES {commission.calculatedCommission.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={commission.adjustments >= 0 ? 'text-green-600' : 'text-red-600'}>
                      KES {commission.adjustments.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">KES {commission.finalCommission.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(commission.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(commission)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(commission.id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                <Input placeholder="Enter employee name" defaultValue={editingCommission?.employee} />
              </div>
              <div>
                <Label>Department</Label>
                <Select defaultValue={editingCommission?.department}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Commission Rate (%)</Label>
                <Input type="number" placeholder="0.0" step="0.1" defaultValue={editingCommission?.commissionRate} />
              </div>
              <div>
                <Label>Adjustments (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingCommission?.adjustments} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes (optional)" defaultValue={editingCommission?.notes} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
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

export default CommissionManagement;
