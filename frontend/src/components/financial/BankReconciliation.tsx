
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const BankReconciliation: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <div className={cn(
          "flex items-center",
          isMobile ? "flex-col gap-4" : "justify-between"
        )}>
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-lg" : ""
          )}>
            <Banknote className="h-5 w-5" />
            Bank Reconciliation
          </CardTitle>
          <Button className={cn(
            isMobile ? "w-full" : ""
          )}>
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "New Recon" : "New Reconciliation"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Banknote className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            Bank reconciliation feature will be implemented to match bank statements with book records.
          </p>
          <Button 
            variant="outline" 
            className={cn(
              "mt-4",
              isMobile ? "w-full" : ""
            )}
          >
            {isMobile ? "Upload Statement" : "Upload Bank Statement"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankReconciliation;
