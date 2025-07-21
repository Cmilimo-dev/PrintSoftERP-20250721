import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Building,
  Hash,
  FileText,
  Loader2
} from 'lucide-react';
import { ChartOfAccounts, AccountType, Currency } from '@/modules/financial/types/financialTypes';
import { FinancialValidationService, ValidationResult } from '@/services/financialValidationService';
import { ErrorDisplay, FieldError } from './ErrorHandling';
import { useCreateChartOfAccount, useUpdateChartOfAccount } from '@/hooks/financial/useChartOfAccounts';
import { useToast } from '@/hooks/use-toast';

interface EnhancedChartOfAccountsFormProps {
  account?: ChartOfAccounts;
  onSave?: (account: ChartOfAccounts) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  className?: string;
}

interface FormData {
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubtype: string;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  currency: Currency;
  currentBalance: number;
}

const EnhancedChartOfAccountsForm: React.FC<EnhancedChartOfAccountsFormProps> = ({
  account,
  onSave,
  onCancel,
  isEdit = false,
  className = ''
}) => {
  const { toast } = useToast();
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  const createAccountMutation = useCreateChartOfAccount();
  const updateAccountMutation = useUpdateChartOfAccount();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      accountNumber: account?.accountNumber || '',
      accountName: account?.accountName || '',
      accountType: account?.accountType || 'asset',
      accountSubtype: account?.accountSubtype || '',
      parentAccountId: account?.parentAccountId,
      description: account?.description || '',
      isActive: account?.isActive !== false,
      currency: account?.currency || 'KES',
      currentBalance: account?.currentBalance || 0
    }
  });

  const watchedValues = watch();

  // Real-time validation
  useEffect(() => {
    if (hasValidated) {
      validateForm();
    }
  }, [watchedValues, hasValidated]);

  const validateForm = async () => {
    setIsValidating(true);
    
    const accountData: Partial<ChartOfAccounts> = {
      id: account?.id,
      accountNumber: watchedValues.accountNumber,
      accountName: watchedValues.accountName,
      accountType: watchedValues.accountType,
      accountSubtype: watchedValues.accountSubtype,
      parentAccountId: watchedValues.parentAccountId,
      description: watchedValues.description,
      isActive: watchedValues.isActive,
      currency: watchedValues.currency,
      currentBalance: watchedValues.currentBalance
    };

    const validationResult = FinancialValidationService.validateChartOfAccount(accountData);
    setValidation(validationResult);
    setIsValidating(false);
    setHasValidated(true);
    
    return validationResult;
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Validate before submission
      const validationResult = await validateForm();
      
      if (!validationResult.isValid) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the validation errors before saving.',
          variant: 'destructive'
        });
        return;
      }

      const accountData: ChartOfAccounts = {
        id: account?.id || '',
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        accountType: data.accountType,
        accountSubtype: data.accountSubtype,
        parentAccountId: data.parentAccountId,
        description: data.description,
        isActive: data.isActive,
        isSystemAccount: account?.isSystemAccount || false,
        currency: data.currency,
        openingBalance: account?.openingBalance || 0,
        currentBalance: data.currentBalance,
        debitBalance: account?.debitBalance || 0,
        creditBalance: account?.creditBalance || 0,
        lastTransactionDate: account?.lastTransactionDate || '',
        tags: account?.tags || [],
        createdAt: account?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEdit && account?.id) {
        await updateAccountMutation.mutateAsync(accountData);
      } else {
        await createAccountMutation.mutateAsync(accountData);
      }

      if (onSave) {
        onSave(accountData);
      }

      // Show success with warnings if any
      if (validationResult.warnings.length > 0) {
        toast({
          title: 'Saved with Warnings',
          description: `Account saved successfully, but please review ${validationResult.warnings.length} warning(s).`,
        });
      }

    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save account',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    
    if (onCancel) {
      onCancel();
    } else {
      reset();
      setValidation({ isValid: true, errors: [], warnings: [] });
      setHasValidated(false);
    }
  };

  const accountTypes: { value: AccountType; label: string; description: string }[] = [
    { value: 'asset', label: 'Asset', description: 'Resources owned by the business' },
    { value: 'liability', label: 'Liability', description: 'Debts and obligations' },
    { value: 'equity', label: 'Equity', description: 'Owner\'s stake in the business' },
    { value: 'revenue', label: 'Revenue', description: 'Income from business operations' },
    { value: 'expense', label: 'Expense', description: 'Costs of doing business' }
  ];

  const currencies: { value: Currency; label: string }[] = [
    { value: 'KES', label: 'Kenyan Shilling (KES)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' }
  ];

  const isLoading = isSubmitting || createAccountMutation.isPending || updateAccountMutation.isPending;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {isEdit ? 'Edit Chart of Account' : 'Create Chart of Account'}
        </CardTitle>
        {hasValidated && (
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Valid
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validation.errors.length} Error(s)
              </Badge>
            )}
            {validation.warnings.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validation.warnings.length} Warning(s)
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Validation Display */}
          {hasValidated && (
            <ErrorDisplay
              validation={validation}
              onRetry={validateForm}
              showDetails={true}
            />
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  {...register('accountNumber', { required: 'Account number is required' })}
                  placeholder="e.g., 1000, 1100-01"
                  className={FinancialValidationService.hasFieldError(validation, 'accountNumber') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="accountNumber" validation={validation} />
                {errors.accountNumber && (
                  <div className="text-sm text-red-600">{errors.accountNumber.message}</div>
                )}
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  {...register('accountName', { required: 'Account name is required' })}
                  placeholder="e.g., Cash in Bank, Accounts Receivable"
                  className={FinancialValidationService.hasFieldError(validation, 'accountName') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="accountName" validation={validation} />
                {errors.accountName && (
                  <div className="text-sm text-red-600">{errors.accountName.message}</div>
                )}
              </div>
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                value={watchedValues.accountType}
                onValueChange={(value) => setValue('accountType', value as AccountType, { shouldDirty: true })}
              >
                <SelectTrigger className={FinancialValidationService.hasFieldError(validation, 'accountType') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError fieldName="accountType" validation={validation} />
            </div>

            {/* Account Subtype */}
            <div className="space-y-2">
              <Label htmlFor="accountSubtype">Account Subtype</Label>
              <Input
                id="accountSubtype"
                {...register('accountSubtype')}
                placeholder="e.g., Current Assets, Fixed Assets"
              />
              <FieldError fieldName="accountSubtype" validation={validation} />
            </div>
          </div>

          <Separator />

          {/* Financial Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={watchedValues.currency}
                  onValueChange={(value) => setValue('currency', value as Currency, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError fieldName="currency" validation={validation} />
              </div>

              {/* Current Balance */}
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  step="0.01"
                  {...register('currentBalance', { 
                    valueAsNumber: true,
                    validate: value => !isNaN(value) || 'Must be a valid number'
                  })}
                  placeholder="0.00"
                  className={FinancialValidationService.hasFieldError(validation, 'currentBalance') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="currentBalance" validation={validation} />
                {errors.currentBalance && (
                  <div className="text-sm text-red-600">{errors.currentBalance.message}</div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Optional description for this account"
                rows={3}
                className="resize-none"
              />
              <FieldError fieldName="description" validation={validation} />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active Account
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive accounts won't appear in transaction forms
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watchedValues.isActive}
                onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
              />
            </div>
          </div>

          <Separator />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || (!hasValidated ? false : !validation.isValid)}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? 'Update Account' : 'Create Account'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => validateForm()}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Validate
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedChartOfAccountsForm;
