import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Printer
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  attachments?: string[];
  receiptNumber?: string;
  taxAmount?: number;
  approvedBy?: string;
  paidDate?: string;
  notes?: string;
}

const ExpensesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const isMobile = useIsMobile();

  // Mock data
  const expenses: Expense[] = [
    {
      id: '1',
      expenseNumber: 'EXP-2024-001',
      date: '2024-06-20',
      category: 'Office Supplies',
      description: 'Printer paper and toner cartridges',
      amount: 2500,
      vendor: 'Office Mart Ltd',
      paymentMethod: 'company-card',
      status: 'paid',
      receiptNumber: 'OM-12345',
      taxAmount: 400,
      approvedBy: 'John Doe',
      paidDate: '2024-06-22',
      notes: 'Monthly office supplies purchase'
    },
    {
      id: '2',
      expenseNumber: 'EXP-2024-002',
      date: '2024-06-22',
      category: 'Travel & Transport',
      description: 'Client meeting travel expenses',
      amount: 15000,
      vendor: 'City Taxi Services',
      paymentMethod: 'cash',
      status: 'approved',
      receiptNumber: 'CTS-7890',
      taxAmount: 0,
      approvedBy: 'Jane Smith'
    },
    {
      id: '3',
      expenseNumber: 'EXP-2024-003',
      date: '2024-06-25',
      category: 'Marketing',
      description: 'Social media advertising campaign',
      amount: 50000,
      vendor: 'Digital Marketing Pro',
      paymentMethod: 'bank-transfer',
      status: 'pending',
      taxAmount: 8000
    },
    {
      id: '4',
      expenseNumber: 'EXP-2024-004',
      date: '2024-06-26',
      category: 'Utilities',
      description: 'Monthly electricity and water bills',
      amount: 12000,
      vendor: 'Kenya Power & Water Co.',
      paymentMethod: 'direct-debit',
      status: 'paid',
      receiptNumber: 'KPLC-456789',
      taxAmount: 1920,
      approvedBy: 'Mike Johnson',
      paidDate: '2024-06-27'
    },
    {
      id: '5',
      expenseNumber: 'EXP-2024-005',
      date: '2024-06-28',
      category: 'Equipment',
      description: 'New laptop for development team',
      amount: 85000,
      vendor: 'Tech Solutions Kenya',
      paymentMethod: 'company-card',
      status: 'rejected',
      taxAmount: 13600,
      notes: 'Budget exceeded for Q2'
    }
  ];

  const categories = [
    'Office Supplies',
    'Travel & Transport',
    'Marketing',
    'Utilities',
    'Equipment',
    'Software & Licenses',
    'Professional Services',
    'Rent & Facilities',
    'Insurance',
    'Training & Development',
    'Meals & Entertainment',
    'Communications',
    'Other'
  ];

  const paymentMethods = [
    'cash',
    'company-card',
    'bank-transfer',
    'check',
    'direct-debit',
    'm-pesa'
  ];

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      paid: 'default',
      approved: 'secondary',
      pending: 'outline',
      rejected: 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    return (
      <Badge variant="outline">
        {method.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = filteredExpenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = filteredExpenses.filter(e => e.status === 'approved').reduce((sum, expense) => sum + expense.amount, 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setIsDialogOpen(false);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      const exportData = {
        title: `Expenses Report - ${new Date().toLocaleDateString('en-GB')}`,
        data: filteredExpenses.map(expense => ({
          expenseNumber: expense.expenseNumber,
          date: new Date(expense.date).toLocaleDateString('en-GB'),
          category: expense.category,
          description: expense.description,
          vendor: expense.vendor,
          amount: expense.amount,
          taxAmount: expense.taxAmount || 0,
          paymentMethod: expense.paymentMethod,
          status: expense.status,
          receiptNumber: expense.receiptNumber || 'N/A',
          approvedBy: expense.approvedBy || 'N/A',
          paidDate: expense.paidDate ? new Date(expense.paidDate).toLocaleDateString('en-GB') : 'N/A'
        })),
        columns: [
          { key: 'expenseNumber', label: 'Expense #' },
          { key: 'date', label: 'Date' },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'amount', label: 'Amount (KES)' },
          { key: 'taxAmount', label: 'Tax (KES)' },
          { key: 'paymentMethod', label: 'Payment Method' },
          { key: 'status', label: 'Status' },
          { key: 'receiptNumber', label: 'Receipt #' },
          { key: 'approvedBy', label: 'Approved By' },
          { key: 'paidDate', label: 'Paid Date' }
        ]
      };
      
      const exportSettings = {
        company: {
          name: 'Business ERP Company',
          address: '123 Business Street',
          city: 'Nairobi',
          state: 'Nairobi County',
          zip: '00100',
          country: 'Kenya',
          phone: '+254 700 123 456',
          email: 'info@businesserp.co.ke',
          website: 'www.businesserp.co.ke',
          taxId: 'P051234567M'
        },
        logo: { url: '', maxWidth: 100, maxHeight: 50 },
        typography: {
          documentTitleFont: 'Tahoma',
          bodyFont: 'Trebuchet MS',
          documentTitleSize: 24,
          bodyFontSize: 12,
          headingColor: '#2b6cb0',
          bodyColor: '#2d3748',
          accentColor: '#3182ce'
        },
        includeFooter: true,
        footerText: `Expenses Report | Total: KES ${totalExpenses.toLocaleString()} | Generated: ${new Date().toLocaleString()}`
      };
      
      await UnifiedDocumentExportService.exportListData(exportData, format, exportSettings);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = (id: string) => {
    // Handle delete logic here
    console.log('Deleting expense:', id);
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
          <CreditCard className={cn(
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Expenses Management</h2>
        </div>
        <div className={cn(
          "gap-2",
          isMobile ? "flex flex-col w-full" : "flex"
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
            {isMobile ? "Add" : "Add Expense"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
      )}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} expense records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {paidExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {pendingExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {approvedExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Ready for payment
            </p>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.expenseNumber}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>KES {expense.amount.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentMethodBadge(expense.paymentMethod)}</TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(expense.id)}>
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
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expense Number</Label>
                <Input placeholder="Auto-generated" defaultValue={editingExpense?.expenseNumber} disabled />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" defaultValue={editingExpense?.date} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select defaultValue={editingExpense?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vendor</Label>
                <Input placeholder="Enter vendor name" defaultValue={editingExpense?.vendor} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Enter expense description" defaultValue={editingExpense?.description} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Amount (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingExpense?.amount} />
              </div>
              <div>
                <Label>Tax Amount (KES)</Label>
                <Input type="number" placeholder="0.00" defaultValue={editingExpense?.taxAmount} />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select defaultValue={editingExpense?.paymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {method.replace('-', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes (optional)" defaultValue={editingExpense?.notes} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesManagement;
