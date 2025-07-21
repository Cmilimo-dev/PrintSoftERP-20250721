import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Settings, 
  Download, 
  Upload, 
  Archive, 
  Workflow, 
  Palette, 
  QrCode,
  PenTool,
  DollarSign,
  BarChart3,
  Smartphone,
  Printer,
  FileSpreadsheet,
  FileImage,
  FileX,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Save,
  Eye,
  Copy,
  Share2,
  Play,
  Pause,
  Square,
  Package,
  Zap,
  Layout,
  Layers,
  Activity,
  Info
} from 'lucide-react';

// Import the services
import { DocumentStorageService } from '@/services/documentStorageService';
import { DocumentWorkflowService } from '@/services/documentWorkflowService';
import { DocumentCompanyService } from '@/services/documentCompanyService';
import { EnhancedExportService } from '@/services/enhancedExportService';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import { 
  DocumentSettingsIntegrationService, 
  DocumentServiceSettings as ServiceSettings, 
  BatchExportJob, 
  ExportProgress 
} from '@/services/documentSettingsIntegrationService';
import { 
  comprehensiveDocumentEngine, 
  DocumentData, 
  DocumentTemplate, 
  GenerationOptions, 
  DocumentGenerationResult 
} from '@/services/comprehensiveDocumentEngine';
import { BaseDocument } from '@/types/businessDocuments';
import { AdvancedTemplateDesigner } from './AdvancedTemplateDesigner';
import { toast } from 'sonner';

interface DocumentServiceSettingsProps {
  onSave?: (settings: any) => void;
  onReset?: () => void;
}

const DocumentServiceSettings: React.FC<DocumentServiceSettingsProps> = ({ onSave, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('storage');
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    storageUsed: '0 MB',
    templatesActive: 0,
    exportFormats: 6,
    lastBackup: 'Never'
  });

  // Enhanced settings with real-time integration
  const [settings, setSettings] = useState<ServiceSettings>(() => {
    try {
      const loadedSettings = DocumentSettingsIntegrationService.loadSettings();
      return loadedSettings;
    } catch (error) {
      console.error('Failed to load document settings, using defaults:', error);
      return {
        templateEngine: {
          templateStyle: 'professional',
          fontFamily: 'Inter',
          baseFontSize: '14px',
          responsiveDesign: true,
          mobileOptimization: true,
          printOptimization: true,
        },
        layoutEngine: {
          pageFormat: 'A4',
          printMargins: '20mm',
          responsiveBreakpoints: 'standard',
          pageBreakManagement: true,
          flexibleGridSystem: true,
          adaptiveTypography: true,
        },
        exportEngine: {
          defaultFormat: 'PDF',
          colorMode: 'full',
          compressionLevel: 'medium',
          embedFonts: true,
          vectorOutput: true,
          multiPageSupport: true,
          emailCompatible: true,
        },
        advancedFeatures: {
          qrCodeIntegration: true,
          digitalSignatures: true,
          watermarkSupport: false,
          analyticsTracking: true,
        },
        batchProcessing: {
          enabled: true,
          maxConcurrentExports: 3,
          autoRetry: true,
          retryAttempts: 2,
          progressTracking: true,
        },
      };
    }
  });
  
  // Legacy settings mapping for backward compatibility
  const [legacySettings, setLegacySettings] = useState({
    storage: {
      autoBackup: true,
      retentionDays: 90,
      compressionEnabled: true,
      cloudSync: false
    },
    workflow: {
      autoTransitions: true,
      statusTracking: true,
      notificationsEnabled: true,
      approvalRequired: false
    },
    export: {
      defaultFormat: 'PDF',
      includeQRCode: true,
      watermark: false,
      colorMode: 'full',
      compression: 'medium'
    },
    branding: {
      logoPosition: 'top-left',
      showCompanyName: true,
      customColors: true,
      brandingEnabled: true
    },
    templates: {
      customTemplates: 5,
      defaultStyling: true,
      responsiveDesign: true
    }
  });

  // Advanced template designer state
  const [showTemplateDesigner, setShowTemplateDesigner] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<DocumentTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<DocumentTemplate[]>([]);
  
  // Batch processing state
  const [batchJobs, setBatchJobs] = useState<BatchExportJob[]>([]);
  const [activeBatchJob, setActiveBatchJob] = useState<BatchExportJob | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ [key: string]: ExportProgress[] }>({});
  const [showBatchModal, setShowBatchModal] = useState(false);
  
  // Preview state
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentData | null>(null);
  
  // Document generation state
  const [generatedDocuments, setGeneratedDocuments] = useState<DocumentGenerationResult[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'invoice' | 'quote' | 'salesOrder' | 'deliveryNote' | 'paymentReceipt' | 'purchaseOrder' | 'goodsReceiving' | 'proformaInvoice' | 'creditNote' | 'debitNote' | 'workOrder' | 'stockTransfer' | 'inventoryAdjustment' | 'returnNote' | 'serviceOrder' | 'maintenanceOrder' | 'billOfLading' | 'packingList' | 'timesheet' | 'expenseReport' | 'budgetReport' | 'statement' | 'reminder' | 'contractAgreement'>('invoice');
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'pdf' | 'excel' | 'word' | 'print'>('html');
  
  // Export statistics
  const [exportStats, setExportStats] = useState({
    totalExports: 0,
    successfulExports: 0,
    failedExports: 0,
    averageExportTime: 0,
    popularFormats: [] as { format: string; count: number }[],
    recentJobs: [] as BatchExportJob[]
  });

  useEffect(() => {
    loadDocumentStats();
    loadBatchJobs();
    loadExportStats();
    loadTemplates();
    initializePreviewDocument();
    
    // Set up progress listener with safety check
    const listenerId = 'document-service-settings';
    if (DocumentSettingsIntegrationService.addProgressListener) {
      DocumentSettingsIntegrationService.addProgressListener(listenerId, handleProgressUpdate);
    }
    
    return () => {
      if (DocumentSettingsIntegrationService.removeProgressListener) {
        DocumentSettingsIntegrationService.removeProgressListener(listenerId);
      }
    };
  }, []);
  
  // Update preview document when document type changes
  useEffect(() => {
    if (previewDocument) {
      const updatedDocument = {
        ...previewDocument,
        type: selectedDocumentType,
        number: `${selectedDocumentType.toUpperCase()}-2025-001`
      };
      setPreviewDocument(updatedDocument);
    }
  }, [selectedDocumentType]);

  const loadDocumentStats = async () => {
    try {
      setLoading(true);
      // Load stats from services with fallback values
      let allDocuments = [];
      let exportStats = { lastBackup: 'Never' };
      
      try {
        allDocuments = await DocumentStorageService.getAllDocuments();
      } catch (error) {
        console.warn('Failed to load documents:', error);
        allDocuments = [];
      }
      
      try {
        exportStats = await EnhancedExportService.getExportStats();
      } catch (error) {
        console.warn('Failed to load export stats:', error);
        exportStats = { lastBackup: 'Never' };
      }
      
      setDocumentStats({
        totalDocuments: allDocuments.length,
        storageUsed: `${(allDocuments.length * 0.1).toFixed(1)} MB`,
        templatesActive: 5,
        exportFormats: 6,
        lastBackup: exportStats.lastBackup || 'Never'
      });
    } catch (error) {
      console.error('Failed to load document stats:', error);
      // Set default stats if everything fails
      setDocumentStats({
        totalDocuments: 0,
        storageUsed: '0 MB',
        templatesActive: 0,
        exportFormats: 6,
        lastBackup: 'Never'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBatchJobs = () => {
    try {
      if (DocumentSettingsIntegrationService.getAllBatchExportJobs) {
        const jobs = DocumentSettingsIntegrationService.getAllBatchExportJobs();
        setBatchJobs(jobs || []);
      } else {
        setBatchJobs([]);
      }
    } catch (error) {
      console.error('Failed to load batch jobs:', error);
      setBatchJobs([]);
    }
  };

  const loadExportStats = () => {
    try {
      if (DocumentSettingsIntegrationService.getExportStatistics) {
        const stats = DocumentSettingsIntegrationService.getExportStatistics();
        setExportStats(stats || {
          totalExports: 0,
          successfulExports: 0,
          failedExports: 0,
          averageExportTime: 0,
          popularFormats: [],
          recentJobs: []
        });
      } else {
        setExportStats({
          totalExports: 0,
          successfulExports: 0,
          failedExports: 0,
          averageExportTime: 0,
          popularFormats: [],
          recentJobs: []
        });
      }
    } catch (error) {
      console.error('Failed to load export stats:', error);
      setExportStats({
        totalExports: 0,
        successfulExports: 0,
        failedExports: 0,
        averageExportTime: 0,
        popularFormats: [],
        recentJobs: []
      });
    }
  };

  const handleProgressUpdate = (progress: ExportProgress) => {
    setBatchProgress(prev => ({
      ...prev,
      [progress.id]: [...(prev[progress.id] || []), progress]
    }));
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    try {
      // Handle legacy settings for UI compatibility
      if (['storage', 'workflow', 'export', 'branding', 'templates'].includes(category)) {
        const updatedLegacySettings = {
          ...legacySettings,
          [category]: {
            ...legacySettings[category],
            [key]: value
          }
        };
        setLegacySettings(updatedLegacySettings);
        
        // Map to actual service settings
        const mappedCategory = mapLegacyToServiceCategory(category);
        if (mappedCategory && DocumentSettingsIntegrationService.updateEngineSettings) {
          DocumentSettingsIntegrationService.updateEngineSettings(mappedCategory, { [key]: value });
        }
      } else {
        // Direct service setting update
        if (DocumentSettingsIntegrationService.updateEngineSettings) {
          DocumentSettingsIntegrationService.updateEngineSettings(category as keyof ServiceSettings, { [key]: value });
        }
      }
      
      // Show feedback
      toast.success(`${category} setting updated`);
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast.error('Failed to update setting');
    }
  };
  
  const mapLegacyToServiceCategory = (legacyCategory: string): keyof ServiceSettings | null => {
    const mapping = {
      'storage': 'batchProcessing',
      'workflow': 'batchProcessing', 
      'export': 'exportEngine',
      'branding': 'advancedFeatures',
      'templates': 'templateEngine'
    };
    return mapping[legacyCategory] as keyof ServiceSettings || null;
  };

  const generatePreview = async () => {
    try {
      setLoading(true);
      const html = await DocumentSettingsIntegrationService.generatePreviewWithSettings(
        'sample-document',
        'invoice',
        settings
      );
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to generate preview');
      console.error('Preview error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBatchJob = async (documentIds: string[], documentTypes: string[]) => {
    try {
      const job = DocumentSettingsIntegrationService.createBatchExportJob(
        `Batch Export ${new Date().toLocaleDateString()}`,
        documentIds,
        documentTypes,
        settings
      );
      
      setBatchJobs(prev => [...prev, job]);
      setActiveBatchJob(job);
      
      // Execute the job
      await DocumentSettingsIntegrationService.executeBatchExportJob(job.id);
      
      loadBatchJobs();
      loadExportStats();
      toast.success('Batch export completed');
    } catch (error) {
      toast.error('Batch export failed');
      console.error('Batch export error:', error);
    }
  };

  const cancelBatchJob = (jobId: string) => {
    DocumentSettingsIntegrationService.cancelBatchExportJob(jobId);
    loadBatchJobs();
    toast.success('Batch job cancelled');
  };

  const openTemplateDesigner = () => {
    setShowTemplateDesigner(true);
  };

  const closeTemplateDesigner = () => {
    setShowTemplateDesigner(false);
    setCurrentTemplate(null);
  };

  const loadTemplates = () => {
    try {
      const templates = comprehensiveDocumentEngine.getAllTemplates();
      setAvailableTemplates(templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setAvailableTemplates([]);
    }
  };

  const initializePreviewDocument = () => {
    // Create sample document for preview
    const sampleDocument: DocumentData = {
      id: 'SAMPLE-001',
      type: selectedDocumentType,
      number: `${selectedDocumentType.toUpperCase()}-2025-001`,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      currency: 'KSh',
      company: {
        name: DocumentCompanyService.getCompanyInfoForDocuments().companyName,
        address: DocumentCompanyService.getCompanyInfoForDocuments().fullAddress,
        phone: DocumentCompanyService.getCompanyInfoForDocuments().phone,
        email: DocumentCompanyService.getCompanyInfoForDocuments().email,
        vatNumber: DocumentCompanyService.getCompanyInfoForDocuments().taxId,
        logo: DocumentCompanyService.getCompanyInfoForDocuments().logoUrl || '/api/placeholder/120/60'
      },
      customer: {
        name: 'Sample Customer',
        email: 'customer@example.com',
        phone: '+254700000000',
        address: '123 Sample Street, Nairobi'
      },
      items: [
        {
          id: '1',
          partNumber: 'SOLAR-550W',
          description: '550W Solar Panel',
          quantity: 2.0,
          unit: 'ea',
          unitPrice: 18000,
          vatRate: 16,
          totalPrice: 36000
        },
        {
          id: '2', 
          partNumber: 'INV-5000W',
          description: '5000W Inverter',
          quantity: 1.0,
          unit: 'ea',
          unitPrice: 25000,
          vatRate: 16,
          totalPrice: 25000
        }
      ],
      subtotal: 61000,
      vatRate: 16,
      vatAmount: 9760,
      total: 70760,
      paymentTerms: 'Net 30 Days',
      bankDetails: {
        bankName: 'Sample Bank',
        accountName: DocumentCompanyService.getCompanyInfoForDocuments().companyName,
        accountNumber: '1234567890'
      },
      mpesaDetails: {
        payBill: '000000',
        accountReference: '0000000',
        businessName: DocumentCompanyService.getCompanyInfoForDocuments().companyName
      },
      signature: {
        name: 'John Smith',
        title: 'Sales Manager',
        date: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPreviewDocument(sampleDocument);
  };

  const saveTemplate = (template: DocumentTemplate) => {
    comprehensiveDocumentEngine.saveTemplate(template);
    loadTemplates();
    toast.success('Template saved successfully');
    closeTemplateDesigner();
  };

  const generateDocumentPreview = async () => {
    if (!previewDocument) return;
    
    try {
      setLoading(true);
      const html = await UnifiedDocumentExportService.generatePreviewHTML(
        previewDocument as BaseDocument,
        selectedDocumentType,
        {
          format: 'view',
          includeQrCode: settings.advancedFeatures?.qrCodeIntegration || legacySettings.export.includeQRCode,
          colorMode: 'color',
          includeLogo: true,
          includeSignature: true,
          logoDisplayMode: 'logo-with-name'
        }
      );
      
      const result = {
        success: true,
        content: html
      };
      
      if (result.success) {
        setPreviewHtml(result.content);
        setShowPreview(true);
        toast.success('Preview generated successfully');
      } else {
        toast.error(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      toast.error('Error generating preview');
      console.error('Preview generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleDocument = async () => {
    if (!previewDocument) return;
    
    try {
      setLoading(true);
      await UnifiedDocumentExportService.exportDocument(
        previewDocument as BaseDocument,
        selectedDocumentType,
        {
          format: selectedFormat,
          filename: `${selectedDocumentType}-sample-${Date.now()}`,
          includeQrCode: settings.advancedFeatures?.qrCodeIntegration || legacySettings.export.includeQRCode,
          colorMode: 'color',
          includeLogo: true,
          includeSignature: true,
          logoDisplayMode: 'logo-with-name'
        }
      );
      
      toast.success(`${selectedFormat.toUpperCase()} document generated successfully`);
      loadExportStats();
    } catch (error) {
      toast.error('Error generating document');
      console.error('Document generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const batchGenerateDocuments = async () => {
    if (!previewDocument) return;
    
    try {
      setLoading(true);
      const formats: Array<'html' | 'pdf' | 'excel' | 'word'> = ['html', 'pdf', 'excel', 'word'];
      const results = [];
      
      for (const format of formats) {
        try {
          await UnifiedDocumentExportService.exportDocument(
            previewDocument as BaseDocument,
            selectedDocumentType,
            {
              format: format,
              filename: `${selectedDocumentType}-batch-${format}-${Date.now()}`,
              includeQrCode: settings.advancedFeatures?.qrCodeIntegration || legacySettings.export.includeQRCode,
              colorMode: 'color',
              includeLogo: true,
              includeSignature: true,
              logoDisplayMode: 'logo-with-name'
            }
          );
          results.push({ success: true, format });
        } catch (error) {
          console.error(`Error generating ${format}:`, error);
          results.push({ success: false, format, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      setGeneratedDocuments(prev => [...prev, ...results.filter(r => r.success)]);
      
      toast.success(`Batch generation completed: ${successCount}/${formats.length} formats generated`);
      loadExportStats();
    } catch (error) {
      toast.error('Error in batch generation');
      console.error('Batch generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDocuments = async () => {
    try {
      setSaveStatus('saving');
      const result = await DocumentStorageService.exportAllDocuments();
      if (result) {
        setSaveStatus('saved');
        loadDocumentStats();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      setSaveStatus('error');
    }
  };

  const handleProcessWorkflows = async () => {
    try {
      setSaveStatus('saving');
      // Process all pending workflows
      const result = await DocumentWorkflowService.processAllPendingWorkflows();
      if (result) {
        setSaveStatus('saved');
        loadDocumentStats();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Workflow processing failed:', error);
      setSaveStatus('error');
    }
  };

  const handleExportAll = async () => {
    try {
      setSaveStatus('saving');
      const result = await EnhancedExportService.exportAllDocuments({
        format: settings.exportEngine?.defaultFormat || legacySettings.export.defaultFormat,
        includeQRCode: settings.advancedFeatures?.qrCodeIntegration || legacySettings.export.includeQRCode,
        watermark: settings.advancedFeatures?.watermarkSupport || legacySettings.export.watermark
      });
      if (result) {
        setSaveStatus('saved');
        loadDocumentStats();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setSaveStatus('error');
    }
  };

  const getSaveStatusBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return <Badge variant="outline" className="text-blue-600"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processing...</Badge>;
      case 'saved':
        return <Badge variant="secondary" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return null;
    }
  };

  const handleSave = () => {
    try {
      // Save both service settings and legacy settings
      DocumentSettingsIntegrationService.saveSettings(settings);
      
      if (onSave) {
        onSave({ ...settings, legacy: legacySettings });
      }
      
      setSaveStatus('saved');
      toast.success('Settings saved successfully');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          <h1 className="text-xl sm:text-2xl font-bold">Document Service</h1>
        </div>
        <div className="flex items-center gap-2">
          {getSaveStatusBadge()}
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Settings</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Document Service Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Service Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{documentStats.totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{documentStats.storageUsed}</div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{documentStats.templatesActive}</div>
              <div className="text-sm text-muted-foreground">Active Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{documentStats.exportFormats}</div>
              <div className="text-sm text-muted-foreground">Export Formats</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-gray-600">{documentStats.lastBackup}</div>
              <div className="text-sm text-muted-foreground">Last Backup</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="storage" className="w-full">
        <div className="relative overflow-hidden">
          <TabsList className="inline-flex w-auto min-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide gap-1 p-1">
            <TabsTrigger value="storage" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Archive className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Storage & Management</span>
              <span className="sm:hidden">Storage</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Workflow className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Workflow Automation</span>
              <span className="sm:hidden">Workflow</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Export & Generation</span>
              <span className="sm:hidden">Export</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Palette className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Branding & Design</span>
              <span className="sm:hidden">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Advanced Features</span>
              <span className="sm:hidden">Advanced</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Storage & Management Tab */}
        <TabsContent value="storage" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Document Storage & Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Auto-backup enabled</Label>
                    <Switch 
                      id="autoBackup"
                      checked={legacySettings.storage.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange('storage', 'autoBackup', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">Document retention (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      value={legacySettings.storage.retentionDays}
                      onChange={(e) => handleSettingChange('storage', 'retentionDays', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDocuments">Maximum documents</Label>
                    <Input
                      id="maxDocuments"
                      type="number"
                      value={1000}
                      onChange={(e) => console.log('Max documents:', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compression">Document compression</Label>
                    <Switch 
                      id="compression"
                      checked={legacySettings.storage.compressionEnabled}
                      onCheckedChange={(checked) => handleSettingChange('storage', 'compressionEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cloudSync">Cloud synchronization</Label>
                    <Switch 
                      id="cloudSync"
                      checked={legacySettings.storage.cloudSync}
                      onCheckedChange={(checked) => handleSettingChange('storage', 'cloudSync', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="versioning">Document versioning</Label>
                    <Switch 
                      id="versioning"
                      checked={true}
                      onCheckedChange={(checked) => console.log('Versioning:', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Document Management</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Button onClick={handleBackupDocuments} className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Backup All
                  </Button>
                  <Button variant="outline" onClick={loadDocumentStats} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Stats
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Docs
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Cleanup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Automation Tab */}
        <TabsContent value="workflow" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Workflow Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoTransitions">Auto-transitions</Label>
                    <Switch 
                      id="autoTransitions"
                      checked={legacySettings.workflow.autoTransitions}
                      onCheckedChange={(checked) => handleSettingChange('workflow', 'autoTransitions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="statusTracking">Status tracking</Label>
                    <Switch 
                      id="statusTracking"
                      checked={legacySettings.workflow.statusTracking}
                      onCheckedChange={(checked) => handleSettingChange('workflow', 'statusTracking', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications</Label>
                    <Switch 
                      id="notifications"
                      checked={legacySettings.workflow.notificationsEnabled}
                      onCheckedChange={(checked) => handleSettingChange('workflow', 'notificationsEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="approvalRequired">Approval required</Label>
                    <Switch 
                      id="approvalRequired"
                      checked={legacySettings.workflow.approvalRequired}
                      onCheckedChange={(checked) => handleSettingChange('workflow', 'approvalRequired', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Workflow Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button onClick={handleProcessWorkflows} className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Process All Workflows
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Workflow Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Generation Tab */}
        <TabsContent value="export" className="space-y-4 mt-6">
          <div className="space-y-6">
            {/* Template Engine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Template Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateStyle">Template Style</Label>
                      <Select value="professional" onValueChange={(value) => console.log('Template style:', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Select value="Inter" onValueChange={(value) => console.log('Font family:', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Base Font Size</Label>
                      <Select value="14px" onValueChange={(value) => console.log('Font size:', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="14px">14px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="18px">18px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="responsiveDesign">Responsive Design</Label>
                      <Switch 
                        id="responsiveDesign"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Responsive design:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobileOptimized">Mobile Optimized</Label>
                      <Switch 
                        id="mobileOptimized"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Mobile optimized:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="printOptimized">Print Optimized</Label>
                      <Switch 
                        id="printOptimized"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Print optimized:', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Engine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Layout Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pageFormat">Page Format</Label>
                      <Select value="A4" onValueChange={(value) => console.log('Page format:', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (210mm x 297mm)</SelectItem>
                          <SelectItem value="Letter">Letter (8.5" x 11")</SelectItem>
                          <SelectItem value="Legal">Legal (8.5" x 14")</SelectItem>
                          <SelectItem value="A3">A3 (297mm x 420mm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="margins">Print Margins</Label>
                      <Select value="20mm" onValueChange={(value) => console.log('Margins:', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15mm">15mm (Print-safe)</SelectItem>
                          <SelectItem value="20mm">20mm (Standard)</SelectItem>
                          <SelectItem value="25mm">25mm (Wide)</SelectItem>
                          <SelectItem value="30mm">30mm (Extra Wide)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breakpoints">Responsive Breakpoints</Label>
                      <Select value="standard" onValueChange={(value) => console.log('Breakpoints:', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (sm/md/lg/xl)</SelectItem>
                          <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                          <SelectItem value="bootstrap">Bootstrap</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pageBreaks">Page Break Management</Label>
                      <Switch 
                        id="pageBreaks"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Page breaks:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="flexibleGrid">Flexible Grid System</Label>
                      <Switch 
                        id="flexibleGrid"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Flexible grid:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adaptiveTypography">Adaptive Typography</Label>
                      <Switch 
                        id="adaptiveTypography"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Adaptive typography:', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Multi-Format Export Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultFormat">Default Export Format</Label>
                      <Select value={legacySettings.export.defaultFormat} onValueChange={(value) => handleSettingChange('export', 'defaultFormat', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PDF">PDF (High-quality vector)</SelectItem>
                          <SelectItem value="HTML">HTML (Responsive web)</SelectItem>
                          <SelectItem value="Excel">Excel (Data analysis)</SelectItem>
                          <SelectItem value="Word">Word (Editable format)</SelectItem>
                          <SelectItem value="MHT">MHT (Web archive)</SelectItem>
                          <SelectItem value="Print">Print/View (Direct)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="colorMode">Color Management</Label>
                      <Select value={legacySettings.export.colorMode} onValueChange={(value) => handleSettingChange('export', 'colorMode', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Color (Digital)</SelectItem>
                          <SelectItem value="monochrome">Monochrome (Print)</SelectItem>
                          <SelectItem value="print-safe">Print-safe Colors</SelectItem>
                          <SelectItem value="brand-consistent">Brand Consistent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compression">Compression Level</Label>
                      <Select value={legacySettings.export.compression} onValueChange={(value) => handleSettingChange('export', 'compression', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Best Quality)</SelectItem>
                          <SelectItem value="low">Low (High Quality)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="high">High (Smaller Size)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="embedFonts">Embed Fonts</Label>
                      <Switch 
                        id="embedFonts"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Embed fonts:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vectorOutput">Vector Output</Label>
                      <Switch 
                        id="vectorOutput"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Vector output:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="multiPageSupport">Multi-page Support</Label>
                      <Switch 
                        id="multiPageSupport"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Multi-page support:', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailCompatible">Email Compatible</Label>
                      <Switch 
                        id="emailCompatible"
                        checked={true}
                        onCheckedChange={(checked) => console.log('Email compatible:', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Advanced Export Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeQR">QR Code Integration</Label>
                        <Switch 
                          id="includeQR"
                          checked={legacySettings.export.includeQRCode}
                          onCheckedChange={(checked) => handleSettingChange('export', 'includeQRCode', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="digitalSignatures">Digital Signatures</Label>
                        <Switch 
                          id="digitalSignatures"
                          checked={true}
                          onCheckedChange={(checked) => console.log('Digital signatures:', checked)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="watermark">Watermark</Label>
                        <Switch 
                          id="watermark"
                          checked={legacySettings.export.watermark}
                          onCheckedChange={(checked) => handleSettingChange('export', 'watermark', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="analyticsTracking">Analytics Tracking</Label>
                        <Switch 
                          id="analyticsTracking"
                          checked={true}
                          onCheckedChange={(checked) => console.log('Analytics tracking:', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Export Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Button onClick={handleExportAll} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export All
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Templates
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print Preview
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Test Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding & Design Tab */}
        <TabsContent value="branding" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding & Design Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoPosition">Logo position</Label>
                    <Select value={legacySettings.branding.logoPosition} onValueChange={(value) => handleSettingChange('branding', 'logoPosition', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="header">Header</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCompanyName">Show company name</Label>
                    <Switch 
                      id="showCompanyName"
                      checked={legacySettings.branding.showCompanyName}
                      onCheckedChange={(checked) => handleSettingChange('branding', 'showCompanyName', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customColors">Custom colors</Label>
                    <Switch 
                      id="customColors"
                      checked={legacySettings.branding.customColors}
                      onCheckedChange={(checked) => handleSettingChange('branding', 'customColors', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brandingEnabled">Branding enabled</Label>
                    <Switch 
                      id="brandingEnabled"
                      checked={legacySettings.branding.brandingEnabled}
                      onCheckedChange={(checked) => handleSettingChange('branding', 'brandingEnabled', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Design Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Themes
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Design
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Features Tab */}
        <TabsContent value="advanced" className="space-y-4 mt-6">
          {/* Document Generation Engine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Document Generation Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select value={selectedDocumentType} onValueChange={(value: any) => setSelectedDocumentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="quote">Quote</SelectItem>
                        <SelectItem value="proformaInvoice">Proforma Invoice</SelectItem>
                        <SelectItem value="salesOrder">Sales Order</SelectItem>
                        <SelectItem value="purchaseOrder">Purchase Order</SelectItem>
                        <SelectItem value="deliveryNote">Delivery Note</SelectItem>
                        <SelectItem value="goodsReceiving">Goods Receiving Note</SelectItem>
                        <SelectItem value="paymentReceipt">Payment Receipt</SelectItem>
                        <SelectItem value="creditNote">Credit Note</SelectItem>
                        <SelectItem value="debitNote">Debit Note</SelectItem>
                        <SelectItem value="workOrder">Work Order</SelectItem>
                        <SelectItem value="serviceOrder">Service Order</SelectItem>
                        <SelectItem value="maintenanceOrder">Maintenance Order</SelectItem>
                        <SelectItem value="stockTransfer">Stock Transfer</SelectItem>
                        <SelectItem value="inventoryAdjustment">Inventory Adjustment</SelectItem>
                        <SelectItem value="returnNote">Return Note</SelectItem>
                        <SelectItem value="billOfLading">Bill of Lading</SelectItem>
                        <SelectItem value="packingList">Packing List</SelectItem>
                        <SelectItem value="timesheet">Timesheet</SelectItem>
                        <SelectItem value="expenseReport">Expense Report</SelectItem>
                        <SelectItem value="budgetReport">Budget Report</SelectItem>
                        <SelectItem value="statement">Statement</SelectItem>
                        <SelectItem value="reminder">Payment Reminder</SelectItem>
                        <SelectItem value="contractAgreement">Contract Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outputFormat">Output Format</Label>
                    <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML (Web View)</SelectItem>
                        <SelectItem value="pdf">PDF (Print Ready)</SelectItem>
                        <SelectItem value="excel">Excel (Data Export)</SelectItem>
                        <SelectItem value="word">Word (Editable)</SelectItem>
                        <SelectItem value="print">Print Preview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select value={currentTemplate?.id || 'default'} onValueChange={(value) => {
                      const template = availableTemplates.find(t => t.id === value);
                      setCurrentTemplate(template || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        {availableTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Generation Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Total Generated</div>
                        <div className="text-2xl font-bold text-blue-600">{generatedDocuments.length}</div>
                      </div>
                      <div>
                        <div className="font-medium">Success Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                          {generatedDocuments.length > 0 ? '100%' : '0%'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={generateDocumentPreview} disabled={loading} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {loading ? 'Generating...' : 'Generate Preview'}
                    </Button>
                    <Button onClick={generateSampleDocument} disabled={loading} variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Generate Sample
                    </Button>
                    <Button onClick={batchGenerateDocuments} disabled={loading} variant="outline" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Batch Generate
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Template Management */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Template Management
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Button onClick={openTemplateDesigner} variant="outline" className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Template Designer
                  </Button>
                  <Button onClick={loadTemplates} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Templates
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Template
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Template
                  </Button>
                </div>
              </div>
              
              {/* Generated Documents */}
              {generatedDocuments.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Generated Documents
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {generatedDocuments.slice(-5).map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{doc.documentId}</div>
                            <div className="text-sm text-gray-500">
                              {doc.format.toUpperCase()} • {Math.round(doc.metadata.fileSize / 1024)}KB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{doc.format}</Badge>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Components */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code Integration
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Document verification</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quick access links</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment integration</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Digital Signatures
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Department signatures</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Document validation</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Image signatures</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Optimization
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Responsive design</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Touch-friendly UI</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PWA support</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Features
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tax calculations</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Multi-currency</span>
                      <Badge variant="secondary">✓ Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Exchange rates</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Advanced Template Designer Modal */}
      {showTemplateDesigner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Advanced Template Designer</h2>
              <Button onClick={closeTemplateDesigner} variant="ghost" size="sm">
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AdvancedTemplateDesigner
                template={currentTemplate}
                onSave={saveTemplate}
                onCancel={closeTemplateDesigner}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Document Preview</h2>
              <div className="flex items-center gap-2">
                <Button onClick={generateSampleDocument} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setShowPreview(false)} variant="ghost" size="sm">
                  ✕
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="border rounded-lg bg-white shadow-sm">
                <div 
                  className="p-4" 
                  dangerouslySetInnerHTML={{ __html: previewHtml }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentServiceSettings;
