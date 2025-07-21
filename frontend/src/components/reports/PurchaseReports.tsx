import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  Download, 
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Printer
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockPurchases = [
  {
    id: '1',
    purchaseOrderNumber: 'PO-2024-001',
    date: '2024-06-15',
    vendor: 'ABC Suppliers Ltd',
    vendorCode: 'VND-001',
    totalAmount: 15000,
    items: 12,
    status: 'delivered',
    paymentStatus: 'paid',
    dueDate: '2024-07-15'
  },
  {
    id: '2',
    purchaseOrderNumber: 'PO-2024-002',
    date: '2024-06-18',
    vendor: 'XYZ Manufacturing',
    vendorCode: 'VND-002',
    totalAmount: 8500,
    items: 5,
    status: 'pending',
    paymentStatus: 'pending',
    dueDate: '2024-07-18'
  },
  {
    id: '3',
    purchaseOrderNumber: 'PO-2024-003',
    date: '2024-06-20',
    vendor: 'Global Parts Inc',
    vendorCode: 'VND-003',
    totalAmount: 22000,
    items: 18,
    status: 'delivered',
    paymentStatus: 'partially-paid',
    dueDate: '2024-07-20'
  },
  {
    id: '4',
    purchaseOrderNumber: 'PO-2024-004',
    date: '2024-06-22',
    vendor: 'ABC Suppliers Ltd',
    vendorCode: 'VND-001',
    totalAmount: 3200,
    items: 3,
    status: 'shipped',
    paymentStatus: 'paid',
    dueDate: '2024-07-22'
  },
  {
    id: '5',
    purchaseOrderNumber: 'PO-2024-005',
    date: '2024-06-25',
    vendor: 'Tech Components Co',
    vendorCode: 'VND-004',
    totalAmount: 12800,
    items: 8,
    status: 'delivered',
    paymentStatus: 'overdue',
    dueDate: '2024-06-25'
  }
];

const PurchaseReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const isMobile = useIsMobile();

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      delivered: 'default',
      shipped: 'secondary',
      pending: 'outline',
      cancelled: 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      paid: 'default',
      'partially-paid': 'secondary',
      pending: 'outline',
      overdue: 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
      </Badge>
    );
  };

  const filteredPurchases = mockPurchases.filter(purchase => {
    const matchesSearch = purchase.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.vendorCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = vendorFilter === 'all' || purchase.vendorCode === vendorFilter;
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || purchase.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesVendor && matchesStatus && matchesPaymentStatus;
  });

  // Calculate summary statistics
  const totalPurchases = filteredPurchases.length;
  const totalAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalItems = filteredPurchases.reduce((sum, purchase) => sum + purchase.items, 0);
  const avgOrderValue = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

  // Get unique vendors for filter
  const uniqueVendors = Array.from(new Set(mockPurchases.map(p => p.vendorCode)));

  const exportToPDF = async () => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      const exportData = {
        title: `Purchase Report - ${new Date().toLocaleDateString('en-GB')}`,
        data: filteredPurchases.map(purchase => ({
          purchaseOrderNumber: purchase.purchaseOrderNumber,
          date: purchase.date,
          vendor: purchase.vendor,
          vendorCode: purchase.vendorCode,
          items: purchase.items,
          totalAmount: purchase.totalAmount,
          status: purchase.status,
          paymentStatus: purchase.paymentStatus,
          dueDate: purchase.dueDate
        })),
        columns: [
          { key: 'purchaseOrderNumber', label: 'PO Number' },
          { key: 'date', label: 'Date' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'vendorCode', label: 'Vendor Code' },
          { key: 'items', label: 'Items' },
          { key: 'totalAmount', label: 'Total Amount ($)' },
          { key: 'status', label: 'Status' },
          { key: 'paymentStatus', label: 'Payment Status' },
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
        footerText: `Generated on ${new Date().toLocaleString()} | Total Purchases: ${totalPurchases} | Total Amount: $${totalAmount.toLocaleString()}`
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
        title: `Purchase Report - ${new Date().toLocaleDateString('en-GB')}`,
        data: filteredPurchases.map(purchase => ({
          purchaseOrderNumber: purchase.purchaseOrderNumber,
          date: purchase.date,
          vendor: purchase.vendor,
          vendorCode: purchase.vendorCode,
          items: purchase.items,
          totalAmount: purchase.totalAmount,
          status: purchase.status,
          paymentStatus: purchase.paymentStatus,
          dueDate: purchase.dueDate
        })),
        columns: [
          { key: 'purchaseOrderNumber', label: 'PO Number' },
          { key: 'date', label: 'Date' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'vendorCode', label: 'Vendor Code' },
          { key: 'items', label: 'Items' },
          { key: 'totalAmount', label: 'Total Amount ($)' },
          { key: 'status', label: 'Status' },
          { key: 'paymentStatus', label: 'Payment Status' },
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
        footerText: `Generated on ${new Date().toLocaleString()} | Total Purchases: ${totalPurchases} | Total Amount: $${totalAmount.toLocaleString()}`
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
          <ShoppingCart className={cn(
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Purchase Reports</h2>
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
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              Purchase orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Items purchased
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
              Per purchase order
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
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-6"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {uniqueVendors.map(vendorCode => {
                  const vendor = mockPurchases.find(p => p.vendorCode === vendorCode);
                  return (
                    <SelectItem key={vendorCode} value={vendorCode}>
                      {vendor?.vendor} ({vendorCode})
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially-paid">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.purchaseOrderNumber}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{purchase.vendor}</div>
                      <div className="text-sm text-muted-foreground">{purchase.vendorCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>{purchase.items}</TableCell>
                  <TableCell>${purchase.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(purchase.paymentStatus)}</TableCell>
                  <TableCell>{purchase.dueDate}</TableCell>
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

export default PurchaseReports;
