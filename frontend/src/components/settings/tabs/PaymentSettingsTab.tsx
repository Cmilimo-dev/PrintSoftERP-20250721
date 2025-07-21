import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CreditCard, Banknote, Smartphone, Building2, Eye, FileText, Layout, Settings, Check } from 'lucide-react';
import { IntegrationSettings, PaymentInfo } from '@/modules/system-settings/types/systemSettingsTypes';
import { PaymentIntegrationService } from '@/services/paymentIntegrationService';

interface PaymentSettingsTabProps {
  integrations: IntegrationSettings;
  onUpdate: (updates: Partial<IntegrationSettings>) => void;
}

const PaymentSettingsTab: React.FC<PaymentSettingsTabProps> = ({
  integrations,
  onUpdate
}) => {
  // Safety check for payments structure
  if (!integrations.payments) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Payment settings not available.</p>
          <p className="text-sm text-muted-foreground mt-2">Please refresh the page to initialize payment settings.</p>
        </div>
      </div>
    );
  }

  const updatePaymentInfo = (updates: Partial<PaymentInfo>) => {
    const updatedPayments = {
      ...integrations.payments,
      ...updates
    };
    onUpdate({ payments: updatedPayments });
  };

  const updateBankInfo = (updates: Partial<PaymentInfo['bank']>) => {
    const updatedBank = {
      ...integrations.payments.bank,
      ...updates
    };
    updatePaymentInfo({ bank: updatedBank });
  };

  const updateMpesaInfo = (updates: Partial<PaymentInfo['mpesa']>) => {
    const updatedMpesa = {
      ...integrations.payments.mpesa,
      ...updates
    };
    updatePaymentInfo({ mpesa: updatedMpesa });
  };

  const [newCustomTerm, setNewCustomTerm] = useState({ label: '', description: '' });

  const updatePaymentTerms = (updates: Partial<PaymentInfo['paymentTerms']>) => {
    const updatedTerms = {
      ...integrations.payments.paymentTerms,
      ...updates
    };
    updatePaymentInfo({ paymentTerms: updatedTerms });
  };

  const updateDisplaySettings = (updates: Partial<PaymentInfo['displaySettings']>) => {
    const updatedSettings = {
      ...integrations.payments.displaySettings,
      ...updates
    };
    updatePaymentInfo({ displaySettings: updatedSettings });
  };

  const addCustomTerm = () => {
    if (newCustomTerm.label.trim() && newCustomTerm.description.trim()) {
      const currentTerms = integrations.payments.paymentTerms?.customTermsList || [];
      updatePaymentTerms({
        customTermsList: [...currentTerms, { ...newCustomTerm }]
      });
      setNewCustomTerm({ label: '', description: '' });
    }
  };

  const removeCustomTerm = (index: number) => {
    const currentTerms = integrations.payments.paymentTerms?.customTermsList || [];
    const updatedTerms = currentTerms.filter((_, i) => i !== index);
    updatePaymentTerms({ customTermsList: updatedTerms });
  };

  return (
    <div className="space-y-6">
      {/* Payment Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Payment Information Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={integrations.payments.showInDocuments}
              onCheckedChange={(checked) => updatePaymentInfo({ showInDocuments: checked })}
            />
            <span>Show payment information in documents (Quotations, Sales Orders, Invoices)</span>
          </div>
          
          {integrations.payments.showInDocuments && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={integrations.payments.displaySettings?.showPaymentTerms !== false}
                  onCheckedChange={(checked) => updateDisplaySettings({ showPaymentTerms: checked })}
                />
                <Label>Show Payment Terms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={integrations.payments.displaySettings?.showBankDetails !== false}
                  onCheckedChange={(checked) => updateDisplaySettings({ showBankDetails: checked })}
                />
                <Label>Show Bank Details</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={integrations.payments.displaySettings?.showMpesaDetails !== false}
                  onCheckedChange={(checked) => updateDisplaySettings({ showMpesaDetails: checked })}
                />
                <Label>Show M-Pesa Details</Label>
              </div>
            </div>
          )}
          
          {integrations.payments.showInDocuments && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Layout Style</Label>
                <Select
                  value={integrations.payments.displaySettings?.layoutStyle || 'detailed'}
                  onValueChange={(value: 'compact' | 'detailed' | 'minimal') => 
                    updateDisplaySettings({ layoutStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Terms Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={integrations.payments.paymentTerms?.enabled !== false}
              onCheckedChange={(checked) => updatePaymentTerms({ enabled: checked })}
            />
            <span>Include payment terms in documents</span>
          </div>

          {integrations.payments.paymentTerms?.enabled !== false && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Standard Terms Header</Label>
                  <Input
                    value={integrations.payments.paymentTerms?.standardTerms || ''}
                    onChange={(e) => updatePaymentTerms({ standardTerms: e.target.value })}
                    placeholder="Standard Terms Apply"
                  />
                </div>
                <div>
                  <Label>Default Payment Terms</Label>
                  <Input
                    value={integrations.payments.paymentTerms?.defaultTerms || ''}
                    onChange={(e) => updatePaymentTerms({ defaultTerms: e.target.value })}
                    placeholder="Payment due on delivery"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ownership Terms</Label>
                  <Input
                    value={integrations.payments.paymentTerms?.ownershipText || ''}
                    onChange={(e) => updatePaymentTerms({ ownershipText: e.target.value })}
                    placeholder="Goods belong to {companyName} until completion of payments"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{companyName}'} to insert your company name
                  </p>
                </div>
                <div>
                  <Label>Warranty Terms</Label>
                  <Input
                    value={integrations.payments.paymentTerms?.warrantyText || ''}
                    onChange={(e) => updatePaymentTerms({ warrantyText: e.target.value })}
                    placeholder="Standard warranty applies"
                  />
                </div>
              </div>
              
              <div>
                <Label>Delivery Terms</Label>
                <Input
                  value={integrations.payments.paymentTerms?.deliveryTerms || ''}
                  onChange={(e) => updatePaymentTerms({ deliveryTerms: e.target.value })}
                  placeholder="Payment due on delivery"
                />
              </div>

              <Separator />
              
              {/* Custom Terms */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={integrations.payments.paymentTerms?.customTermsEnabled || false}
                    onCheckedChange={(checked) => updatePaymentTerms({ customTermsEnabled: checked })}
                  />
                  <Label>Enable Custom Terms</Label>
                </div>
                
                {integrations.payments.paymentTerms?.customTermsEnabled && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Term label"
                        value={newCustomTerm.label}
                        onChange={(e) => setNewCustomTerm({ ...newCustomTerm, label: e.target.value })}
                      />
                      <Input
                        placeholder="Term description"
                        value={newCustomTerm.description}
                        onChange={(e) => setNewCustomTerm({ ...newCustomTerm, description: e.target.value })}
                      />
                      <Button onClick={addCustomTerm} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {integrations.payments.paymentTerms?.customTermsList?.map((term, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Badge variant="outline">{term.label}</Badge>
                        <span className="flex-1 text-sm">{term.description}</span>
                        <Button
                          onClick={() => removeCustomTerm(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={integrations.payments.bank.enabled}
              onCheckedChange={(checked) => updateBankInfo({ enabled: checked })}
            />
            <span>Include bank details in payment information</span>
          </div>

          {integrations.payments.bank.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={integrations.payments.bank.bankName}
                  onChange={(e) => updateBankInfo({ bankName: e.target.value })}
                  placeholder="e.g., Equity Bank Kenya"
                />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input
                  value={integrations.payments.bank.accountName}
                  onChange={(e) => updateBankInfo({ accountName: e.target.value })}
                  placeholder="Account holder name"
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={integrations.payments.bank.accountNumber}
                  onChange={(e) => updateBankInfo({ accountNumber: e.target.value })}
                  placeholder="Account number"
                />
              </div>
              <div>
                <Label>Branch Code</Label>
                <Input
                  value={integrations.payments.bank.branchCode}
                  onChange={(e) => updateBankInfo({ branchCode: e.target.value })}
                  placeholder="Branch code (optional)"
                />
              </div>
              <div>
                <Label>SWIFT Code</Label>
                <Input
                  value={integrations.payments.bank.swiftCode}
                  onChange={(e) => updateBankInfo({ swiftCode: e.target.value })}
                  placeholder="SWIFT/BIC code (optional)"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* M-Pesa Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            M-Pesa Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={integrations.payments.mpesa.enabled}
              onCheckedChange={(checked) => updateMpesaInfo({ enabled: checked })}
            />
            <span>Include M-Pesa details in payment information</span>
          </div>

          {integrations.payments.mpesa.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Business Short Code</Label>
                <Input
                  value={integrations.payments.mpesa.businessShortCode}
                  onChange={(e) => updateMpesaInfo({ businessShortCode: e.target.value })}
                  placeholder="e.g., 174379"
                />
              </div>
              <div>
                <Label>Till Number</Label>
                <Input
                  value={integrations.payments.mpesa.tillNumber}
                  onChange={(e) => updateMpesaInfo({ tillNumber: e.target.value })}
                  placeholder="Till number (if applicable)"
                />
              </div>
              <div>
                <Label>Pay Bill Number</Label>
                <Input
                  value={integrations.payments.mpesa.payBillNumber}
                  onChange={(e) => updateMpesaInfo({ payBillNumber: e.target.value })}
                  placeholder="Pay Bill number (if applicable)"
                />
              </div>
              <div>
                <Label>Account Reference</Label>
                <Input
                  value={integrations.payments.mpesa.accountReference}
                  onChange={(e) => updateMpesaInfo({ accountReference: e.target.value })}
                  placeholder="Account reference (optional)"
                />
              </div>
              <div>
                <Label>Business Name</Label>
                <Input
                  value={integrations.payments.mpesa.businessName}
                  onChange={(e) => updateMpesaInfo({ businessName: e.target.value })}
                  placeholder="Business name for M-Pesa (optional)"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Additional Payment Instructions</Label>
            <Textarea
              value={integrations.payments.instructions}
              onChange={(e) => updatePaymentInfo({ instructions: e.target.value })}
              placeholder="Enter any additional payment instructions, terms, or notes that should appear in documents..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {integrations.payments.showInDocuments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="space-y-3 text-sm">
                {(() => {
                  const paymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();
                  const sections = [];
                  
                  if (paymentInfo.showBankDetails && paymentInfo.bankDetails) {
                    sections.push(
                      <div key="bank" className="space-y-1">
                        <h4 className="font-semibold text-foreground">Bank Details:</h4>
                        <div className="text-muted-foreground space-y-0.5">
                          <p>Bank: {paymentInfo.bankDetails.bankName}</p>
                          <p>Account Name: {paymentInfo.bankDetails.accountName}</p>
                          <p>Account Number: {paymentInfo.bankDetails.accountNumber}</p>
                          {paymentInfo.bankDetails.branchCode && (
                            <p>Branch Code: {paymentInfo.bankDetails.branchCode}</p>
                          )}
                          {paymentInfo.bankDetails.swiftCode && (
                            <p>SWIFT Code: {paymentInfo.bankDetails.swiftCode}</p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  if (paymentInfo.showMpesaDetails && paymentInfo.mpesaDetails) {
                    sections.push(
                      <div key="mpesa" className="space-y-1">
                        <h4 className="font-semibold text-foreground">M-Pesa Payment:</h4>
                        <div className="text-muted-foreground space-y-0.5">
                          {paymentInfo.mpesaDetails.payBillNumber && (
                            <p>Pay Bill: {paymentInfo.mpesaDetails.payBillNumber}</p>
                          )}
                          {paymentInfo.mpesaDetails.tillNumber && (
                            <p>Till Number: {paymentInfo.mpesaDetails.tillNumber}</p>
                          )}
                          {paymentInfo.mpesaDetails.businessShortCode && (
                            <p>Business Short Code: {paymentInfo.mpesaDetails.businessShortCode}</p>
                          )}
                          {paymentInfo.mpesaDetails.accountReference && (
                            <p>Account Reference: {paymentInfo.mpesaDetails.accountReference}</p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  if (paymentInfo.paymentInstructions) {
                    sections.push(
                      <div key="instructions" className="space-y-1">
                        <h4 className="font-semibold text-foreground">Payment Instructions:</h4>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {paymentInfo.paymentInstructions}
                        </p>
                      </div>
                    );
                  }
                  
                  if (sections.length === 0) {
                    return (
                      <p className="text-muted-foreground italic">
                        No payment information configured or display is disabled.
                      </p>
                    );
                  }
                  
                  return sections;
                })()}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is how payment information will appear in your documents.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSettingsTab;
