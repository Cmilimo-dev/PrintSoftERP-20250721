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
import MobileDialog from '@/components/ui/mobile-dialog';
import { useLeads, useCreateLead } from '@/hooks/useCustomers';
import { Lead } from '@/types/customers';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Filter, 
  SortAsc, 
  SortDesc,
  DollarSign,
  Building2,
  User,
  Calendar
} from 'lucide-react';
import LeadForm from './LeadForm';
import LeadView from './LeadView';
import { useExportSettings } from '@/contexts/ExportSettingsContext';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import NumberGenerationService from '@/services/numberGenerationService';
import { DateRange } from 'react-day-picker';

interface EnhancedLeadListProps {
  onSelectLead?: (lead: Lead) => void;
  selectionMode?: boolean;
  className?: string;
}

const EnhancedLeadList: React.FC<EnhancedLeadListProps> = ({ 
  onSelectLead, 
  selectionMode = false,
  className = "" 
}) => {
  const { data: leads, isLoading, refetch } = useLeads();
  const { exportSettings } = useExportSettings();
  const createLeadMutation = useCreateLead();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [valueRange, setValueRange] = useState({ min: '', max: '' });
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Get unique sources for filter
  const uniqueSources = useMemo(() => {
    const sources = leads
      ?.map(lead => lead.lead_source || lead.source)
      .filter(Boolean)
      .filter((source, index, array) => array.indexOf(source) === index);
    return sources || [];
  }, [leads]);

  // Advanced search and filtering
  const filteredAndSortedLeads = useMemo(() => {
    if (!leads) return [];

    let filtered = leads.filter(lead => {
      // Text search across multiple fields
      const searchFields = [
        lead.contact_person,
        lead.contact_name,
        lead.company_name,
        lead.email,
        lead.phone,
        lead.lead_source,
        lead.source,
        lead.notes
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter || lead.status === statusFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

      // Source filter
      const matchesSource = sourceFilter === 'all' || lead.lead_source === sourceFilter || lead.source === sourceFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange?.from && dateRange?.to) {
        const leadDate = new Date(lead.created_at || lead.date);
        matchesDateRange = leadDate >= dateRange.from && leadDate <= dateRange.to;
      }

      // Value range filter
      let matchesValueRange = true;
      if (valueRange.min || valueRange.max) {
        const value = lead.estimated_value || 0;
        const min = parseFloat(valueRange.min) || 0;
        const max = parseFloat(valueRange.max) || Infinity;
        matchesValueRange = value >= min && value <= max;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesDateRange && matchesValueRange;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle dates
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle estimated value
      if (sortField === 'estimated_value') {
        aValue = aValue || 0;
        bValue = bValue || 0;
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
  }, [leads, searchTerm, statusFilter, priorityFilter, sourceFilter, dateRange, valueRange, sortField, sortDirection]);

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate lead number if not provided
      if (!leadData.lead_number) {
        leadData.lead_number = await NumberGenerationService.generateDocumentNumber('lead');
      }
      
      await createLeadMutation.mutateAsync(leadData);
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (lead: Lead) => {
    // Implementation for delete functionality
    console.log('Delete lead:', lead);
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = {
      title: 'Lead Pipeline Report',
      data: filteredAndSortedLeads.map(lead => ({
        lead_number: lead.lead_number || lead.id,
        contact_person: lead.contact_person || lead.contact_name,
        company_name: lead.company_name || 'N/A',
        email: lead.email || 'N/A',
        phone: lead.phone || 'N/A',
        source: lead.lead_source || lead.source || 'N/A',
        status: lead.lead_status || lead.status,
        priority: lead.priority,
        estimated_value: lead.estimated_value || 0,
        score: lead.score || 0,
        created_date: new Date(lead.created_at || Date.now()).toLocaleDateString()
      })),
      columns: [
        { key: 'lead_number', label: 'Lead #' },
        { key: 'contact_person', label: 'Contact' },
        { key: 'company_name', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'source', label: 'Source' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'estimated_value', label: 'Est. Value' },
        { key: 'score', label: 'Score' },
        { key: 'created_date', label: 'Created' }
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
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'outline';
      case 'proposal': return 'default';
      case 'negotiation': return 'default';
      case 'closed_won': return 'default';
      case 'closed_lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'default';
      case 'urgent': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Target className="h-4 w-4" />;
      case 'contacted': return <Clock className="h-4 w-4" />;
      case 'qualified': return <TrendingUp className="h-4 w-4" />;
      case 'closed_won': return <CheckCircle className="h-4 w-4" />;
      case 'closed_lost': return <XCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSourceFilter('all');
    setDateRange(undefined);
    setValueRange({ min: '', max: '' });
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading leads...</div>;
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lead Pipeline Management ({filteredAndSortedLeads.length})
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
                        <span className="hidden sm:inline">Add Lead</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Lead</DialogTitle>
                    </DialogHeader>
                    <LeadForm
                      onSubmit={handleCreateLead}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>

            {/* Advanced Search and Filters */}
            <div className="space-y-4">
              {/* Main Search */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by contact, company, email, source, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  Clear Filters
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {uniqueSources.map(source => (
                      <SelectItem key={source} value={source || ''}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-[300px]"
                />

                <div className="flex gap-2 items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Min value"
                    value={valueRange.min}
                    onChange={(e) => setValueRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-[120px]"
                    type="number"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    placeholder="Max value"
                    value={valueRange.max}
                    onChange={(e) => setValueRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-[120px]"
                    type="number"
                  />
                </div>
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
                    onClick={() => handleSort('lead_number')}
                  >
                    <div className="flex items-center gap-1">
                      Lead #
                      {sortField === 'lead_number' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('contact_person')}
                  >
                    <div className="flex items-center gap-1">
                      Contact
                      {sortField === 'contact_person' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Source</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('estimated_value')}
                  >
                    <div className="flex items-center gap-1">
                      Value
                      {sortField === 'estimated_value' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLeads.map((lead) => (
                  <TableRow 
                    key={lead.id}
                    className={selectionMode ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={selectionMode ? () => onSelectLead?.(lead) : undefined}
                  >
                    <TableCell className="font-mono text-sm">
                      {lead.lead_number || lead.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {lead.contact_person || lead.contact_name || 'No contact'}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {lead.email || lead.phone || 'No contact info'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        {lead.company_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {lead.lead_source || lead.source || '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {lead.estimated_value ? `KES ${lead.estimated_value.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant={getPriorityColor(lead.priority || 'medium') as any}>
                        {lead.priority || 'medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(lead.lead_status || lead.status || 'new')}
                        <Badge variant={getStatusColor(lead.lead_status || lead.status || 'new') as any}>
                          {(lead.lead_status || lead.status || 'new').replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!selectionMode && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(lead);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(lead);
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
                                <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the lead for {lead.contact_person || lead.contact_name}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => handleDelete(lead)}
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

          {filteredAndSortedLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || sourceFilter !== 'all' || dateRange || valueRange.min || valueRange.max
                ? 'No leads found matching your criteria.'
                : 'No leads found. Create your first lead to get started.'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadForm
              lead={selectedLead}
              onSubmit={async (data) => {
                // Handle update
                console.log('Update lead:', data);
                setIsEditDialogOpen(false);
                refetch();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Lead Dialog */}
      <MobileDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        title="Lead Details"
      >
        {selectedLead && (
          <LeadView 
            lead={selectedLead}
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

export default EnhancedLeadList;
