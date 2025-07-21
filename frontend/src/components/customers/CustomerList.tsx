
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveTable, StatusBadge } from '@/components/ui/responsive-table';
import { Badge } from '@/components/ui/badge';
import { useCustomers } from '@/hooks/useCustomers';
import { Users, Building2 } from 'lucide-react';

const CustomerList: React.FC = () => {
  const { data: customers, isLoading } = useCustomers();

  if (isLoading) {
    return <div>Loading customers...</div>;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveTable
          data={customers || []}
          loading={isLoading}
          columns={[
            {
              key: 'name',
              header: 'Customer',
              render: (value, row) => (
                <div className="flex items-center gap-2">
                  {row.customer_type === 'company' ? (
                    <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {value || row.company_name || 'Unnamed Customer'}
                    </div>
                    {row.company_name && row.company_name !== value && (
                      <div className="text-sm text-muted-foreground truncate">
                        Company: {row.company_name}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'customer_type',
              header: 'Type',
              mobileHide: true,
              render: (type) => (
                <Badge variant="outline">
                  {type === 'company' ? 'Company' : 'Individual'}
                </Badge>
              ),
            },
            {
              key: 'email',
              header: 'Email',
              render: (email) => email || '-',
            },
            {
              key: 'phone',
              header: 'Phone',
              mobileHide: true,
              render: (phone) => phone || '-',
            },
            {
              key: 'location',
              header: 'Location',
              mobileHide: true,
              render: (value, row) => (
                row.city && row.country ? `${row.city}, ${row.country}` : '-'
              ),
            },
            {
              key: 'credit_limit',
              header: 'Credit Limit',
              mobileHide: true,
              render: (value, row) => (
                `${row.preferred_currency || 'KES'} ${(value || 0).toLocaleString()}`
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (status) => <StatusBadge status={status} />,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default CustomerList;
