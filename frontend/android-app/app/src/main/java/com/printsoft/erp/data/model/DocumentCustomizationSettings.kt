package com.printsoft.erp.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "document_customization_settings")
data class DocumentCustomizationSettings(
    @PrimaryKey val id: String,
    val name: String,
    @SerializedName("document_type") val documentType: String, // e.g., 'invoice'
    @SerializedName("is_default") val isDefault: Boolean,
    
    // Layout
    val layout: LayoutSettings,

    // Header
    val header: HeaderSettings,

    // Footer
    val footer: FooterSettings,

    // Typography
    val typography: TypographySettings,

    // Colors
    val colors: ColorScheme,

    // Elements
    val elements: DocumentElements,

    // Print
    val print: PrintSettings,

    // Export
    val export: ExportSettings,

    // Advanced and Responsive
    val advanced: AdvancedCustomization,
    val responsive: ResponsiveSettings,

    // Metadata
    val metadata: Metadata
)

// Layout settings
@Entity
data class LayoutSettings(
    val pageFormat: String,  // 'A4' | 'Legal'
    val orientation: String,  // 'portrait' | 'landscape'
    val margins: Margins,
    val spacing: Spacing
)

data class Margins(
    val top: Float,
    val right: Float,
    val bottom: Float,
    val left: Float
)

data class Spacing(
    val lineHeight: Float,
    val paragraphSpacing: Float,
    val sectionSpacing: Float
)

// Header settings
data class HeaderSettings(
    val enabled: Boolean,
    val height: Float,
    val backgroundColor: String,
    val borderColor: String,
    val borderWidth: Float,
    val showLogo: Boolean,
    val showCompanyName: Boolean,
    val showCompanyDetails: Boolean
    // Add more fields according to the main project...
)

// Footer settings
data class FooterSettings(
    val enabled: Boolean,
    val height: Float,
    val backgroundColor: String,
    val borderColor: String,
    val borderWidth: Float,
    val showDisclaimer: Boolean
    // Add more fields according to the main project...
)

// Typography
@Entity
data class TypographySettings(
    val documentTitleFont: String,
    val bodyFont: String,
    val documentTitleSize: Int,
    val bodyFontSize: Int,
    val headingColor: String,
    val bodyColor: String,
    val accentColor: String
)

// Colors
@Entity
data class ColorScheme(
    val primary: String,
    val secondary: String,
    val accent: String,
    val success: String,
    val warning: String,
    val error: String
)

// Document Elements
@Entity
data class DocumentElements(
    val companySection: CompanySectionSettings,
    val partySection: PartySectionSettings,
    val documentInfo: DocumentInfoSettings,
    val itemsTable: ItemsTableSettings,
    val totalsSection: TotalsSectionSettings,
    val paymentSection: PaymentSectionSettings,
    val signatureSection: SignatureSectionSettings,
    val qrCode: QRCodeSettings,
    val watermark: WatermarkSettings,
    val notesSection: NotesSectionSettings
)

// Section Settings
data class CompanySectionSettings(
    val enabled: Boolean,
    val position: String, // 'header' | 'separate-section'
    val showLogo: Boolean,
    val showName: Boolean,
    val showAddress: Boolean,
    val showContactInfo: Boolean,
    val backgroundColor: String,
    val borderColor: String,
    val borderWidth: Float
)

data class PartySectionSettings(
    val enabled: Boolean,
    val position: String, // 'left' | 'right' | 'center'
    val showBillingAddress: Boolean,
    val showShippingAddress: Boolean,
    val showContactInfo: Boolean,
    val backgroundColor: String,
    val borderColor: String,
    val borderWidth: Float
)

data class DocumentInfoSettings(
    val enabled: Boolean,
    val position: String, // 'header-right' | 'separate-section'
    val showDocumentNumber: Boolean,
    val showDate: Boolean,
    val showDueDate: Boolean,
    val showStatus: Boolean,
    val backgroundColor: String,
    val borderColor: String,
    val borderWidth: Float
)

data class ItemsTableSettings(
    val enabled: Boolean,
    val style: String, // 'detailed' | 'compact' | 'minimal'
    val showLineNumbers: Boolean,
    val showItemCodes: Boolean,
    val showCategories: Boolean,
    val showUnits: Boolean,
    val showTaxColumn: Boolean,
    val alternateRowColors: Boolean,
    val headerBackgroundColor: String,
    val headerTextColor: String
)

data class TotalsSectionSettings(
    val enabled: Boolean,
    val position: String, // 'right' | 'center' | 'full-width'
    val showSubtotal: Boolean,
    val showTax: Boolean,
    val showDiscount: Boolean,
    val highlightTotal: Boolean,
    val backgroundColor: String,
    val borderColor: String
)

data class PaymentSectionSettings(
    val enabled: Boolean,
    val position: String, // 'left' | 'right' | 'center'
    val showBankDetails: Boolean,
    val showMpesaDetails: Boolean,
    val showPaymentTerms: Boolean,
    val backgroundColor: String,
    val borderColor: String
)

data class SignatureSectionSettings(
    val enabled: Boolean,
    val position: String, // 'left' | 'right' | 'center'
    val showAuthorizedSignature: Boolean,
    val showVendorSignature: Boolean,
    val showCustomerSignature: Boolean,
    val includeDate: Boolean,
    val includePrintedName: Boolean,
    val signatureHeight: Float
)

data class QRCodeSettings(
    val enabled: Boolean,
    val position: String, // 'header-right' | 'footer-center'
    val size: Int,
    val includeDocumentNumber: Boolean,
    val includeCompanyInfo: Boolean,
    val borderColor: String,
    val backgroundColor: String
)

data class WatermarkSettings(
    val enabled: Boolean,
    val text: String,
    val opacity: Float,
    val fontSize: Int,
    val color: String,
    val rotation: Float,
    val position: String // 'center' | 'diagonal'
)

data class NotesSectionSettings(
    val enabled: Boolean,
    val position: String, // 'after-items' | 'before-totals'
    val showNotes: Boolean,
    val showTerms: Boolean,
    val backgroundColor: String,
    val borderColor: String
)

// Customizations
@Entity
data class PrintSettings(
    val showColors: Boolean,
    val showBackgrounds: Boolean,
    val showBorders: Boolean
)

@Entity
data class ExportSettings(
    val defaultFormat: String, // 'pdf' | 'csv'
    val includeMetadata: Boolean
)

@Entity
data class AdvancedCustomization(
    val customCSS: String?,
    val customHTML: String?,
    val customJavaScript: String?
)

@Entity
data class ResponsiveSettings(
    val enabled: Boolean
    // Add more fields if needed...
)

@Entity
data class Metadata(
    val createdAt: String,
    val updatedAt: String,
    val createdBy: String,
    val version: String
)
