
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentRecord {
  id: string;
  documentNumber: string;
  date: string;
  customerName?: string;
  vendorName?: string;
  total: number;
  status: string;
  currency?: string;
}

interface DocumentListViewProps {
  title: string;
  documents: DocumentRecord[];
  isLoading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPrint?: (id: string) => void;
  onDownload?: (id: string) => void;
  currency?: string;
}

const DocumentListView: React.FC<DocumentListViewProps> = ({
  title,
  documents,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onPrint,
  onDownload,
  currency = 'KES'
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'secondary';
      case 'pending': return 'default';
      case 'confirmed': 
      case 'sent': 
      case 'active': return 'default';
      case 'paid': 
      case 'delivered': 
      case 'completed': return 'default';
      case 'cancelled': 
      case 'rejected': return 'destructive';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading documents...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
          <Badge variant="outline" className="ml-auto">
            {documents.length} records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {title.toLowerCase()} found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Customer/Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.documentNumber}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.customerName || doc.vendorName || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currency} {doc.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(doc.status) as any}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(doc.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onPrint && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPrint(doc.id)}
                            title="Print"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {onDownload && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownload(doc.id)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(doc.id)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(doc.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentListView;
