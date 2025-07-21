import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentReports from '@/components/reports/DocumentReports';
import PurchaseReports from '@/components/reports/PurchaseReports';
import SalesReports from '@/components/reports/SalesReports';
import AnalyticsDashboard from '@/components/reports/AnalyticsDashboard';
import { BarChart3, FileText, ShoppingCart, ShoppingBag } from 'lucide-react';
import { 
  MobileDashboardLayout,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const Reports: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <MobileDashboardLayout>
      <DashboardHeader title="Reports & Analytics" icon={<BarChart3 className="h-8 w-8" />} />
      
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className={cn(
          "w-full",
          isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-4"
        )}>
          <TabsTrigger 
            value="purchases" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : "gap-2"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            {isMobile ? "Purchases" : "Purchases"}
          </TabsTrigger>
          <TabsTrigger 
            value="sales" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : "gap-2"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {isMobile ? "Sales" : "Sales"}
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : "gap-2"
            )}
          >
            <FileText className="h-4 w-4" />
            {isMobile ? "Docs" : "Documents"}
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : "gap-2"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            {isMobile ? "Analytics" : "Analytics"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <PurchaseReports />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <SalesReports />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentReports />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </MobileDashboardLayout>
  );
};

export default Reports;
