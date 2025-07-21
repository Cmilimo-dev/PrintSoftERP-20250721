import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSuppliers, useCreateSupplier, useDeleteSupplier } from '@/hooks/useCustomers';
import { Supplier } from '@/types/customers';
import { Truck, Building2, Search, Plus, Edit, Eye, Trash2, Download, Filter, SortAsc, SortDesc } from 'lucide-react';
import SupplierForm from './SupplierForm';
import SupplierView from './SupplierView';
import { useExportSettings } from '@/contexts/ExportSettingsContext';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import UnifiedNumberService from '@/services/unifiedNumberService';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface EnhancedSupplierListProps {
  onSelectSupplier?: (supplier: Supplier) => void;
  selectionMode?: boolean;
  className?: string;
}

const EnhancedSupplierList: React.FC<EnhancedSupplierListProps> = ({ 
  onSelectSupplier, 
  selectionMode = false,
  className = "" 
}) => {
  const isMobile = useIsMobile();
  const { data: suppliers, isLoading, refetch } = useSuppliers();
  const { exportSettings } = useExportSettings();
  const createSupplierMutation = useCreateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Supplier>('company_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Advanced search and filtering
  const filteredAndSortedSuppliers = useMemo(() => {
    if (!suppliers) return [];

    let filtered = suppliers.filter(supplier => {
      // Text search across multiple fields
      const searchFields = [
        supplier.company_name,
        supplier.name,
        supplier.email,
        supplier.phone,
        supplier.supplier_code,
        supplier.city,
        supplier.country
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? supplier.is_active : !supplier.is_active);
      
      // Type filter
      const matchesType = typeFilter === 'all' || supplier.supplier_type === typeFilter;

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
  }, [suppliers, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate supplier number if not provided
      if (!supplierData.supplier_code) {
        supplierData.supplier_code = UnifiedNumberService.generateSupplierNumberSync();
      }
      
      await createSupplierMutation.mutateAsync(supplierData);
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    try {
      await deleteSupplierMutation.mutateAsync(supplier.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = {
      title: 'Supplier List',
      data: filteredAndSortedSuppliers,
      columns: [
        { key: 'supplier_code', label: 'Supplier Code' },
        { key: 'company_name', label: 'Company Name' },
        { key: 'supplier_type', label: 'Type' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'payment_terms', label: 'Payment Terms' },
        { key: 'is_active', label: 'Status' }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturer': return 'default';
      case 'distributor': return 'secondary';
      case 'service_provider': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading suppliers...</div>;
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className={isMobile ? "p-3" : "p-6"}>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col gap-2" : "justify-between"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-base" : "text-lg"
            )}>
              <Truck className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
              {isMobile ? "Suppliers" : "Supplier Management"} ({filteredAndSortedSuppliers.length})
            </CardTitle>
            <div className={cn(
              "flex gap-1",
              isMobile ? "w-full flex-col" : "gap-2"
            )}>
              {!isMobile && (
                <>
                  <Button
                    onClick={() => handleExport('pdf')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={() => handleExport('excel')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export Excel
                  </Button>
                </>
              )}
              {!selectionMode && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className={isMobile ? "w-full" : ""}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Supplier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={cn(
                    isMobile ? "max-w-[95vw] max-h-[90vh]" : "max-w-4xl max-h-[90vh]",
                    "overflow-y-auto"
                  )}>
                    <DialogHeader>
                      <DialogTitle>Create New Supplier</DialogTitle>
                    </DialogHeader>
                    <SupplierForm
                      onSubmit={handleCreateSupplier}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers by name, code, contact, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('supplier_code')}
                  >
                    <div className="flex items-center gap-1">
                      Code
                      {sortField === 'supplier_code' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('company_name')}
                  >
                    <div className="flex items-center gap-1">
                      Supplier
                      {sortField === 'company_name' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden xl:table-cell">Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSuppliers.map((supplier) => (
                  <TableRow 
                    key={supplier.id}
                    className={selectionMode ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={selectionMode ? () => onSelectSupplier?.(supplier) : undefined}
                  >
                    <TableCell className="font-mono text-sm">
                      {supplier.supplier_code || supplier.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {supplier.company_name || supplier.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {supplier.supplier_code}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getTypeColor(supplier.supplier_type) as any}>
                        {supplier.supplier_type?.replace('_', ' ') || 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {supplier.email && <div className="text-sm">{supplier.email}</div>}
                        {supplier.phone && <div className="text-sm text-muted-foreground">{supplier.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {supplier.city && supplier.country ? `${supplier.city}, ${supplier.country}` : '-'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {supplier.payment_terms || 30} days
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
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
                              handleView(supplier);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(supplier);
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
                                <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {supplier.company_name || supplier.name}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => handleDelete(supplier)}
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

          {filteredAndSortedSuppliers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No suppliers found matching your criteria.'
                : 'No suppliers found. Create your first supplier to get started.'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierForm
              supplier={selectedSupplier}
              onSubmit={async (data) => {
                // Handle update
                console.log('Update supplier:', data);
                setIsEditDialogOpen(false);
                refetch();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierView 
              supplier={selectedSupplier}
              onEdit={() => {
                setIsViewDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
              onClose={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSupplierList;
