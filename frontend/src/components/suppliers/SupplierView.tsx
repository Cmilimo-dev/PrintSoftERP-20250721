import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Supplier } from '@/types/customers';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Edit,
  FileText,
  Truck,
  Clock
} from 'lucide-react';

interface SupplierViewProps {
  supplier: Supplier;
  onEdit: () => void;
  onClose: () => void;
}

const SupplierView: React.FC<SupplierViewProps> = ({ supplier, onEdit, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (typeof amount !== 'number') return 'N/A';
    return `${currency || 'KES'} ${amount.toLocaleString()}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manufacturer': return 'default';
      case 'distributor': return 'secondary';
      case 'service_provider': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">
              {supplier.company_name || supplier.name || 'Unnamed Supplier'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getTypeColor(supplier.supplier_type || 'manufacturer') as any}>
                {supplier.supplier_type?.replace('_', ' ') || 'Standard'}
              </Badge>
              <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                {supplier.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {supplier.supplier_code && (
                <span className="text-sm text-muted-foreground font-mono">
                  #{supplier.supplier_code}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.company_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="mt-1">{supplier.company_name}</p>
              </div>
            )}


            {supplier.supplier_code && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier Code</label>
                <p className="mt-1 font-mono">{supplier.supplier_code}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Supplier Type</label>
              <p className="mt-1">
                <Badge variant={getTypeColor(supplier.supplier_type || 'manufacturer') as any}>
                  {supplier.supplier_type?.replace('_', ' ') || 'Standard'}
                </Badge>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="mt-1">
                <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>

            {supplier.tax_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax Number</label>
                <p className="mt-1 font-mono">{supplier.tax_number}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">{supplier.email}</p>
                </div>
              </div>
            )}

            {supplier.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="mt-1">{supplier.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="mt-1">{supplier.address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {supplier.city && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="mt-1">{supplier.city}</p>
                </div>
              )}

              {supplier.state && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">State/Province</label>
                  <p className="mt-1">{supplier.state}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {supplier.zip && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ZIP/Postal Code</label>
                  <p className="mt-1">{supplier.zip}</p>
                </div>
              )}

              {supplier.country && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="mt-1">{supplier.country}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(supplier.credit_limit, supplier.preferred_currency)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Preferred Currency</label>
              <p className="mt-1">{supplier.preferred_currency || 'KES'}</p>
            </div>

            {supplier.payment_terms && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                  <p className="mt-1">{supplier.payment_terms} days</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {supplier.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">Created</label>
              <p className="mt-1">{formatDate(supplier.created_at)}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Last Updated</label>
              <p className="mt-1">{formatDate(supplier.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierView;
