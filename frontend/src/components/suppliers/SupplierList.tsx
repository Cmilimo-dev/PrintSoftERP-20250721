
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useCustomers';
import { Truck, Building2 } from 'lucide-react';

const SupplierList: React.FC = () => {
  const { data: suppliers, isLoading } = useSuppliers();

  if (isLoading) {
    return <div>Loading suppliers...</div>;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturer': return 'default';
      case 'distributor': return 'secondary';
      case 'service_provider': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Supplier List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Terms</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{supplier.company_name}</div>
                      {supplier.contact_person && (
                        <div className="text-sm text-muted-foreground">
                          Contact: {supplier.contact_person}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{supplier.supplier_code}</TableCell>
                <TableCell>
                  <Badge variant={getTypeColor(supplier.supplier_type) as any}>
                    {supplier.supplier_type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {supplier.email && <div className="text-sm">{supplier.email}</div>}
                    {supplier.phone && <div className="text-sm text-muted-foreground">{supplier.phone}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.city && supplier.country ? `${supplier.city}, ${supplier.country}` : '-'}
                </TableCell>
                <TableCell>{supplier.payment_terms} days</TableCell>
                <TableCell>
                  <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SupplierList;
