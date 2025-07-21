import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Percent, Plus, Download, Printer } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const CommissionManagementSimple: React.FC = () => {
  const isMobile = useIsMobile();

  const handleExport = (format: string) => {
    alert(`Export as ${format.toUpperCase()} feature coming soon!`);
  };

  const handlePrint = () => {
    alert('Print feature coming soon!');
  };

  const handleCreate = () => {
    alert('Create commission feature coming soon!');
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
          <Percent className={cn(
            isMobile ? "h-5 w-5" : "h-6 w-6"
          )} />
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Commission Management</h2>
        </div>
        <div className={cn(
          "gap-2",
          isMobile ? "grid grid-cols-1 w-full space-y-2" : "flex"
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
          <Button 
            onClick={handleCreate}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Calculate" : "Calculate Commission"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Percent className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Commission Management System</h3>
            <p className="text-muted-foreground mb-4">
              Manage employee commissions, calculate rates, and track payments.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Calculate commissions based on financial performance</p>
              <p>• Track commission status and approvals</p>
              <p>• Export commission reports</p>
              <p>• Mobile-responsive interface</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionManagementSimple;
