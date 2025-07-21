import { UnifiedDocumentExportService } from './unifiedDocumentExportService';
import { EnhancedExportService } from './enhancedExportService';
import { DocumentCompanyService } from './documentCompanyService';

export interface DocumentServiceSettings {
  templateEngine: {
    templateStyle: 'professional' | 'modern' | 'minimal' | 'classic';
    fontFamily: 'Inter' | 'Roboto' | 'Arial' | 'Times New Roman' | 'Helvetica';
    baseFontSize: '12px' | '14px' | '16px' | '18px';
    responsiveDesign: boolean;
    mobileOptimization: boolean;
    printOptimization: boolean;
  };
  layoutEngine: {
    pageFormat: 'A4' | 'Letter' | 'Legal' | 'A3';
    printMargins: '15mm' | '20mm' | '25mm' | '30mm';
    responsiveBreakpoints: 'standard' | 'tailwind' | 'bootstrap' | 'custom';
    pageBreakManagement: boolean;
    flexibleGridSystem: boolean;
    adaptiveTypography: boolean;
  };
  exportEngine: {
    defaultFormat: 'PDF' | 'HTML' | 'Excel' | 'Word' | 'MHT' | 'Print';
    colorMode: 'full' | 'monochrome' | 'print-safe' | 'brand-consistent';
    compressionLevel: 'none' | 'low' | 'medium' | 'high';
    embedFonts: boolean;
    vectorOutput: boolean;
    multiPageSupport: boolean;
    emailCompatible: boolean;
  };
  advancedFeatures: {
    qrCodeIntegration: boolean;
    digitalSignatures: boolean;
    watermarkSupport: boolean;
    analyticsTracking: boolean;
  };
  batchProcessing: {
    enabled: boolean;
    maxConcurrentExports: number;
    autoRetry: boolean;
    retryAttempts: number;
    progressTracking: boolean;
  };
}

export interface ExportProgress {
  id: string;
  documentId: string;
  documentType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  outputPath?: string;
}

export interface BatchExportJob {
  id: string;
  name: string;
  documentIds: string[];
  documentTypes: string[];
  exportSettings: Partial<DocumentServiceSettings>;
  totalDocuments: number;
  completedDocuments: number;
  failedDocuments: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: ExportProgress[];
}

/**
 * Document Settings Integration Service
 * Bridges the settings UI with export services for real-time integration
 */
export class DocumentSettingsIntegrationService {
  private static currentSettings: DocumentServiceSettings | null = null;
  private static batchJobs: Map<string, BatchExportJob> = new Map();
  private static progressListeners: Map<string, (progress: ExportProgress) => void> = new Map();

  /**
   * Load current document service settings
   */
  static loadSettings(): DocumentServiceSettings {
    try {
      const savedSettings = localStorage.getItem('document-service-settings');
      if (savedSettings) {
        this.currentSettings = JSON.parse(savedSettings);
      } else {
        this.currentSettings = this.getDefaultSettings();
        this.saveSettings(this.currentSettings);
      }
      return this.currentSettings;
    } catch (error) {
      console.error('Failed to load document settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save document service settings
   */
  static saveSettings(settings: DocumentServiceSettings): boolean {
    try {
      localStorage.setItem('document-service-settings', JSON.stringify(settings));
      this.currentSettings = settings;
      this.applySettingsToServices(settings);
      return true;
    } catch (error) {
      console.error('Failed to save document settings:', error);
      return false;
    }
  }

  /**
   * Get default settings
   */
  private static getDefaultSettings(): DocumentServiceSettings {
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

  /**
   * Apply settings to export services
   */
  private static applySettingsToServices(settings: DocumentServiceSettings): void {
    // Apply template engine settings
    this.applyTemplateEngineSettings(settings.templateEngine);
    
    // Apply layout engine settings
    this.applyLayoutEngineSettings(settings.layoutEngine);
    
    // Apply export engine settings
    this.applyExportEngineSettings(settings.exportEngine);
    
    // Apply advanced features settings
    this.applyAdvancedFeaturesSettings(settings.advancedFeatures);
    
    // Apply batch processing settings
    this.applyBatchProcessingSettings(settings.batchProcessing);
  }

  /**
   * Apply template engine settings
   */
  private static applyTemplateEngineSettings(settings: DocumentServiceSettings['templateEngine']): void {
    // Store template settings for UnifiedDocumentExportService
    localStorage.setItem('template-engine-settings', JSON.stringify(settings));
    
    // Update CSS variables for real-time application
    const root = document.documentElement;
    root.style.setProperty('--doc-font-family', settings.fontFamily);
    root.style.setProperty('--doc-font-size', settings.baseFontSize);
    root.style.setProperty('--doc-template-style', settings.templateStyle);
  }

  /**
   * Apply layout engine settings
   */
  private static applyLayoutEngineSettings(settings: DocumentServiceSettings['layoutEngine']): void {
    localStorage.setItem('layout-engine-settings', JSON.stringify(settings));
    
    // Update CSS variables for layout
    const root = document.documentElement;
    root.style.setProperty('--doc-page-format', settings.pageFormat);
    root.style.setProperty('--doc-print-margins', settings.printMargins);
    root.style.setProperty('--doc-breakpoints', settings.responsiveBreakpoints);
  }

  /**
   * Apply export engine settings
   */
  private static applyExportEngineSettings(settings: DocumentServiceSettings['exportEngine']): void {
    localStorage.setItem('export-engine-settings', JSON.stringify(settings));
  }

  /**
   * Apply advanced features settings
   */
  private static applyAdvancedFeaturesSettings(settings: DocumentServiceSettings['advancedFeatures']): void {
    localStorage.setItem('advanced-features-settings', JSON.stringify(settings));
  }

  /**
   * Apply batch processing settings
   */
  private static applyBatchProcessingSettings(settings: DocumentServiceSettings['batchProcessing']): void {
    localStorage.setItem('batch-processing-settings', JSON.stringify(settings));
  }

  /**
   * Get current settings for a specific engine
   */
  static getEngineSettings<T extends keyof DocumentServiceSettings>(engine: T): DocumentServiceSettings[T] {
    if (!this.currentSettings) {
      this.loadSettings();
    }
    return this.currentSettings![engine];
  }

  /**
   * Update specific engine settings
   */
  static updateEngineSettings<T extends keyof DocumentServiceSettings>(
    engine: T,
    updates: Partial<DocumentServiceSettings[T]>
  ): boolean {
    if (!this.currentSettings) {
      this.loadSettings();
    }
    
    this.currentSettings![engine] = { ...this.currentSettings![engine], ...updates };
    return this.saveSettings(this.currentSettings!);
  }

  /**
   * Create batch export job
   */
  static createBatchExportJob(
    name: string,
    documentIds: string[],
    documentTypes: string[],
    exportSettings: Partial<DocumentServiceSettings>
  ): BatchExportJob {
    const job: BatchExportJob = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      documentIds,
      documentTypes,
      exportSettings,
      totalDocuments: documentIds.length,
      completedDocuments: 0,
      failedDocuments: 0,
      status: 'pending',
      createdAt: new Date(),
      progress: [],
    };

    this.batchJobs.set(job.id, job);
    return job;
  }

  /**
   * Execute batch export job
   */
  static async executeBatchExportJob(jobId: string): Promise<boolean> {
    const job = this.batchJobs.get(jobId);
    if (!job) {
      throw new Error(`Batch job ${jobId} not found`);
    }

    job.status = 'processing';
    job.startedAt = new Date();

    const batchSettings = this.getEngineSettings('batchProcessing');
    const maxConcurrent = batchSettings.maxConcurrentExports;
    const autoRetry = batchSettings.autoRetry;
    const retryAttempts = batchSettings.retryAttempts;

    try {
      // Process documents in batches
      const batches = this.chunkArray(job.documentIds, maxConcurrent);
      
      for (const batch of batches) {
        const promises = batch.map(async (documentId, index) => {
          const documentType = job.documentTypes[job.documentIds.indexOf(documentId)];
          const progress: ExportProgress = {
            id: `progress-${documentId}`,
            documentId,
            documentType,
            status: 'pending',
            progress: 0,
            startTime: new Date(),
          };

          job.progress.push(progress);
          this.notifyProgressListeners(progress);

          try {
            progress.status = 'processing';
            progress.progress = 50;
            this.notifyProgressListeners(progress);

            // Simulate export process (replace with actual export logic)
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

            progress.status = 'completed';
            progress.progress = 100;
            progress.endTime = new Date();
            progress.outputPath = `/exports/${documentId}.pdf`;
            
            job.completedDocuments++;
            this.notifyProgressListeners(progress);

          } catch (error) {
            progress.status = 'failed';
            progress.error = error instanceof Error ? error.message : 'Unknown error';
            progress.endTime = new Date();
            
            job.failedDocuments++;
            this.notifyProgressListeners(progress);

            if (autoRetry && progress.error && retryAttempts > 0) {
              // Implement retry logic here
              console.log(`Retrying export for document ${documentId}`);
            }
          }
        });

        await Promise.all(promises);
      }

      job.status = job.failedDocuments > 0 ? 'completed' : 'completed';
      job.completedAt = new Date();
      
      return true;

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      console.error('Batch export job failed:', error);
      return false;
    }
  }

  /**
   * Get batch export job
   */
  static getBatchExportJob(jobId: string): BatchExportJob | undefined {
    return this.batchJobs.get(jobId);
  }

  /**
   * Get all batch export jobs
   */
  static getAllBatchExportJobs(): BatchExportJob[] {
    return Array.from(this.batchJobs.values());
  }

  /**
   * Cancel batch export job
   */
  static cancelBatchExportJob(jobId: string): boolean {
    const job = this.batchJobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'processing') {
      job.status = 'cancelled';
      job.completedAt = new Date();
      return true;
    }

    return false;
  }

  /**
   * Add progress listener
   */
  static addProgressListener(listenerId: string, callback: (progress: ExportProgress) => void): void {
    this.progressListeners.set(listenerId, callback);
  }

  /**
   * Remove progress listener
   */
  static removeProgressListener(listenerId: string): void {
    this.progressListeners.delete(listenerId);
  }

  /**
   * Notify progress listeners
   */
  private static notifyProgressListeners(progress: ExportProgress): void {
    this.progressListeners.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Progress listener error:', error);
      }
    });
  }

  /**
   * Chunk array into smaller arrays
   */
  private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate preview with current settings
   */
  static async generatePreviewWithSettings(
    documentId: string,
    documentType: string,
    overrideSettings?: Partial<DocumentServiceSettings>
  ): Promise<string> {
    const settings = this.currentSettings || this.loadSettings();
    const finalSettings = overrideSettings ? { ...settings, ...overrideSettings } : settings;
    
    // Apply settings temporarily for preview
    this.applySettingsToServices(finalSettings);
    
    try {
      // Generate preview HTML (implement actual preview generation)
      const previewHtml = await this.generatePreviewHtml(documentId, documentType, finalSettings);
      return previewHtml;
    } finally {
      // Restore original settings
      this.applySettingsToServices(settings);
    }
  }

  /**
   * Generate preview HTML
   */
  private static async generatePreviewHtml(
    documentId: string,
    documentType: string,
    settings: DocumentServiceSettings
  ): Promise<string> {
    // This is a placeholder - implement actual preview generation
    return `
      <div style="font-family: ${settings.templateEngine.fontFamily}; font-size: ${settings.templateEngine.baseFontSize};">
        <h1>Preview for ${documentType} - ${documentId}</h1>
        <p>Template Style: ${settings.templateEngine.templateStyle}</p>
        <p>Page Format: ${settings.layoutEngine.pageFormat}</p>
        <p>Export Format: ${settings.exportEngine.defaultFormat}</p>
        <div style="margin: ${settings.layoutEngine.printMargins}; border: 1px solid #ccc; padding: 20px;">
          <h2>Document Content Preview</h2>
          <p>This is a preview of how your document will appear with the current settings.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Sample Item</td>
              <td style="border: 1px solid #ddd; padding: 8px;">Sample Description</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$100.00</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Get export statistics
   */
  static getExportStatistics(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    averageExportTime: number;
    popularFormats: { format: string; count: number }[];
    recentJobs: BatchExportJob[];
  } {
    const jobs = Array.from(this.batchJobs.values());
    const totalExports = jobs.reduce((sum, job) => sum + job.totalDocuments, 0);
    const successfulExports = jobs.reduce((sum, job) => sum + job.completedDocuments, 0);
    const failedExports = jobs.reduce((sum, job) => sum + job.failedDocuments, 0);
    
    const completedJobs = jobs.filter(job => job.completedAt && job.startedAt);
    const averageExportTime = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => 
          sum + (job.completedAt!.getTime() - job.startedAt!.getTime()), 0) / completedJobs.length
      : 0;

    const formatCounts = new Map<string, number>();
    jobs.forEach(job => {
      const format = job.exportSettings.exportEngine?.defaultFormat || 'PDF';
      formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
    });

    const popularFormats = Array.from(formatCounts.entries())
      .map(([format, count]) => ({ format, count }))
      .sort((a, b) => b.count - a.count);

    const recentJobs = jobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalExports,
      successfulExports,
      failedExports,
      averageExportTime,
      popularFormats,
      recentJobs,
    };
  }
}
