import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingBag, 
  Download, 
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Printer
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockSales = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-06-15',
    customer: 'Tech Solutions Inc',
    customerCode: 'CUST-001',
    totalAmount: 25000,
    items: 8,
    status: 'paid',
    paymentMethod: 'bank-transfer',
    dueDate: '2024-07-15',
    salesRep: 'John Doe'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-06-18',
    customer: 'Global Enterprises',
    customerCode: 'CUST-002',
    totalAmount: 15500,
    items: 5,
    status: 'pending',
    paymentMethod: 'check',
    dueDate: '2024-07-18',
    salesRep: 'Jane Smith'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    date: '2024-06-20',
    customer: 'Local Business Ltd',
    customerCode: 'CUST-003',
    totalAmount: 8200,
    items: 3,
    status: 'paid',
    paymentMethod: 'm-pesa',
    dueDate: '2024-07-20',
    salesRep: 'John Doe'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    date: '2024-06-22',
    customer: 'Tech Solutions Inc',
    customerCode: 'CUST-001',
    totalAmount: 12000,
    items: 6,
    status: 'partially-paid',
    paymentMethod: 'bank-transfer',
    dueDate: '2024-07-22',
    salesRep: 'Mike Johnson'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    date: '2024-06-25',
    customer: 'StartUp Co',
    customerCode: 'CUST-004',
    totalAmount: 5800,
    items: 2,
    status: 'overdue',
    paymentMethod: 'check',
    dueDate: '2024-06-25',
    salesRep: 'Jane Smith'
  },
  {
    id: '6',
    invoiceNumber: 'SO-2024-001',
    date: '2024-06-26',
    customer: 'Enterprise Corp',
    customerCode: 'CUST-005',
    totalAmount: 35000,
    items: 15,
    status: 'paid',
    paymentMethod: 'wire-transfer',
    dueDate: '2024-07-26',
    salesRep: 'John Doe'
  }
];

const SalesReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salesRepFilter, setSalesRepFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const isMobile = useIsMobile();

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      paid: 'default',
      'partially-paid': 'secondary',
      pending: 'outline',
      overdue: 'destructive',
      cancelled: 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'bank-transfer': 'default',
      'wire-transfer': 'default',
      'm-pesa': 'secondary',
      'check': 'outline',
      'cash': 'outline'
    };
    
    return (
      <Badge variant={methodColors[method] || 'outline'}>
        {method.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredSales = mockSales.filter(sale => {
    const matchesSearch = sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.salesRep.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = customerFilter === 'all' || sale.customerCode === customerFilter;
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesSalesRep = salesRepFilter === 'all' || sale.salesRep === salesRepFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || sale.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesCustomer && matchesStatus && matchesSalesRep && matchesPaymentMethod;
  });

  // Calculate summary statistics
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items, 0);
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Get unique values for filters
  const uniqueCustomers = Array.from(new Set(mockSales.map(s => s.customerCode)));
  const uniqueSalesReps = Array.from(new Set(mockSales.map(s => s.salesRep)));
  const uniquePaymentMethods = Array.from(new Set(mockSales.map(s => s.paymentMethod)));

  const exportToPDF = async () => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      const exportData = {
        title: `Sales Report - ${new Date().toLocaleDateString('en-GB')}`,
        data: filteredSales.map(sale => ({
          invoiceNumber: sale.invoiceNumber,
          date: sale.date,
          customer: sale.customer,
          customerCode: sale.customerCode,
          salesRep: sale.salesRep,
          items: sale.items,
          totalAmount: sale.totalAmount,
          status: sale.status,
          paymentMethod: sale.paymentMethod,
          dueDate: sale.dueDate
        })),
        columns: [
          { key: 'invoiceNumber', label: 'Invoice/SO Number' },
          { key: 'date', label: 'Date' },
          { key: 'customer', label: 'Customer' },
          { key: 'customerCode', label: 'Customer Code' },
          { key: 'salesRep', label: 'Sales Rep' },
          { key: 'items', label: 'Items' },
          { key: 'totalAmount', label: 'Total Amount ($)' },
          { key: 'status', label: 'Status' },
          { key: 'paymentMethod', label: 'Payment Method' },
          { key: 'dueDate', label: 'Due Date' }
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
        footerText: `Generated on ${new Date().toLocaleString()} | Total Sales: ${totalSales} | Total Revenue: $${totalRevenue.toLocaleString()}`
      };
      
      await UnifiedDocumentExportService.exportListData(exportData, 'pdf', exportSettings);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportToCSV = async () => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      const exportData = {
        title: `Sales Report - ${new Date().toLocaleDateString('en-GB')}`,
        data: filteredSales.map(sale => ({
          invoiceNumber: sale.invoiceNumber,
          date: sale.date,
          customer: sale.customer,
          customerCode: sale.customerCode,
          salesRep: sale.salesRep,
          items: sale.items,
          totalAmount: sale.totalAmount,
          status: sale.status,
          paymentMethod: sale.paymentMethod,
          dueDate: sale.dueDate
        })),
        columns: [
          { key: 'invoiceNumber', label: 'Invoice/SO Number' },
          { key: 'date', label: 'Date' },
          { key: 'customer', label: 'Customer' },
          { key: 'customerCode', label: 'Customer Code' },
          { key: 'salesRep', label: 'Sales Rep' },
          { key: 'items', label: 'Items' },
          { key: 'totalAmount', label: 'Total Amount ($)' },
          { key: 'status', label: 'Status' },
          { key: 'paymentMethod', label: 'Payment Method' },
          { key: 'dueDate', label: 'Due Date' }
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
        footerText: `Generated on ${new Date().toLocaleString()} | Total Sales: ${totalSales} | Total Revenue: $${totalRevenue.toLocaleString()}`
      };
      
      await UnifiedDocumentExportService.exportListData(exportData, 'csv', exportSettings);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
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
          <ShoppingBag className={cn(
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Sales Reports</h2>
        </div>
        <div className={cn(
          "gap-2",
          isMobile ? "flex flex-col w-full" : "flex"
        )}>
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Excel" : "Export Excel"}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportToPDF}
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
      )}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Sales transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total sales value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Total items sold
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per sales order
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
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-7"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {uniqueCustomers.map(customerCode => {
                  const customer = mockSales.find(s => s.customerCode === customerCode);
                  return (
                    <SelectItem key={customerCode} value={customerCode}>
                      {customer?.customer} ({customerCode})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially-paid">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salesRepFilter} onValueChange={setSalesRepFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sales rep" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales Reps</SelectItem>
                {uniqueSalesReps.map(rep => (
                  <SelectItem key={rep} value={rep}>
                    {rep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {uniquePaymentMethods.map(method => (
                  <SelectItem key={method} value={method}>
                    {method.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
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

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice/SO Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.customer}</div>
                      <div className="text-sm text-muted-foreground">{sale.customerCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>{sale.salesRep}</TableCell>
                  <TableCell>{sale.items}</TableCell>
                  <TableCell>${sale.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>{getPaymentMethodBadge(sale.paymentMethod)}</TableCell>
                  <TableCell>{sale.dueDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReports;
