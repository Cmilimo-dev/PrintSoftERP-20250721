
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MobileDashboardLayout,
  DashboardStatsGrid,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import EnhancedCustomerList from '@/components/customers/EnhancedCustomerList';
import CustomerForm from '@/components/customers/CustomerForm';
import LeadForm from '@/components/customers/LeadForm';
import EnhancedLeadList from '@/components/customers/EnhancedLeadList';
import { useCustomers, useLeads, useCreateCustomer } from '@/hooks/useCustomers';
import { Plus, Users, Target, UserPlus } from 'lucide-react';

const Customers: React.FC = () => {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  
  const { data: customers } = useCustomers();
  const { data: leads } = useLeads();
  const createCustomerMutation = useCreateCustomer();

  const stats = [
    {
      title: 'Total Customers',
      value: customers?.length || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Open Leads',
      value: leads?.filter(l => !['closed_won', 'closed_lost'].includes(l.lead_status)).length || 0,
      icon: Target,
      color: 'text-orange-600',
    },
    {
      title: 'Converted Leads',
      value: leads?.filter(l => l.lead_status === 'closed_won').length || 0,
      icon: UserPlus,
      color: 'text-green-600',
    },
    {
      title: 'This Month Revenue',
      value: 'KES 0', // TODO: Calculate from sales
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <MobileDashboardLayout className="container mx-auto p-4 md:p-6 space-y-6">
      <DashboardHeader
        title="Customer Management"
      >
        {/* Mobile-responsive button group */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <CustomerForm onSubmit={async (customerData) => {
                await createCustomerMutation.mutateAsync(customerData);
                setIsCustomerDialogOpen(false);
              }} />
            </DialogContent>
          </Dialog>

          <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Lead</span>
                <span className="sm:hidden">Lead</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm onSubmit={() => setIsLeadDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </DashboardHeader>

      {/* Stats Dashboard - Mobile responsive grid */}
      <DashboardStatsGrid columns={4}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium truncate">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </DashboardStatsGrid>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-none md:flex">
          <TabsTrigger value="customers" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Customers</span>
            <span className="sm:hidden">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
            <Target className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Leads</span>
            <span className="sm:hidden">Leads</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers">
          <EnhancedCustomerList />
        </TabsContent>
        
        <TabsContent value="leads">
          <EnhancedLeadList />
        </TabsContent>
      </Tabs>
    </MobileDashboardLayout>
  );
};

export default Customers;
