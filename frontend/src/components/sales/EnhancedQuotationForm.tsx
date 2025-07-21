import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Quote } from '@/types/businessDocuments';
import { useSettings } from '@/hooks/useSettings';
import { useCustomers } from '@/hooks/useCustomers';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import TaxSettingsSection from '@/components/purchase-order/TaxSettingsSection';
import { Save, Printer, FileText, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StatusChangeButton from '@/components/business-flow/StatusChangeButton';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { DepartmentSignatureService } from '@/services/departmentSignatureService';
import { AuthorizedSignature } from '@/modules/system-settings/types/signatureTypes';
import { PaymentIntegrationService } from '@/services/paymentIntegrationService';

interface EnhancedQuotationFormProps {
  quotation?: Quote | null;
  onSave: (quotation: Quote) => void;
  onCancel: () => void;
  showHeader?: boolean;
  showActions?: boolean;
}

const EnhancedQuotationForm: React.FC<EnhancedQuotationFormProps> = ({
  quotation,
  onSave,
  onCancel,
  showHeader = true,
  showActions = true
}) => {
  const { toast } = useToast();
  const { data: customers } = useCustomers();
  const systemSettings = SystemSettingsService.getSettings();
  const [userSettings] = useState({
    company: systemSettings.companyInfo || {
      name: 'Priority Solutions Inc.',
      address: '123 Business Park Drive',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
      phone: '+1 (555) 123-4567',
      email: 'info@prioritysolutions.com',
      taxId: 'TAX123456789',
      website: 'www.prioritysolutions.com',
      logo: ''
    },
    currency: systemSettings.currency || 'KES'
  });

  const {
    formData,
    handleFormDataUpdate,
    setFormData
  } = useBusinessDocumentForm({
    documentType: 'quotation',
    document: quotation,
    userSettings
  });

  const [currentStatus, setCurrentStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'>(
    (formData as Quote).status || 'draft'
  );

  const handleStatusChange = (newStatus: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => {
    setCurrentStatus(newStatus);
    setFormData(prev => ({
      ...prev,
      status: newStatus
    } as Quote));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submitted with data:', formData);
      console.log('Current status:', currentStatus);
      
      // Validation
      if (!formData.documentNumber) {
        toast({
          title: "Error",
          description: "Quotation number is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.date) {
        toast({
          title: "Error",
          description: "Date is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.items || formData.items.length === 0) {
        toast({
          title: "Error",
          description: "At least one line item is required",
          variant: "destructive",
        });
        return;
      }
      
      const updatedQuotation = {
        ...formData as Quote,
        status: currentStatus,
        validUntil: (formData as Quote).validUntil || calculateValidUntil(formData.date, 30)
      };
      
      console.log('Processed quotation data before submission:', updatedQuotation);
      
      onSave(updatedQuotation);
      
      console.log('Quotation saved successfully');
      
      toast({
        title: "Success",
        description: `Quotation ${currentStatus === 'draft' ? 'saved as draft' : 'updated successfully'}`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save quotation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateValidUntil = (quoteDate: string, validityDays: number = 30): string => {
    const date = new Date(quoteDate);
    date.setDate(date.getDate() + validityDays);
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCustomerDisplayName = (customer: any) => {
    if (customer.customer_type === 'company') {
      return customer.company_name || 'Company';
    }
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Individual';
  };

  // Memoize onItemsChange to prevent infinite loops
  const handleItemsChange = useCallback((items: any[]) => {
    setFormData(prev => {
      // Recalculate totals using previous state
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = prev.taxSettings.type === 'overall' 
        ? (subtotal * prev.taxSettings.defaultRate) / 100
        : items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const total = subtotal + taxAmount;
      
      return {
        ...prev,
        items,
        subtotal,
        taxAmount,
        total
      };
    });
  }, [setFormData]);

// Fetch available signatures for the 'quotation' document type with real-time updates
  const [availableSignatures, setAvailableSignatures] = useState<AuthorizedSignature[]>([]);
  const [defaultSignature, setDefaultSignature] = useState<AuthorizedSignature | undefined>();
  
  useEffect(() => {
    const loadSignatures = () => {
      const signatures = DepartmentSignatureService.getSignaturesForDocument('quotation');
      const defaultSig = DepartmentSignatureService.getDefaultSignatureForDocument('quotation');
      console.log('🔄 Quotation form loading signatures:', signatures);
      setAvailableSignatures(signatures);
      setDefaultSignature(defaultSig);
    };

    loadSignatures();

    // Subscribe to signature changes for real-time updates
    const unsubscribe = DepartmentSignatureService.onSignatureChange(() => {
      console.log('🔔 Quotation form received signature update');
      loadSignatures();
    });

    return unsubscribe;
  }, []);

return (
    <div className="w-full">
      <div className="w-full">
        {showHeader && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-foreground">
                {quotation ? 'Edit' : 'Create'} Quotation
              </h1>
              {quotation?.id ? (
                <StatusChangeButton
                  documentType="quotation"
                  documentId={quotation.id}
                  currentStatus={currentStatus}
                  onStatusChange={setCurrentStatus}
                />
              ) : (
                <Badge className={`${getStatusColor(currentStatus)} flex items-center gap-1`}>
                  {getStatusIcon(currentStatus)}
                  {currentStatus.toUpperCase()}
                </Badge>
              )}
            </div>
            {showActions && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Branding Header */}
          <Card>
            <CardContent className="pt-6">
              {(() => {
                const companyHeader = PaymentIntegrationService.formatCompanyHeader();
                return (
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      {companyHeader.showLogo && companyHeader.logoUrl && (
                        <img 
                          src={companyHeader.logoUrl} 
                          alt="Company Logo" 
                          className="h-16 w-auto object-contain"
                        />
                      )}
                      {companyHeader.showCompanyName && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {companyHeader.companyName}
                          </h2>
                          <p className="text-sm text-muted-foreground">QUOTATION</p>
                        </div>
                      )}
                      {!companyHeader.showLogo && !companyHeader.showCompanyName && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">QUOTATION</h2>
                          <p className="text-sm text-muted-foreground">Configure company branding in System Settings</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Document #</div>
                      <div className="font-mono text-lg font-semibold">
                        {formData.documentNumber || 'QUO-XXXX'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Document Header */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Quote Number</Label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => handleFormDataUpdate({ documentNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Quote Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormDataUpdate({ date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={(formData as Quote).validUntil || calculateValidUntil(formData.date, 30)}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value } as Quote))}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <Select 
                    value={(formData as Quote).customer?.name || ''} 
                    onValueChange={(value) => {
                      const selectedCustomer = customers?.find(c => getCustomerDisplayName(c) === value);
                      if (selectedCustomer) {
                        setFormData(prev => ({
                          ...prev,
                          customer: {
                            name: getCustomerDisplayName(selectedCustomer),
                            address: selectedCustomer.address || '',
                            city: selectedCustomer.city || '',
                            state: selectedCustomer.state || '',
                            zip: selectedCustomer.postal_code || '',
                            phone: selectedCustomer.phone || '',
                            email: selectedCustomer.email || '',
                            taxId: selectedCustomer.tax_number || '',
                            paymentTerms: '30'
                          }
                        } as Quote));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={getCustomerDisplayName(customer)}>
                          {getCustomerDisplayName(customer)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleFormDataUpdate({ currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Validity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Validity & Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Validity Period (Days)</Label>
                  <Select 
                    value={(formData as Quote).validityPeriod || '30'} 
                    onValueChange={(value) => {
                      const validUntil = calculateValidUntil(formData.date, parseInt(value));
                      setFormData(prev => ({ 
                        ...prev, 
                        validityPeriod: value,
                        validUntil 
                      } as Quote));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select validity period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={(formData as Quote).validUntil || calculateValidUntil(formData.date, 30)}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value } as Quote))}
                    required
                  />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select 
                    value={(formData as Quote).paymentTerms || '30'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value } as Quote))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due Immediately</SelectItem>
                      <SelectItem value="7">Net 7 days</SelectItem>
                      <SelectItem value="15">Net 15 days</SelectItem>
                      <SelectItem value="30">Net 30 days</SelectItem>
                      <SelectItem value="60">Net 60 days</SelectItem>
                      <SelectItem value="90">Net 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VAT Settings */}
          <TaxSettingsSection
            taxSettings={formData.taxSettings}
            onUpdate={(updates) => {
              setFormData(prev => ({
                ...prev,
                taxSettings: { ...prev.taxSettings, ...updates }
              }));
            }}
          />

          {/* Smart Line Items Component */}
          <SmartLineItemComponent
            items={formData.items}
            onItemsChange={handleItemsChange}
            currency={formData.currency}
            taxSettings={formData.taxSettings}
            documentType="quote"
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
          />

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleFormDataUpdate({ notes: e.target.value })}
                  placeholder="Quotation notes and comments"
                  rows={3}
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms || ''}
                  onChange={(e) => handleFormDataUpdate({ terms: e.target.value })}
                  placeholder="Quote validity, payment terms, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

        </form>
      </div>
    </div>
  );
};

export default EnhancedQuotationForm;
