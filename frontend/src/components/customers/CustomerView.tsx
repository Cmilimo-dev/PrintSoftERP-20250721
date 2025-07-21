import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Customer } from '@/types/customers';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Edit,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';

interface CustomerViewProps {
  customer: Customer;
  onEdit: () => void;
  onClose: () => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ customer, onEdit, onClose }) => {
  const isMobile = useIsMobile();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (typeof amount !== 'number') return 'N/A';
    return `${currency || 'KES'} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className={cn("space-y-6", isMobile ? "space-y-4" : "")}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
        isMobile ? "flex-col gap-4" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isMobile ? "w-full" : ""
        )}>
          {customer.customer_type === 'company' ? (
            <Building2 className={cn("text-blue-600", isMobile ? "h-6 w-6" : "h-8 w-8")} />
          ) : (
            <User className={cn("text-green-600", isMobile ? "h-6 w-6" : "h-8 w-8")} />
          )}
          <div className="flex-1 min-w-0">
            <h2 className={cn(
              "font-bold",
              isMobile ? "text-lg" : "text-2xl"
            )}>
              {customer.name || customer.company_name || 'Unnamed Customer'}
            </h2>
            <div className={cn(
              "flex items-center gap-2 mt-1",
              isMobile ? "flex-wrap" : ""
            )}>
              <Badge variant="outline">
                {customer.customer_type === 'company' ? 'Company' : 'Individual'}
              </Badge>
              <Badge variant={getStatusColor(customer.status) as any}>
                {customer.status}
              </Badge>
              {customer.customer_number && (
                <span className="text-sm text-muted-foreground font-mono">
                  #{customer.customer_number}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={cn(
          "flex gap-2",
          isMobile ? "w-full" : ""
        )}>
          <Button 
            onClick={onEdit} 
            variant="outline"
            className={isMobile ? "flex-1" : ""}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            onClick={onClose} 
            variant="outline"
            className={isMobile ? "flex-1" : ""}
          >
            Close
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content Grid */}
      <div className={cn(
        "grid grid-cols-1 gap-6",
        !isMobile ? "lg:grid-cols-2" : ""
      )}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.customer_type === 'individual' && (
              <>
                {customer.first_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <p className="mt-1">{customer.first_name}</p>
                  </div>
                )}
                {customer.last_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <p className="mt-1">{customer.last_name}</p>
                  </div>
                )}
              </>
            )}
            
            {customer.company_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="mt-1">{customer.company_name}</p>
              </div>
            )}

            {customer.customer_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Number</label>
                <p className="mt-1 font-mono">{customer.customer_number}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer Type</label>
              <p className="mt-1 capitalize">{customer.customer_type}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusColor(customer.status) as any}>
                  {customer.status}
                </Badge>
              </div>
            </div>
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
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="mt-1">{customer.phone}</p>
                </div>
              </div>
            )}

            {customer.website && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                <p className="mt-1">
                  <a 
                    href={customer.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {customer.website}
                  </a>
                </p>
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
            {customer.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="mt-1">{customer.address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {customer.city && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="mt-1">{customer.city}</p>
                </div>
              )}

              {customer.state && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">State/Province</label>
                  <p className="mt-1">{customer.state}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {customer.zip && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ZIP/Postal Code</label>
                  <p className="mt-1">{customer.zip}</p>
                </div>
              )}

              {customer.country && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="mt-1">{customer.country}</p>
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
                {formatCurrency(customer.credit_limit, customer.preferred_currency)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Preferred Currency</label>
              <p className="mt-1">{customer.preferred_currency || 'KES'}</p>
            </div>

            {customer.payment_terms && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                  <p className="mt-1">{customer.payment_terms} days</p>
                </div>
              </div>
            )}

            {customer.tax_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax Number</label>
                <p className="mt-1 font-mono">{customer.tax_number}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
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
              <p className="mt-1">{formatDate(customer.created_at)}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Last Updated</label>
              <p className="mt-1">{formatDate(customer.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerView;
