import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  Download, 
  Printer,
  Filter,
  MoreVertical,
  MoreHorizontal,
  FileText,
  FileDown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import BusinessDocumentPrint from '@/components/BusinessDocumentPrint';
import StatusChangeButton from '@/components/business-flow/StatusChangeButton';
import { useToast } from '@/hooks/use-toast';
import { UnifiedDocumentExportService, ExportFormat } from '@/services/unifiedDocumentExportService';
import { useExportSettings } from '@/contexts/ExportSettingsContext';
import { useConvertQuotationToSalesOrder } from '@/hooks/business-flow/useQuotationFlow';
import { useConvertSalesOrderToInvoice, useCreateDeliveryNoteFromSalesOrder } from '@/hooks/business-flow/useSalesOrderFlow';

interface EnhancedCRUDTableProps {
  documents: BaseDocument[];
  documentType: DocumentType;
  onCreateNew: () => void;
  onEdit: (document: BaseDocument) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  title: string;
  searchFields?: string[];
  statusOptions?: string[];
  columns?: Array<{
    key: string;
    label: string;
    render?: (document: BaseDocument) => React.ReactNode;
  }>;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (document: BaseDocument) => void;
    variant?: 'default' | 'outline' | 'destructive' | 'ghost';
    condition?: (document: BaseDocument) => boolean;
  }>;
  hideDocumentActions?: boolean; // New prop to hide view/print/download actions
}

const EnhancedCRUDTable: React.FC<EnhancedCRUDTableProps> = ({
  documents,
  documentType,
  onCreateNew,
  onEdit,
  onDelete,
  onStatusChange,
  title,
  searchFields = ['documentNumber'],
  statusOptions = [],
  columns = [],
  actions = [],
  hideDocumentActions = false
}) => {
  const { toast } = useToast();
  const { exportSettings } = useExportSettings();
  const isMobile = useIsMobile();
  
  // Conversion hooks
  const convertQuotationToSalesOrder = useConvertQuotationToSalesOrder();
  const convertSalesOrderToInvoice = useConvertSalesOrderToInvoice();
  const createDeliveryNote = useCreateDeliveryNoteFromSalesOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BaseDocument | null>(null);

  // Helper function to get nested values from objects
  const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  // Filter documents based on search term and status
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchFields.some(field => {
      const value = getNestedValue(doc, field);
      return value?.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const matchesStatus = statusFilter === 'all' || 
      getNestedValue(doc, 'status') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      authorized: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleView = async (document: BaseDocument) => {
    try {
      await UnifiedDocumentExportService.exportDocument(document, documentType, {
        format: 'view',
        includeLogo: exportSettings.includeLogo,
        includeSignature: exportSettings.includeSignature,
        logoDisplayMode: exportSettings.logoDisplayMode,
        logoUrl: exportSettings.logoUrl,
        watermark: exportSettings.defaultWatermark,
        colorMode: exportSettings.defaultColorMode
      });
    } catch (error) {
      console.error('Error generating view:', error);
      // Fallback to print dialog
      setSelectedDocument(document);
      setShowPrintDialog(true);
    }
  };

  const handlePrint = async (document: BaseDocument) => {
    try {
      await UnifiedDocumentExportService.exportDocument(document, documentType, {
        format: 'print',
        includeLogo: exportSettings.includeLogo,
        includeSignature: exportSettings.includeSignature,
        logoDisplayMode: exportSettings.logoDisplayMode,
        logoUrl: exportSettings.logoUrl,
        watermark: exportSettings.defaultWatermark,
        colorMode: 'monochrome' // Always use monochrome for printing
      });
    } catch (error) {
      console.error('Error printing document:', error);
      // Fallback to print dialog
      setSelectedDocument(document);
      setShowPrintDialog(true);
    }
  };

  const handleDownload = async (document: BaseDocument, format: ExportFormat = exportSettings.defaultFormat) => {
    try {
      await UnifiedDocumentExportService.exportDocument(document, documentType, {
        format,
        filename: document.documentNumber,
        includeLogo: exportSettings.includeLogo,
        includeSignature: exportSettings.includeSignature,
        logoDisplayMode: exportSettings.logoDisplayMode,
        logoUrl: exportSettings.logoUrl,
        watermark: exportSettings.defaultWatermark,
        colorMode: (format === 'print' || format === 'pdf') ? 'monochrome' : exportSettings.defaultColorMode
      });
      
      toast({
        title: "Download Started",
        description: `Downloading ${document.documentNumber} as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${document.documentNumber}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteWithConfirmation = (document: BaseDocument) => {
    const identifier = document.documentNumber || (document as any).name || document.id;
    if (window.confirm(`Are you sure you want to delete ${identifier}?`)) {
      onDelete(document.id);
      toast({
        title: "Item Deleted",
        description: `${identifier} has been deleted.`,
      });
    }
  };

  const defaultActions = [
    {
      label: 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleView,
      variant: 'ghost' as const
    },
    {
      label: 'Print',
      icon: <Printer className="w-4 h-4" />,
      onClick: handlePrint,
      variant: 'ghost' as const
    },
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'outline' as const,
      condition: (document: BaseDocument) => ['draft', 'pending'].includes((document as any).status)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteWithConfirmation,
      variant: 'destructive' as const
    }
  ];

  const allActions = [...actions, ...defaultActions];

  // Helper function to generate mobile-friendly button text
  const getShortButtonText = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('goods receiving voucher')) return 'New GRV';
    if (titleLower.includes('goods return')) return 'New Return';
    if (titleLower.includes('vendor')) return 'New Vendor';
    if (titleLower.includes('purchase order')) return 'New PO';
    if (titleLower.includes('purchase')) return 'New Purchase';
    if (titleLower.includes('quotation')) return 'New Quote';
    if (titleLower.includes('invoice')) return 'New Invoice';
    if (titleLower.includes('customer')) return 'New Customer';
    if (titleLower.includes('sales order')) return 'New SO';
    if (titleLower.includes('delivery')) return 'New Delivery';
    if (titleLower.includes('payment receipt')) return 'New Receipt';
    if (titleLower.includes('receipt')) return 'New Receipt';
    // Default fallback
    const singular = title.slice(0, -1); // Remove 's' from plural
    const words = singular.split(' ');
    if (words.length > 2) {
      // Take first word and abbreviate
      return `New ${words[0]}`;
    }
    return `New ${singular}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant="outline">{documents.length} records</Badge>
            </CardTitle>
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {isMobile ? getShortButtonText(title) : `New ${title.slice(0, -1)}`}
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className={cn(
            "mt-4",
            isMobile ? "flex flex-col gap-2" : "flex gap-4"
          )}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isMobile ? "Search..." : `Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {statusOptions.length > 0 && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={cn(
                  isMobile ? "w-full" : "w-48"
                )}>
                  <SelectValue placeholder={isMobile ? "Status" : "Filter by status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {documents.length === 0 ? (
                  isMobile ? 
                    `No ${title.toLowerCase()} yet. Tap the ${getShortButtonText(title)} button.` :
                    `No ${title.toLowerCase()} created yet. Click "New ${title.slice(0, -1)}" to get started.`
                ) : (
                  `No ${title.toLowerCase()} match your search criteria.`
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="border">
                  <CardContent className={cn(
                    "p-4",
                    isMobile ? "space-y-3" : ""
                  )}>
                    <div className={cn(
                      isMobile ? "space-y-3" : "flex justify-between items-start"
                    )}>
                      <div className="space-y-2">
                        <div className={cn(
                          "font-semibold flex items-center gap-2",
                          isMobile ? "text-base flex-wrap" : "text-lg"
                        )}>
                          <span className="break-all">{document.documentNumber || (document as any).name || document.id}</span>
                          <StatusChangeButton
                            documentType={documentType === 'quote' ? 'quotation' : documentType === 'sales-order' ? 'sales_order' : documentType}
                            documentId={document.id}
                            currentStatus={getNestedValue(document, 'status') || 'draft'}
                            onStatusChange={(newStatus) => {
                              // Trigger a re-render by updating the document status locally
                              if (onStatusChange) {
                                onStatusChange(document.id, newStatus);
                              }
                            }}
                          />
                          {/* Workflow action buttons - Three-dot menu for conversions */}
                          {(documentType === 'quote' || documentType === 'sales-order') && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Document Actions">
                                  <MoreHorizontal className="h-5 w-5 text-blue-600 font-bold" strokeWidth={3} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {documentType === 'quote' && getNestedValue(document, 'status') === 'accepted' && (
                                  <DropdownMenuItem onClick={() => convertQuotationToSalesOrder.mutate(document.id)}>
                                    Make Sale Order
                                  </DropdownMenuItem>
                                )}
                                {documentType === 'sales-order' && getNestedValue(document, 'status') === 'confirmed' && (
                                  <>
                                    <DropdownMenuItem onClick={() => convertSalesOrderToInvoice.mutate(document.id)}>
                                      Make Invoice
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => createDeliveryNote.mutate(document.id)}>
                                      Create DNote
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {documentType === 'sales-order' && getNestedValue(document, 'status') !== 'confirmed' && (
                                  <DropdownMenuItem disabled>
                                    Change status to "confirmed" to enable conversions
                                  </DropdownMenuItem>
                                )}
                                {documentType === 'quote' && getNestedValue(document, 'status') !== 'accepted' && (
                                  <DropdownMenuItem disabled>
                                    Change status to "accepted" to enable conversion
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        {/* Custom columns */}
                        {columns.map((column, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            <strong>{column.label}:</strong> {
                              column.render ? 
                              column.render(document) : 
                              getNestedValue(document, column.key)
                            }
                          </div>
                        ))}
                      </div>
                      
                      <div className={cn(
                        "flex space-y-2",
                        isMobile ? "flex-row justify-between items-center" : "flex-col items-end"
                      )}>
                        {document.total !== undefined && (
                          <div className={cn(
                            "font-semibold",
                            isMobile ? "text-base" : "text-lg"
                          )}>
                            {document.currency || ''} {document.total.toLocaleString()}
                          </div>
                        )}
                        
                        {isMobile ? (
                          /* Mobile: Single dropdown with all actions */
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <MoreVertical className="w-4 h-4" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {!hideDocumentActions && (
                                <>
                                  <DropdownMenuItem onClick={() => handleView(document)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePrint(document)}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(document, 'pdf')}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(document, 'word')}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download Word
                                  </DropdownMenuItem>
                                </>
                              )}
                              {hideDocumentActions && (
                                <DropdownMenuItem onClick={() => onEdit(document)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}
                              {!hideDocumentActions && (() => {
                                const status = (document as any).status;
                                return ['draft', 'pending'].includes(status);
                              })() && (
                                <DropdownMenuItem onClick={() => onEdit(document)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {hideDocumentActions && (
                                <DropdownMenuItem onClick={() => onEdit(document)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {/* Custom actions in mobile dropdown */}
                              {actions.map((action, index) => (
                                (!action.condition || action.condition(document)) && (
                                  <DropdownMenuItem key={index} onClick={() => action.onClick(document)}>
                                    <span className="mr-2">{action.icon}</span>
                                    {action.label}
                                  </DropdownMenuItem>
                                )
                              ))}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteWithConfirmation(document)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          /* Desktop: Individual action buttons */
                          <div className="flex gap-1 flex-wrap">
                            {/* Custom action buttons */}
                            {actions.map((action, index) => (
                              (!action.condition || action.condition(document)) && (
                                <Button
                                  key={index}
                                  variant={action.variant || 'ghost'}
                                  size="sm"
                                  onClick={() => action.onClick(document)}
                                  title={action.label}
                                >
                                  {action.icon}
                                </Button>
                              )
                            ))}
                            
                            {/* Standard action buttons */}
                            {!hideDocumentActions && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(document)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePrint(document)}
                                  title="Print"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                                
                                {/* Download dropdown */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Download">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDownload(document, 'pdf')}>
                                      <FileText className="w-4 h-4 mr-2" />
                                      Download as PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownload(document, 'word')}>
                                      <FileText className="w-4 h-4 mr-2" />
                                      Download as Word
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownload(document, 'mht')}>
                                      <FileDown className="w-4 h-4 mr-2" />
                                      Download as MHT
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownload(document, 'html')}>
                                      <FileText className="w-4 h-4 mr-2" />
                                      Download as HTML
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                            
                            {/* View button for vendor mode */}
                            {hideDocumentActions && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(document)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Edit button - conditional based on mode */}
                            {!hideDocumentActions && (() => {
                              const status = (document as any).status;
                              const shouldShowEdit = ['draft', 'pending'].includes(status);
                              return shouldShowEdit;
                            })() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(document)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Edit button for vendor mode */}
                            {hideDocumentActions && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(document)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteWithConfirmation(document)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Dialog */}
      {showPrintDialog && selectedDocument && (
        <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="print-preview-description">
            <DialogHeader>
              <DialogTitle>
                Print Preview - {selectedDocument.documentNumber}
              </DialogTitle>
              <p id="print-preview-description" className="text-sm text-muted-foreground">
                Review the document before printing or downloading.
              </p>
            </DialogHeader>
            <BusinessDocumentPrint 
              document={selectedDocument}
              documentType={documentType}
              onClose={() => setShowPrintDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EnhancedCRUDTable;
