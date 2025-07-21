import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Type, 
  Layout, 
  Ruler, 
  Save, 
  RotateCcw, 
  Eye, 
  Settings as SettingsIcon,
  Brush,
  AlignLeft,
  FileText,
  Smartphone
} from 'lucide-react';
import { DocumentCustomizationService } from '@/services/documentCustomizationService';
import { DocumentCustomizationSettings, DocumentType, CustomizationContext } from '@/types/documentCustomization';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DocumentCustomizationSettingsProps {
  onSave?: (settings: DocumentCustomizationSettings) => void;
  onReset?: () => void;
}

const DocumentCustomizationSettings: React.FC<DocumentCustomizationSettingsProps> = ({
  onSave,
  onReset
}) => {
  const [settings, setSettings] = useState<DocumentCustomizationSettings | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('invoice');
  const [presetName, setPresetName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Initialize with default settings
  useEffect(() => {
    loadDefaultSettings();
  }, []);

  const loadDefaultSettings = () => {
    try {
      const customizationService = DocumentCustomizationService.getInstance();
      const defaultSettings = customizationService.getDefaultCustomizationSettings(selectedDocumentType);
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error loading default settings:', error);
      // Provide fallback settings in case of error
      const fallbackSettings = {
        id: 'fallback-settings',
        name: 'Default Settings',
        documentType: selectedDocumentType,
        colors: {
          primary: '#2b6cb0',
          secondary: '#4a5568',
          accent: '#2b6cb0',
          background: '#ffffff',
          border: '#e2e8f0',
          text: '#2d3748'
        },
        typography: {
          bodyFont: 'Trebuchet MS',
          documentTitleFont: 'Tahoma',
          headingFont: 'Tahoma',
          bodyFontSize: 12,
          documentTitleSize: 19,
          headingSize: 14,
          lineHeight: 1.4
        },
        layout: {
          pageFormat: 'A4',
          orientation: 'portrait',
          headerPosition: 'top',
          margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        responsive: {
          enableMobileOptimizations: true,
          scaleFontsForMobile: true,
          compactMobileLayout: false
        }
      };
      setSettings(fallbackSettings as any);
    }
  };

  const handleSettingsUpdate = (updates: Partial<DocumentCustomizationSettings>) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      ...updates
    };
    
    setSettings(updatedSettings);
  };

  const handleColorUpdate = (colorKey: string, value: string) => {
    if (!settings) return;
    
    handleSettingsUpdate({
      colors: {
        ...settings.colors,
        [colorKey]: value
      }
    });
  };

  const handleTypographyUpdate = (typographyKey: string, value: any) => {
    if (!settings) return;
    
    handleSettingsUpdate({
      typography: {
        ...settings.typography,
        [typographyKey]: value
      }
    });
  };

  const handleLayoutUpdate = (layoutKey: string, value: any) => {
    if (!settings) return;
    
    handleSettingsUpdate({
      layout: {
        ...settings.layout,
        [layoutKey]: value
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaveStatus('saving');
      
      if (presetName.trim()) {
        // Save as preset
        const customizationService = DocumentCustomizationService.getInstance();
        const presetId = customizationService.createPreset(
          presetName.trim(),
          settings,
          [selectedDocumentType]
        );
        console.log('Preset saved with ID:', presetId);
      }
      
      if (onSave) {
        onSave(settings);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
  };

  const handleReset = () => {
    loadDefaultSettings();
    setPresetName('');
    setSaveStatus('idle');
    
    if (onReset) {
      onReset();
    }
  };

  const handlePreview = async () => {
    if (!settings) return;
    
    try {
      // Create sample document data that matches your EnerTek Solar format
      const sampleDocumentData = {
        documentNumber: selectedDocumentType === 'quote' ? 'QT-2025-2032' : `${selectedDocumentType.toUpperCase().replace('-', '')}-2025-001`,
        date: '18/07/2025',
        dueDate: selectedDocumentType === 'quote' ? null : '17/08/2025',
        validUntil: selectedDocumentType === 'quote' ? '25/07/2025' : null,
        status: 'DRAFT',
        currency: 'KES',
        customer: {
          name: 'Geoffry',
          address: '',
          email: '',
          phone: ''
        },
        items: [
          {
            id: 1,
            partNumber: 'EN002',
            description: 'Solar Panel Installation',
            quantity: 1.0,
            unitPrice: 102020.00,
            total: 118343.20,
            taxRate: 16
          }
        ],
        subtotal: 102020.00,
        taxAmount: 16323.20,
        total: 118343.20,
        notes: '',
        terms: 'Payment Terms: Net 30 Days\nDelivery: As specified\nWarranty: As per manufacturer terms'
      };
      
      // Generate preview HTML using the UnifiedDocumentExportService with proper mapping
      const documentTypeMapping: { [key: string]: any } = {
        'invoice': 'invoice',
        'quote': 'quote',
        'sales-order': 'sales-order',
        'purchase-order': 'purchase-order',
        'delivery-note': 'delivery-note',
        'payment-receipt': 'payment-receipt',
        'financial-report': 'financial-report'
      };
      
      const mappedDocumentType = documentTypeMapping[selectedDocumentType] || selectedDocumentType;
      
      console.log('Generating preview for:', mappedDocumentType, 'with settings:', settings);
      
      // Use the static method directly with proper parameters
      const previewHTMLContent = await UnifiedDocumentExportService.generatePreviewHTML(
        sampleDocumentData as any,
        mappedDocumentType,
        {
          format: 'view',
          colorMode: 'color',
          includeLogo: true,
          includeSignature: false,
          logoDisplayMode: 'logo-with-name',
          useCustomization: true
        }
      );
      
      // Apply enhanced customization styles to the generated HTML
      const styledHTML = `
        <style>
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: ${settings.typography.bodyFont}, sans-serif !important;
            font-size: ${settings.typography.bodyFontSize}px !important;
            color: ${settings.colors.text} !important;
            background: ${settings.colors.background} !important;
            line-height: ${settings.typography.lineHeight} !important;
            margin: 0;
            padding: 20px;
          }
          
          .document-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 30px;
          }
          
          .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${settings.colors.border} !important;
          }
          
          .company-info {
            flex: 1;
            padding-right: 20px;
          }
          
          .company-name, .document-title, h1 {
            color: ${settings.colors.primary} !important;
            font-size: ${settings.typography.documentTitleSize}px !important;
            font-family: ${settings.typography.documentTitleFont}, sans-serif !important;
            font-weight: bold !important;
            margin: 0 0 10px 0 !important;
          }
          
          .company-details {
            font-size: ${Math.max(settings.typography.bodyFontSize - 1, 10)}px;
            line-height: 1.4;
            color: ${settings.colors.text};
          }
          
          .document-info {
            text-align: right;
            min-width: 200px;
          }
          
          .document-meta {
            font-size: ${Math.max(settings.typography.bodyFontSize - 1, 10)}px;
            line-height: 1.6;
          }
          
          .document-meta div {
            margin-bottom: 2px;
          }
          
          .party-info-section, .customer-info {
            background: ${settings.colors.surface || '#f7fafc'} !important;
            border: 1px solid ${settings.colors.border} !important;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          
          .section-header, .customer-info h3 {
            color: ${settings.colors.primary};
            font-size: ${settings.typography.headingSize}px;
            font-weight: 600;
            margin: 0 0 10px 0;
            border-bottom: 1px solid ${settings.colors.border};
            padding-bottom: 5px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .items-table th {
            background: ${settings.colors.primary} !important;
            color: white !important;
            padding: 12px 8px;
            text-align: left;
            font-size: ${Math.max(settings.typography.bodyFontSize - 1, 10)}px;
            font-weight: 600;
            border: none;
          }
          
          .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid ${settings.colors.border};
            font-size: ${Math.max(settings.typography.bodyFontSize - 1, 10)}px;
          }
          
          .items-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .items-table tbody tr:hover {
            background-color: #f1f5f9;
          }
          
          .totals-section {
            margin: 25px 0;
            text-align: right;
            font-size: ${settings.typography.bodyFontSize}px;
          }
          
          .totals-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 15px;
            margin: 2px 0;
            min-width: 300px;
            margin-left: auto;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .totals-row:last-child {
            border-bottom: none;
          }
          
          .totals-row.subtotal {
            border-bottom: 1px solid ${settings.colors.border};
          }
          
          .totals-row.tax {
            border-bottom: 1px solid ${settings.colors.border};
          }
          
          .totals-row.total {
            background: ${settings.colors.primary} !important;
            color: white !important;
            font-weight: bold;
            border-radius: 4px;
            margin-top: 8px;
            font-size: ${Math.max(settings.typography.bodyFontSize + 1, 13)}px;
          }
          
          .totals-label {
            font-weight: 500;
          }
          
          .totals-amount {
            font-weight: 600;
            min-width: 120px;
            text-align: right;
          }
          
          .payment-terms, .bank-transfer, .mpesa-payment {
            margin: 20px 0;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid ${settings.colors.primary};
          }
          
          .payment-terms {
            background: #fef7f0;
            border-left-color: #f59e0b;
          }
          
          .bank-transfer {
            background: #f0f9ff;
            border-left-color: #3b82f6;
          }
          
          .mpesa-payment {
            background: #f0fdf4;
            border-left-color: #10b981;
          }
          
          .payment-terms h4, .bank-transfer h4, .mpesa-payment h4 {
            margin: 0 0 8px 0;
            font-size: ${settings.typography.headingSize}px;
            font-weight: 600;
          }
          
          .terms-section {
            margin-top: 30px;
            padding: 20px;
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 6px;
          }
          
          .terms-section h4 {
            color: #92400e;
            margin: 0 0 10px 0;
            font-size: ${settings.typography.headingSize}px;
          }
          
          .document-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid ${settings.colors.border};
            color: #6b7280;
            font-size: ${Math.max(settings.typography.bodyFontSize - 2, 9)}px;
          }
          
          .signature-section {
            margin: 40px 0;
            display: flex;
            justify-content: space-between;
            align-items: end;
            max-width: 600px;
          }
          
          .signature-box {
            text-align: center;
            min-width: 200px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid ${settings.colors.border};
          }
          
          .signature-line {
            border-bottom: 2px solid #333;
            margin-bottom: 8px;
            height: 50px;
            display: flex;
            align-items: end;
            justify-content: center;
          }
          
          /* Print optimizations */
          @media print {
            body {
              padding: 0;
            }
            .document-container {
              box-shadow: none;
              padding: 20px;
            }
          }
          
          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .header-section {
              flex-direction: column;
              gap: 15px;
            }
            .document-info {
              text-align: left;
            }
            .items-table {
              font-size: ${Math.max(settings.typography.bodyFontSize - 2, 9)}px;
            }
            .items-table th, .items-table td {
              padding: 6px 4px;
            }
          }
        </style>
        ${previewHTMLContent}
      `;
      
      setPreviewHTML(styledHTML);
      setIsPreviewOpen(true);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      
      // Enhanced fallback preview that looks more like a real document
      const fallbackPreview = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: ${settings.typography.bodyFont}, sans-serif;
              font-size: ${settings.typography.bodyFontSize}px;
              color: ${settings.colors.text};
              background: ${settings.colors.background};
              margin: 0;
              padding: 20px;
              line-height: ${settings.typography.lineHeight};
            }
            .document-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 20px;
            }
            .header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid ${settings.colors.border};
            }
            .document-title {
              color: ${settings.colors.primary};
              font-size: ${settings.typography.documentTitleSize}px;
              font-family: ${settings.typography.documentTitleFont}, sans-serif;
              font-weight: bold;
              margin: 0;
            }
            .customer-info {
              background: ${settings.colors.surface || '#f7fafc'};
              padding: 15px;
              border-radius: 8px;
              border: 1px solid ${settings.colors.border};
              margin: 20px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              background: ${settings.colors.primary};
              color: white;
              padding: 10px;
              text-align: left;
              font-size: ${settings.typography.bodyFontSize - 1}px;
            }
            .items-table td {
              padding: 10px;
              border-bottom: 1px solid ${settings.colors.border};
              font-size: ${settings.typography.bodyFontSize - 1}px;
            }
            .totals-section {
              margin: 20px 0;
              text-align: right;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 15px;
              margin: 2px 0;
              min-width: 300px;
              margin-left: auto;
              border-bottom: 1px solid #e2e8f0;
            }
            .totals-row:last-child {
              border-bottom: none;
            }
            .totals-row.total {
              background: ${settings.colors.primary};
              color: white;
              font-weight: bold;
              border-radius: 4px;
              margin-top: 8px;
            }
            .totals-label {
              font-weight: 500;
            }
            .totals-amount {
              font-weight: 600;
              min-width: 120px;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="header-section">
              <div class="company-info">
                <h1 class="document-title">${selectedDocumentType === 'quote' ? 'QUOTATION' : selectedDocumentType.toUpperCase()}</h1>
                <div>EnerTek Solar Services</div>
                <div>Jowin Business Arcade off eastern bypass Nairobi, Utawala, 00100</div>
                <div>Tel: +254746275531</div>
                <div>Email: info@enerteksolarservices.com</div>
                <div>VAT Number: P052216152Z</div>
              </div>
              <div class="document-info">
                <div><strong>${selectedDocumentType === 'quote' ? 'Quote #:' : 'Invoice #:'}</strong> ${selectedDocumentType === 'quote' ? 'QT-2025-2032' : 'INV-2025-001'}</div>
                <div><strong>${selectedDocumentType === 'quote' ? 'Quote Date:' : 'Date:'}</strong> 18/07/2025</div>
                <div><strong>Status:</strong> DRAFT</div>
                <div><strong>Currency:</strong> KES</div>
                <div><strong>Print Date:</strong> 18/07/2025</div>
              </div>
            </div>
            
            <div class="customer-info">
              <h3>Customer Information</h3>
              <div>Geoffry</div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>LN</th>
                  <th>PART DESCRIPTION</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>TOTAL PRICE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>EN002</td>
                  <td>1.00 ea</td>
                  <td>KSh 102,020.00</td>
                  <td>KSh 118,343.20</td>
                </tr>
              </tbody>
            </table>
            
            <div class="totals-section">
              <div class="totals-row subtotal">
                <span class="totals-label">Subtotal</span>
                <span class="totals-amount">KSh 102,020.00</span>
              </div>
              <div class="totals-row tax">
                <span class="totals-label">VAT (16%)</span>
                <span class="totals-amount">KSh 16,323.20</span>
              </div>
              <div class="totals-row total">
                <span class="totals-label">TOTAL (KES)</span>
                <span class="totals-amount">KSh 118,343.20</span>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding: 15px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px;">
              <h4>Terms & Conditions:</h4>
              <div>Payment Terms: Net 30 Days</div>
              <div>Delivery: As specified</div>
              <div>Warranty: As per manufacturer terms</div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 10px;">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>This is a computer-generated document and does not require a signature unless specified.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      setPreviewHTML(fallbackPreview);
      setIsPreviewOpen(true);
    }
  };

  const getSaveStatusBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return <Badge variant="outline">Saving...</Badge>;
      case 'saved':
        return <Badge variant="secondary">Saved</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p>Loading customization settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brush className="h-6 w-6" />
          <h1 className="text-xl sm:text-2xl font-bold">Document Customization</h1>
        </div>
        <div className="flex items-center gap-2">
          {getSaveStatusBadge()}
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset to Defaults</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Settings</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Document Type & Preset Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Type & Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={selectedDocumentType} onValueChange={(value) => setSelectedDocumentType(value as DocumentType)}>
                <SelectTrigger id="documentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="sales-order">Sales Order</SelectItem>
                  <SelectItem value="purchase-order">Purchase Order</SelectItem>
                  <SelectItem value="delivery-note">Delivery Note</SelectItem>
                  <SelectItem value="payment-receipt">Payment Receipt</SelectItem>
                  <SelectItem value="financial-report">Financial Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="presetName">Save as Preset (Optional)</Label>
              <Input
                id="presetName"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. Corporate Blue Theme"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Customization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative overflow-hidden">
          <TabsList className="inline-flex w-auto min-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide gap-1 p-1">
            <TabsTrigger value="colors" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Typography</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="responsive" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Responsive</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.colors.primary}
                      onChange={(e) => handleColorUpdate('primary', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={settings.colors.primary}
                      onChange={(e) => handleColorUpdate('primary', e.target.value)}
                      placeholder="#2b6cb0"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={settings.colors.text}
                      onChange={(e) => handleColorUpdate('text', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={settings.colors.text}
                      onChange={(e) => handleColorUpdate('text', e.target.value)}
                      placeholder="#2d3748"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={settings.colors.background}
                      onChange={(e) => handleColorUpdate('background', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={settings.colors.background}
                      onChange={(e) => handleColorUpdate('background', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={settings.colors.border}
                      onChange={(e) => handleColorUpdate('border', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={settings.colors.border}
                      onChange={(e) => handleColorUpdate('border', e.target.value)}
                      placeholder="#e2e8f0"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.colors.accent}
                      onChange={(e) => handleColorUpdate('accent', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={settings.colors.accent}
                      onChange={(e) => handleColorUpdate('accent', e.target.value)}
                      placeholder="#4a5568"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <Select 
                    value={settings.typography.bodyFont} 
                    onValueChange={(value) => handleTypographyUpdate('bodyFont', value)}
                  >
                    <SelectTrigger id="bodyFont">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="documentTitleFont">Document Title Font</Label>
                  <Select 
                    value={settings.typography.documentTitleFont} 
                    onValueChange={(value) => handleTypographyUpdate('documentTitleFont', value)}
                  >
                    <SelectTrigger id="documentTitleFont">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tahoma">Tahoma</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bodyFontSize">Body Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bodyFontSize"
                      type="number"
                      min="8"
                      max="24"
                      value={settings.typography.bodyFontSize}
                      onChange={(e) => handleTypographyUpdate('bodyFontSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="documentTitleSize">Title Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="documentTitleSize"
                      type="number"
                      min="14"
                      max="36"
                      value={settings.typography.documentTitleSize}
                      onChange={(e) => handleTypographyUpdate('documentTitleSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="headingSize">Heading Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="headingSize"
                      type="number"
                      min="10"
                      max="28"
                      value={settings.typography.headingSize}
                      onChange={(e) => handleTypographyUpdate('headingSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="lineHeight">Line Height</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lineHeight"
                    type="number"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={settings.typography.lineHeight}
                    onChange={(e) => handleTypographyUpdate('lineHeight', parseFloat(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">em</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout & Spacing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageFormat">Page Format</Label>
                  <Select 
                    value={settings.layout.pageFormat} 
                    onValueChange={(value) => handleLayoutUpdate('pageFormat', value)}
                  >
                    <SelectTrigger id="pageFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="headerPosition">Header Position</Label>
                  <Select 
                    value={settings.layout.headerPosition} 
                    onValueChange={(value) => handleLayoutUpdate('headerPosition', value)}
                  >
                    <SelectTrigger id="headerPosition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Margins & Spacing</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="marginTop">Top Margin</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="marginTop"
                        type="number"
                        min="5"
                        max="50"
                        value={settings.layout.margins.top}
                        onChange={(e) => handleLayoutUpdate('margins', { 
                          ...settings.layout.margins, 
                          top: parseInt(e.target.value) 
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">mm</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="marginRight">Right Margin</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="marginRight"
                        type="number"
                        min="5"
                        max="50"
                        value={settings.layout.margins.right}
                        onChange={(e) => handleLayoutUpdate('margins', { 
                          ...settings.layout.margins, 
                          right: parseInt(e.target.value) 
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">mm</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="marginBottom">Bottom Margin</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="marginBottom"
                        type="number"
                        min="5"
                        max="50"
                        value={settings.layout.margins.bottom}
                        onChange={(e) => handleLayoutUpdate('margins', { 
                          ...settings.layout.margins, 
                          bottom: parseInt(e.target.value) 
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">mm</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="marginLeft">Left Margin</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="marginLeft"
                        type="number"
                        min="5"
                        max="50"
                        value={settings.layout.margins.left}
                        onChange={(e) => handleLayoutUpdate('margins', { 
                          ...settings.layout.margins, 
                          left: parseInt(e.target.value) 
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsive Tab */}
        <TabsContent value="responsive" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Responsive Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableMobileOptimizations"
                    checked={settings.responsive.enableMobileOptimizations}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate({
                        responsive: { ...settings.responsive, enableMobileOptimizations: checked }
                      })
                    }
                  />
                  <Label htmlFor="enableMobileOptimizations">Enable Mobile Optimizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="scaleFontsForMobile"
                    checked={settings.responsive.scaleFontsForMobile}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate({
                        responsive: { ...settings.responsive, scaleFontsForMobile: checked }
                      })
                    }
                  />
                  <Label htmlFor="scaleFontsForMobile">Scale Fonts for Mobile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compactMobileLayout"
                    checked={settings.responsive.compactMobileLayout}
                    onCheckedChange={(checked) => 
                      handleSettingsUpdate({
                        responsive: { ...settings.responsive, compactMobileLayout: checked }
                      })
                    }
                  />
                  <Label htmlFor="compactMobileLayout">Use Compact Mobile Layout</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Document Preview - {selectedDocumentType.charAt(0).toUpperCase() + selectedDocumentType.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md p-4 bg-white">
            {previewHTML ? (
              <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No preview available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentCustomizationSettings;
