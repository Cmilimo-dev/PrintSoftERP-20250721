import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DocumentType } from '@/types/businessDocuments';
import StatusManager, { DocumentStatus } from './StatusManager';
import ExportActions from './ExportActions';
import { Search, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentItem {
  id: string;
  documentNumber: string;
  date: string;
  type: DocumentType;
  status: DocumentStatus;
  total: number;
  currency: string;
  customerName?: string;
  vendorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface UnifiedDocumentManagerProps {
  documents: DocumentItem[];
  documentType?: DocumentType;
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onView?: (documentId: string) => void;
  onStatusChange?: (documentId: string, newStatus: DocumentStatus) => void;
  className?: string;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'purchase-order': 'Purchase Order',
  'sales-order': 'Sales Order',
  'invoice': 'Invoice',
  'quote': 'Quote',
  'delivery-note': 'Delivery Note',
  'payment-receipt': 'Payment Receipt',
  'goods-receiving-voucher': 'Goods Receiving Voucher',
  'financial-report': 'Financial Report'
};

const UnifiedDocumentManager: React.FC<UnifiedDocumentManagerProps> = ({
  documents,
  documentType,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const { toast } = useToast();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesDocumentType = !documentType || doc.type === documentType;
    
    return matchesSearch && matchesStatus && matchesType && matchesDocumentType;
  });

  const handleStatusChange = (documentId: string, newStatus: DocumentStatus) => {
    if (onStatusChange) {
      onStatusChange(documentId, newStatus);
    } else {
      toast({
        title: "Status Updated",
        description: `Document status changed to ${newStatus}`,
      });
    }
  };

  const handleDelete = (documentId: string) => {
    if (onDelete) {
      onDelete(documentId);
    } else {
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'KES' ? 'KES' : currency;
    return `${symbol} ${amount.toLocaleString()}`;
  };

  const getPartyName = (doc: DocumentItem) => {
    if (doc.customerName) return doc.customerName;
    if (doc.vendorName) return doc.vendorName;
    return 'N/A';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {documentType ? DOCUMENT_TYPE_LABELS[documentType] : 'Document'} Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {!documentType && (
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DocumentType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, label]) => (
                    <SelectItem key={type} value={type}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2">
              <ExportActions
                elementId="document-table"
                fileName={`${documentType || 'documents'}_export`}
                documentType={documentType ? DOCUMENT_TYPE_LABELS[documentType] : 'Documents'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <div id="document-table" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document #</TableHead>
                  {!documentType && <TableHead>Type</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                    {!documentType && (
                      <TableCell>
                        <Badge variant="outline">
                          {DOCUMENT_TYPE_LABELS[doc.type]}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getPartyName(doc)}</TableCell>
                    <TableCell>
                      <StatusManager
                        currentStatus={doc.status}
                        documentType={doc.type}
                        documentId={doc.id}
                        onStatusChange={(newStatus) => handleStatusChange(doc.id, newStatus)}
                        className="w-auto"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(doc.total, doc.currency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(doc.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(doc.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <ExportActions
                          elementId={`document-${doc.id}`}
                          fileName={`${doc.documentNumber}_${doc.type}`}
                          documentType={DOCUMENT_TYPE_LABELS[doc.type]}
                          variant="ghost"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No documents found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "No documents have been created yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedDocumentManager;
