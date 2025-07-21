import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { PurchaseOrder } from '@/modules/purchasing/types/purchasingTypes';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  DollarSign,
  Building2,
  Package
} from 'lucide-react';
import UnifiedNumberService from '@/services/unifiedNumberService';
import ExportActions from '@/components/shared/ExportActions';
import { DateRange } from 'react-day-picker';
import { MobileTableContainer, MobileSearchBar } from '@/components/ui/mobile-form-layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface EnhancedPurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  onCreateNew: () => void;
  onEdit: (po: PurchaseOrder) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const EnhancedPurchaseOrderList: React.FC<EnhancedPurchaseOrderListProps> = ({
  purchaseOrders,
  onCreateNew,
  onEdit,
  onDelete,
  className = ""
}) => {
  const isMobile = useIsMobile();
  // Advanced search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortField, setSortField] = useState<keyof PurchaseOrder>('documentNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get unique vendors for filter
  const uniqueVendors = useMemo(() => {
    const vendors = purchaseOrders
      .map(po => po.vendor?.name)
      .filter(Boolean)
      .filter((vendor, index, array) => array.indexOf(vendor) === index);
    return vendors;
  }, [purchaseOrders]);

  // Advanced filtering and sorting
  const filteredAndSortedPOs = useMemo(() => {
    let filtered = purchaseOrders.filter(po => {
      // Text search across multiple fields
      const searchFields = [
        po.documentNumber,
        po.vendor?.name,
        po.vendor?.email,
        po.vendor?.phone,
        po.notes,
        po.items?.map(item => `${item.name} ${item.description}`).join(' ')
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      
      // Vendor filter
      const matchesVendor = vendorFilter === 'all' || po.vendor?.name === vendorFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange?.from && dateRange?.to) {
        const poDate = new Date(po.issueDate);
        matchesDateRange = poDate >= dateRange.from && poDate <= dateRange.to;
      }

      // Amount range filter
      let matchesAmountRange = true;
      if (amountRange.min || amountRange.max) {
        const total = po.totals?.total || 0;
        const min = parseFloat(amountRange.min) || 0;
        const max = parseFloat(amountRange.max) || Infinity;
        matchesAmountRange = total >= min && total <= max;
      }

      return matchesSearch && matchesStatus && matchesVendor && matchesDateRange && matchesAmountRange;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle nested properties
      if (sortField === 'vendor' && a.vendor && b.vendor) {
        aValue = a.vendor.name;
        bValue = b.vendor.name;
      }

      // Handle dates
      if (sortField === 'issueDate' || sortField === 'deliveryDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle amounts
      if (sortField === 'totals') {
        aValue = a.totals?.total || 0;
        bValue = b.totals?.total || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue || 0) - (bValue || 0);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [purchaseOrders, searchTerm, statusFilter, vendorFilter, dateRange, amountRange, sortField, sortDirection]);

  const handleSort = (field: keyof PurchaseOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'authorized': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVendorFilter('all');
    setDateRange(undefined);
    setAmountRange({ min: '', max: '' });
  };


  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Purchase Orders ({filteredAndSortedPOs.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-1" />
                {isMobile ? "New PO" : "New Purchase Order"}
              </Button>
            </div>
          </div>

          {/* Advanced Search and Filters */}
          <div className={cn("mt-4", isMobile ? "space-y-3" : "space-y-4")}>
            {/* Main Search */}
            <MobileSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by PO number, vendor, items, or notes..."
              icon={<Search className="h-4 w-4" />}
              actions={
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                  size={isMobile ? "default" : "default"}
                >
                  Clear Filters
                </Button>
              }
            />

            {/* Filters Row */}
            <div className={cn(
              "flex gap-2",
              isMobile ? "flex-col" : "flex-wrap"
            )}>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(
                  isMobile ? "w-full h-12" : "w-[150px]"
                )}>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className={cn(
                  isMobile ? "w-full h-12" : "w-[200px]"
                )}>
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {uniqueVendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor || ''}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!isMobile && (
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-[300px]"
                />
              )}

              <div className={cn(
                "flex gap-2 items-center",
                isMobile ? "w-full" : ""
              )}>
                <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Min amount"
                  value={amountRange.min}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  className={cn(
                    "flex-1",
                    isMobile ? "h-12" : "w-[120px]"
                  )}
                  type="number"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  placeholder="Max amount"
                  value={amountRange.max}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  className={cn(
                    "flex-1",
                    isMobile ? "h-12" : "w-[120px]"
                  )}
                  type="number"
                />
              </div>
              
              {isMobile && (
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <MobileTableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('documentNumber')}
                  >
                    <div className="flex items-center gap-1">
                      PO Number
                      {sortField === 'documentNumber' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('vendor')}
                  >
                    <div className="flex items-center gap-1">
                      Vendor
                      {sortField === 'vendor' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('issueDate')}
                  >
                    <div className="flex items-center gap-1">
                      Issue Date
                      {sortField === 'issueDate' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Delivery Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Items</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totals')}
                  >
                    <div className="flex items-center gap-1">
                      Total
                      {sortField === 'totals' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {po.documentNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {po.vendor?.name || 'No vendor'}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {po.vendor?.email || po.vendor?.phone || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(po.issueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {po.deliveryDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(po.deliveryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {po.items?.length || 0} item(s)
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(po.totals?.total || 0, po.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(po.status) as any}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(po)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ExportActions
                          document={po}
                          documentType="purchase-order"
                          fileName={`PO_${po.documentNumber}`}
                          variant="ghost"
                          size="sm"
                          className="px-2"
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete PO {po.documentNumber}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => onDelete(po.id!)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MobileTableContainer>

          {filteredAndSortedPOs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || vendorFilter !== 'all' || dateRange || amountRange.min || amountRange.max
                ? 'No purchase orders found matching your criteria.'
                : 'No purchase orders found. Create your first purchase order to get started.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPurchaseOrderList;
