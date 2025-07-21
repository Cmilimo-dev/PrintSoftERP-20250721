import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MobileDialog from '@/components/ui/mobile-dialog';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { Customer } from '@/types/customers';
import { Users, Building2, Search, Plus, Edit, Eye, Trash2, Download, Filter, SortAsc, SortDesc } from 'lucide-react';
import CustomerForm from './CustomerForm';
import CustomerView from './CustomerView';
import { useExportSettings } from '@/contexts/ExportSettingsContext';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';

interface EnhancedCustomerListProps {
  onSelectCustomer?: (customer: Customer) => void;
  selectionMode?: boolean;
  className?: string;
}

const EnhancedCustomerList: React.FC<EnhancedCustomerListProps> = ({ 
  onSelectCustomer, 
  selectionMode = false,
  className = "" 
}) => {
  const { data: customers, isLoading, refetch } = useCustomers();
  const { exportSettings } = useExportSettings();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Customer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Advanced search and filtering
  const filteredAndSortedCustomers = useMemo(() => {
    if (!customers) return [];

    let filtered = customers.filter(customer => {
      // Text search across multiple fields
      const searchFields = [
        customer.name,
        customer.company_name,
        customer.email,
        customer.phone,
        customer.first_name,
        customer.last_name,
        customer.city,
        customer.country
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      // Type filter
      const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Customer number generation is handled in useCreateCustomer hook
      await createCustomerMutation.mutateAsync(customerData);
      setIsCreateDialogOpen(false);
      // No need to manually refetch - the mutation's onSuccess will invalidate the query
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    try {
      console.log('Delete customer:', customer);
      await deleteCustomerMutation.mutateAsync(customer.id);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = {
      title: 'Customer List',
      data: filteredAndSortedCustomers,
      columns: [
        { key: 'customer_number', label: 'Customer #' },
        { key: 'name', label: 'Name' },
        { key: 'company_name', label: 'Company' },
        { key: 'customer_type', label: 'Type' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'status', label: 'Status' }
      ]
    };

    try {
      await UnifiedDocumentExportService.exportListData(
        exportData,
        format,
        exportSettings
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading customers...</div>;
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management ({filteredAndSortedCustomers.length})
              </CardTitle>
              
              {/* Mobile-responsive button group */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport('pdf')}
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                  <Button
                    onClick={() => handleExport('excel')}
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Export Excel</span>
                    <span className="sm:hidden">Excel</span>
                  </Button>
                </div>
                {!selectionMode && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Add Customer</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                      onSubmit={handleCreateCustomer}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, phone, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="flex-1 sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('customer_number')}
                  >
                    <div className="flex items-center gap-1">
                      Customer #
                      {sortField === 'customer_number' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden xl:table-cell">Credit Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id}
                    className={selectionMode ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={selectionMode ? () => onSelectCustomer?.(customer) : undefined}
                  >
                    <TableCell className="font-mono text-sm">
                      {customer.customer_number || customer.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {customer.customer_type === 'company' ? (
                          <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {customer.name || customer.company_name || 'Unnamed Customer'}
                          </div>
                          {customer.company_name && customer.company_name !== customer.name && (
                            <div className="text-sm text-muted-foreground truncate">
                              {customer.company_name}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground truncate md:hidden">
                            {customer.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">
                        {customer.customer_type === 'company' ? 'Company' : 'Individual'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {customer.email && <div className="text-sm">{customer.email}</div>}
                        {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {customer.city && customer.country ? `${customer.city}, ${customer.country}` : '-'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {customer.preferred_currency || 'KES'} {(customer.credit_limit ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(customer.status) as any}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!selectionMode && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(customer);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(customer);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {customer.name || customer.company_name}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => handleDelete(customer)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'No customers found matching your criteria.'
                : 'No customers found. Create your first customer to get started.'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              isEdit={true}
              onSubmit={async (data) => {
                try {
                  console.log('Update customer:', data);
                  if (selectedCustomer) {
                    await updateCustomerMutation.mutateAsync({ id: selectedCustomer.id, ...data });
                    setIsEditDialogOpen(false);
                  }
                } catch (error) {
                  console.error('Failed to update customer:', error);
                  // Error handling is done in the mutation's onError callback
                }
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <MobileDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        title="Customer Details"
      >
        {selectedCustomer && (
          <CustomerView 
            customer={selectedCustomer}
            onEdit={() => {
              setIsViewDialogOpen(false);
              setIsEditDialogOpen(true);
            }}
            onClose={() => setIsViewDialogOpen(false)}
          />
        )}
      </MobileDialog>
    </div>
  );
};

export default EnhancedCustomerList;
