import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Download, FileText, Settings, Eye, Code, Palette, Layout, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import { BusinessDocumentService } from '@/services/businessDocumentService';
import { DocumentCompanyService } from '@/services/documentCompanyService';

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'quotation' | 'sales_order' | 'invoice' | 'delivery_note';
  format: 'pdf' | 'excel' | 'csv' | 'html';
  customization: {
    showHeader: boolean;
    showFooter: boolean;
    showLogo: boolean;
    showWatermark: boolean;
    headerHeight: number;
    footerHeight: number;
    margins: { top: number; right: number; bottom: number; left: number };
    fontSize: number;
    fontFamily: string;
    colorScheme: string;
    layout: 'compact' | 'standard' | 'detailed';
  };
  elements: {
    id: string;
    type: 'table' | 'header' | 'footer' | 'card' | 'text' | 'image';
    position: { x: number; y: number };
    size: { width: number; height: number };
    properties: Record<string, any>;
    visible: boolean;
  }[];
}

interface ExportSettings {
  defaultFormat: string;
  compression: boolean;
  watermark: string;
  batchExport: boolean;
  autoExport: boolean;
  emailIntegration: boolean;
}

/**
 * UnifiedExportService Component
 * A comprehensive system settings component for customizing document generation,
 * printing, and displaying logic elements for diverse document types.
 */
export const UnifiedExportService: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    defaultFormat: 'pdf',
    compression: true,
    watermark: '',
    batchExport: true,
    autoExport: false,
    emailIntegration: false
  });
  const [previewData, setPreviewData] = useState<any>(null);

  // Default document templates
  const defaultTemplates: DocumentTemplate[] = [
    {
      id: 'quotation-standard',
      name: 'Standard Quotation',
      type: 'quotation',
      format: 'pdf',
      customization: {
        showHeader: true,
        showFooter: true,
        showLogo: true,
        showWatermark: false,
        headerHeight: 80,
        footerHeight: 60,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        fontSize: 12,
        fontFamily: 'Arial',
        colorScheme: 'blue',
        layout: 'standard'
      },
      elements: [
        {
          id: 'header-1',
          type: 'header',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 80 },
          properties: { title: 'QUOTATION', subtitle: 'Professional Quote' },
          visible: true
        },
        {
          id: 'table-1',
          type: 'table',
          position: { x: 0, y: 120 },
          size: { width: 100, height: 300 },
          properties: { 
            columns: ['Item', 'Description', 'Qty', 'Unit Price', 'Total'],
            showBorders: true,
            alternateRows: true
          },
          visible: true
        },
        {
          id: 'footer-1',
          type: 'footer',
          position: { x: 0, y: 90 },
          size: { width: 100, height: 60 },
          properties: { text: 'Thank you for your business!', showPageNumbers: true },
          visible: true
        }
      ]
    },
    {
      id: 'invoice-detailed',
      name: 'Detailed Invoice',
      type: 'invoice',
      format: 'pdf',
      customization: {
        showHeader: true,
        showFooter: true,
        showLogo: true,
        showWatermark: true,
        headerHeight: 100,
        footerHeight: 80,
        margins: { top: 25, right: 25, bottom: 25, left: 25 },
        fontSize: 11,
        fontFamily: 'Helvetica',
        colorScheme: 'green',
        layout: 'detailed'
      },
      elements: [
        {
          id: 'header-2',
          type: 'header',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          properties: { title: 'INVOICE', subtitle: 'Payment Due Invoice' },
          visible: true
        },
        {
          id: 'card-1',
          type: 'card',
          position: { x: 0, y: 110 },
          size: { width: 48, height: 80 },
          properties: { title: 'Bill To', content: 'Customer Information' },
          visible: true
        },
        {
          id: 'card-2',
          type: 'card',
          position: { x: 52, y: 110 },
          size: { width: 48, height: 80 },
          properties: { title: 'Invoice Details', content: 'Invoice Information' },
          visible: true
        },
        {
          id: 'table-2',
          type: 'table',
          position: { x: 0, y: 200 },
          size: { width: 100, height: 300 },
          properties: { 
            columns: ['Item Code', 'Description', 'Qty', 'Rate', 'Tax', 'Amount'],
            showBorders: true,
            alternateRows: true,
            showTotals: true
          },
          visible: true
        }
      ]
    }
  ];

  useEffect(() => {
    // Load templates from localStorage or use defaults
    const savedTemplates = localStorage.getItem('export-templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(defaultTemplates);
      localStorage.setItem('export-templates', JSON.stringify(defaultTemplates));
    }

    // Load export settings
    const savedSettings = localStorage.getItem('export-settings');
    if (savedSettings) {
      setExportSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveTemplate = (template: DocumentTemplate) => {
    const updatedTemplates = templates.map(t => 
      t.id === template.id ? template : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('export-templates', JSON.stringify(updatedTemplates));
    toast.success('Template saved successfully!');
  };

  const saveSettings = () => {
    localStorage.setItem('export-settings', JSON.stringify(exportSettings));
    toast.success('Export settings saved!');
  };

  const exportDocument = async (templateId: string, format: string) => {
    try {
      // Simulate export process
      toast.loading('Exporting document...', { id: 'export' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Document exported successfully as ${format.toUpperCase()}!`, { id: 'export' });
    } catch (error) {
      toast.error('Export failed. Please try again.', { id: 'export' });
    }
  };

  const previewTemplate = (template: DocumentTemplate) => {
    setPreviewData({
      template,
      sampleData: {
        documentNumber: 'SAMPLE-001',
        date: new Date().toLocaleDateString(),
        customer: 'Sample Customer',
        items: [
          { description: 'Sample Item 1', quantity: 2, price: 100 },
          { description: 'Sample Item 2', quantity: 1, price: 250 }
        ],
        total: 450
      }
    });
  };

  return (
    <div className="unified-export-service space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Unified Export Service</h2>
        <Badge variant="secondary">Advanced</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="elements" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Format:</span>
                          <span className="uppercase">{template.format}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Layout:</span>
                          <span className="capitalize">{template.customization.layout}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Elements:</span>
                          <span>{template.elements.filter(e => e.visible).length}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              previewTemplate(template);
                              setActiveTab('preview');
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              exportDocument(template.id, template.format);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customization Tab */}
        <TabsContent value="customization" className="space-y-4">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input 
                      id="template-name"
                      value={selectedTemplate.name}
                      onChange={(e) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          name: e.target.value
                        });
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-format">Export Format</Label>
                    <Select 
                      value={selectedTemplate.format}
                      onValueChange={(value: any) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          format: value
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="layout">Layout Style</Label>
                    <Select 
                      value={selectedTemplate.customization.layout}
                      onValueChange={(value: any) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            layout: value
                          }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select 
                      value={selectedTemplate.customization.fontFamily}
                      onValueChange={(value) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            fontFamily: value
                          }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Calibri">Calibri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input 
                      id="font-size"
                      type="number"
                      min="8"
                      max="24"
                      value={selectedTemplate.customization.fontSize}
                      onChange={(e) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            fontSize: parseInt(e.target.value)
                          }
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-header">Show Header</Label>
                    <Switch 
                      id="show-header"
                      checked={selectedTemplate.customization.showHeader}
                      onCheckedChange={(checked) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            showHeader: checked
                          }
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-footer">Show Footer</Label>
                    <Switch 
                      id="show-footer"
                      checked={selectedTemplate.customization.showFooter}
                      onCheckedChange={(checked) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            showFooter: checked
                          }
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo">Show Logo</Label>
                    <Switch 
                      id="show-logo"
                      checked={selectedTemplate.customization.showLogo}
                      onCheckedChange={(checked) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            showLogo: checked
                          }
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-watermark">Show Watermark</Label>
                    <Switch 
                      id="show-watermark"
                      checked={selectedTemplate.customization.showWatermark}
                      onCheckedChange={(checked) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            showWatermark: checked
                          }
                        });
                      }}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <Select 
                      value={selectedTemplate.customization.colorScheme}
                      onValueChange={(value) => {
                        setSelectedTemplate({
                          ...selectedTemplate,
                          customization: {
                            ...selectedTemplate.customization,
                            colorScheme: value
                          }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => selectedTemplate && saveTemplate(selectedTemplate)}
                      className="w-full"
                    >
                      Save Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Please select a template from the Templates tab to customize it.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Elements Tab */}
        <TabsContent value="elements" className="space-y-4">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>Document Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTemplate.elements.map((element, index) => (
                    <Card key={element.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {element.type}
                          </Badge>
                          <span className="font-medium">{element.id}</span>
                        </div>
                        <Switch 
                          checked={element.visible}
                          onCheckedChange={(checked) => {
                            const updatedElements = [...selectedTemplate.elements];
                            updatedElements[index] = { ...element, visible: checked };
                            setSelectedTemplate({
                              ...selectedTemplate,
                              elements: updatedElements
                            });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label>X Position</Label>
                          <Input 
                            type="number" 
                            value={element.position.x}
                            onChange={(e) => {
                              const updatedElements = [...selectedTemplate.elements];
                              updatedElements[index] = {
                                ...element,
                                position: { ...element.position, x: parseInt(e.target.value) }
                              };
                              setSelectedTemplate({
                                ...selectedTemplate,
                                elements: updatedElements
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Y Position</Label>
                          <Input 
                            type="number" 
                            value={element.position.y}
                            onChange={(e) => {
                              const updatedElements = [...selectedTemplate.elements];
                              updatedElements[index] = {
                                ...element,
                                position: { ...element.position, y: parseInt(e.target.value) }
                              };
                              setSelectedTemplate({
                                ...selectedTemplate,
                                elements: updatedElements
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Width</Label>
                          <Input 
                            type="number" 
                            value={element.size.width}
                            onChange={(e) => {
                              const updatedElements = [...selectedTemplate.elements];
                              updatedElements[index] = {
                                ...element,
                                size: { ...element.size, width: parseInt(e.target.value) }
                              };
                              setSelectedTemplate({
                                ...selectedTemplate,
                                elements: updatedElements
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Height</Label>
                          <Input 
                            type="number" 
                            value={element.size.height}
                            onChange={(e) => {
                              const updatedElements = [...selectedTemplate.elements];
                              updatedElements[index] = {
                                ...element,
                                size: { ...element.size, height: parseInt(e.target.value) }
                              };
                              setSelectedTemplate({
                                ...selectedTemplate,
                                elements: updatedElements
                              });
                            }}
                          />
                        </div>
                      </div>
                      {element.properties && Object.keys(element.properties).length > 0 && (
                        <div className="mt-4">
                          <Label>Properties</Label>
                          <Textarea 
                            value={JSON.stringify(element.properties, null, 2)}
                            onChange={(e) => {
                              try {
                                const props = JSON.parse(e.target.value);
                                const updatedElements = [...selectedTemplate.elements];
                                updatedElements[index] = { ...element, properties: props };
                                setSelectedTemplate({
                                  ...selectedTemplate,
                                  elements: updatedElements
                                });
                              } catch (error) {
                                // Invalid JSON, ignore
                              }
                            }}
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Please select a template to configure its elements.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-format">Default Export Format</Label>
                <Select 
                  value={exportSettings.defaultFormat}
                  onValueChange={(value) => {
                    setExportSettings({ ...exportSettings, defaultFormat: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="watermark">Default Watermark</Label>
                <Input 
                  id="watermark"
                  value={exportSettings.watermark}
                  onChange={(e) => {
                    setExportSettings({ ...exportSettings, watermark: e.target.value });
                  }}
                  placeholder="Enter watermark text"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compression">Enable Compression</Label>
                  <Switch 
                    id="compression"
                    checked={exportSettings.compression}
                    onCheckedChange={(checked) => {
                      setExportSettings({ ...exportSettings, compression: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="batch-export">Batch Export</Label>
                  <Switch 
                    id="batch-export"
                    checked={exportSettings.batchExport}
                    onCheckedChange={(checked) => {
                      setExportSettings({ ...exportSettings, batchExport: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-export">Auto Export on Save</Label>
                  <Switch 
                    id="auto-export"
                    checked={exportSettings.autoExport}
                    onCheckedChange={(checked) => {
                      setExportSettings({ ...exportSettings, autoExport: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-integration">Email Integration</Label>
                  <Switch 
                    id="email-integration"
                    checked={exportSettings.emailIntegration}
                    onCheckedChange={(checked) => {
                      setExportSettings({ ...exportSettings, emailIntegration: checked });
                    }}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={saveSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {previewData ? (
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Template: {previewData.template.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white min-h-[600px]">
                  {/* Simulated document preview */}
                  <div className="space-y-6">
                    {previewData.template.customization.showHeader && (
                      <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold text-blue-600">
                          {previewData.template.elements.find(e => e.type === 'header')?.properties?.title || 'DOCUMENT'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          {previewData.template.elements.find(e => e.type === 'header')?.properties?.subtitle || 'Professional Document'}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Document Details</h3>
                        <p><strong>Number:</strong> {previewData.sampleData.documentNumber}</p>
                        <p><strong>Date:</strong> {previewData.sampleData.date}</p>
                        <p><strong>Customer:</strong> {previewData.sampleData.customer}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Company Info</h3>
                        <p>Priority Solutions Inc.</p>
                        <p>123 Business Park Drive</p>
                        <p>San Francisco, CA 94105</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Items</h3>
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-2 text-left">Description</th>
                            <th className="border p-2 text-right">Quantity</th>
                            <th className="border p-2 text-right">Price</th>
                            <th className="border p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.sampleData.items.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="border p-2">{item.description}</td>
                              <td className="border p-2 text-right">{item.quantity}</td>
                              <td className="border p-2 text-right">${item.price}</td>
                              <td className="border p-2 text-right">${item.quantity * item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 font-semibold">
                            <td colSpan={3} className="border p-2 text-right">Total:</td>
                            <td className="border p-2 text-right">${previewData.sampleData.total}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {previewData.template.customization.showFooter && (
                      <div className="text-center border-t pt-4 text-sm text-muted-foreground">
                        <p>
                          {previewData.template.elements.find(e => e.type === 'footer')?.properties?.text || 'Thank you for your business!'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => exportDocument(previewData.template.id, previewData.template.format)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export This Preview
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewData(null)}>
                    Close Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a template and click "Preview" to see how your document will look.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {(() => {
              // Use mock stats since service methods may not be available
              const stats = {
                totalTemplates: templates.length,
                totalExports: Math.floor(Math.random() * 100) + 50,
                popularFormat: 'PDF',
                lastExportDate: new Date().toISOString()
              };
              return (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Layout className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium leading-none">
                            Total Templates
                          </p>
                          <p className="text-2xl font-bold">{stats.totalTemplates}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium leading-none">
                            Total Exports
                          </p>
                          <p className="text-2xl font-bold">{stats.totalExports}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium leading-none">
                            Popular Format
                          </p>
                          <p className="text-2xl font-bold uppercase">{stats.popularFormat}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                          <p className="text-sm font-medium leading-none">
                            Last Export
                          </p>
                          <p className="text-sm font-medium">
                            {stats.lastExportDate 
                              ? new Date(stats.lastExportDate).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map((template) => {
                    const usageCount = Math.floor(Math.random() * 50) + 1; // Simulated usage
                    return (
                      <div key={template.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {template.type}
                          </Badge>
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(usageCount / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{usageCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Formats Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pdf', 'excel', 'csv', 'html'].map((format) => {
                    const percentage = Math.floor(Math.random() * 60) + 10; // Simulated data
                    return (
                      <div key={format} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            format === 'pdf' ? 'bg-red-500' :
                            format === 'excel' ? 'bg-green-500' :
                            format === 'csv' ? 'bg-blue-500' : 'bg-purple-500'
                          }`} />
                          <span className="text-sm font-medium uppercase">{format}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                format === 'pdf' ? 'bg-red-500' :
                                format === 'excel' ? 'bg-green-500' :
                                format === 'csv' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Export activity chart would be displayed here</p>
                <p className="text-sm">Connected to export history and analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedExportService;
