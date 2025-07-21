import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Globe, Loader2, FileDown, Eye, Printer } from 'lucide-react';
import { UnifiedDocumentExportService, ExportFormat } from '@/services/unifiedDocumentExportService';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { useToast } from '@/hooks/use-toast';

interface ExportActionsProps {
  document: BaseDocument;
  documentType: DocumentType;
  fileName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  exportOptions?: {
    includeLogo?: boolean;
    includeSignature?: boolean;
    logoDisplayMode?: 'none' | 'logo-only' | 'logo-with-name' | 'name-only';
    logoUrl?: string;
    watermark?: string;
    colorMode?: 'color' | 'monochrome';
  };
}

const ExportActions: React.FC<ExportActionsProps> = ({
  document,
  documentType,
  fileName,
  variant = 'outline',
  size = 'sm',
  className = '',
  exportOptions = {}
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const defaultExportOptions = {
    includeLogo: true,
    includeSignature: true,
    // logoDisplayMode will be auto-determined from system settings
    colorMode: 'color' as const,
    ...exportOptions
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      const finalFileName = fileName || `${document.documentNumber}_${new Date().toISOString().split('T')[0]}`;
      
      await UnifiedDocumentExportService.exportDocument(document, documentType, {
        format,
        filename: finalFileName,
        ...defaultExportOptions,
        colorMode: format === 'print' || format === 'pdf' ? 'monochrome' : 'color'
      });
      
      toast({
        title: "Export Successful",
        description: `${document.documentNumber} exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export ${document.documentNumber}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleView = async () => {
    try {
      await UnifiedDocumentExportService.exportDocument(document, documentType, {
        format: 'view',
        ...defaultExportOptions
      });
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: "View Failed",
        description: `Failed to open view for ${document.documentNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handlePrint = async () => {
    try {
      await UnifiedDocumentExportService.exportDocument(document, documentType, {
        format: 'print',
        ...defaultExportOptions,
        colorMode: 'monochrome'
      });
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Failed",
        description: `Failed to print ${document.documentNumber}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-1">
      {/* Quick Action Buttons */}
      <Button 
        variant="ghost" 
        size={size}
        onClick={handleView}
        title="View Document"
        className="px-2"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size={size}
        onClick={handlePrint}
        title="Print Document"
        className="px-2"
      >
        <Printer className="h-4 w-4" />
      </Button>
      
      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            disabled={isExporting}
            className={`flex items-center gap-2 ${className}`}
            title="Export Options"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {size !== 'sm' && (isExporting ? 'Exporting...' : 'Export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('word')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as Word
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('html')}>
            <Globe className="h-4 w-4 mr-2" />
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('mht')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export as MHT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportActions;
