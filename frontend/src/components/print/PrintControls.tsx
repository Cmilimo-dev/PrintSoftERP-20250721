
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface PrintControlsProps {
  documentNumber: string;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

const PrintControls: React.FC<PrintControlsProps> = ({
  documentNumber,
  onClose,
  onPrint,
  onDownload
}) => {
  return (
    <div className="print:hidden bg-white border-b shadow-sm p-4 sticky top-0 z-50">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-3">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-xs text-muted-foreground">
            {documentNumber}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onDownload} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={onPrint} className="flex-1 flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between items-center">
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            HTML Format - Print Ready
          </div>
          <div className="flex gap-2">
            <Button onClick={onDownload} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download HTML
            </Button>
            <Button onClick={onPrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintControls;
