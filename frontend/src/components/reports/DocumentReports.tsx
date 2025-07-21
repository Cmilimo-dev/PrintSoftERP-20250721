import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CreditCard, 
  DollarSign, 
  Download, 
  Filter,
  Search,
  Calendar,
  Printer
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockPayments = [
  {
    id: '1',
    documentNumber: 'PAY-2024-001',
    date: '2024-06-20',
    customer: 'ABC Corp',
    amount: 5000,
    method: 'bank-transfer',
    status: 'confirmed',
    reference: 'TXN123456'
  },
  {
    id: '2',
    documentNumber: 'PAY-2024-002',
    date: '2024-06-21',
    vendor: 'XYZ Supplies',
    amount: 2500,
    method: 'check',
    status: 'pending',
    reference: 'CHK001'
  },
];

const mockCreditNotes = [
  {
    id: '1',
    documentNumber: 'CN-2024-001',
    date: '2024-06-18',
    customer: 'ABC Corp',
    originalInvoice: 'INV-2024-015',
    amount: 1200,
    reason: 'Product return',
    status: 'issued'
  },
  {
    id: '2',
    documentNumber: 'CN-2024-002',
    date: '2024-06-19',
    customer: 'DEF Ltd',
    originalInvoice: 'INV-2024-020',
    amount: 800,
    reason: 'Pricing error correction',
    status: 'applied'
  },
];

const DocumentReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const isMobile = useIsMobile();

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      issued: 'default',
      applied: 'default',
      draft: 'outline'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.customer && payment.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (payment.vendor && payment.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCreditNotes = mockCreditNotes.filter(creditNote => {
    const matchesSearch = creditNote.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditNote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditNote.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || creditNote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    // Add export logic here
    console.log(`Exporting as ${format}`);
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
          <FileText className={cn(
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
          <h1 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Document Reports</h1>
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
        </div>
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
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-4"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
            <Button 
              variant="outline"
              className={cn(
                isMobile ? "w-full" : ""
              )}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {isMobile ? "Custom" : "Custom Range"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className={cn(
          "w-full",
          isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-3"
        )}>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer/Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.documentNumber}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.customer || payment.vendor}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.method.replace('-', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit-notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credit Note Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Original Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreditNotes.map((creditNote) => (
                    <TableRow key={creditNote.id}>
                      <TableCell className="font-medium">{creditNote.documentNumber}</TableCell>
                      <TableCell>{creditNote.date}</TableCell>
                      <TableCell>{creditNote.customer}</TableCell>
                      <TableCell>{creditNote.originalInvoice}</TableCell>
                      <TableCell>${creditNote.amount.toLocaleString()}</TableCell>
                      <TableCell>{creditNote.reason}</TableCell>
                      <TableCell>{getStatusBadge(creditNote.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$7,500</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Notes Issued</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,000</div>
                <p className="text-xs text-muted-foreground">
                  -8% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,500</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentReports;
