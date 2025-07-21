package com.printsoft.erp.services

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Environment
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintJob
import android.print.PrintManager
import android.webkit.WebView
import androidx.core.content.FileProvider
import com.printsoft.erp.data.models.*
import com.printsoft.erp.utils.QRCodeGenerator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

enum class MobileExportFormat {
    PDF, HTML, SHARE_TEXT, PRINT, QR_CODE, IMAGE
}

data class MobileExportOptions(
    val format: MobileExportFormat,
    val filename: String? = null,
    val includeLogo: Boolean = true,
    val includeSignature: Boolean = true,
    val colorMode: ColorMode = ColorMode.COLOR,
    val compressionLevel: CompressionLevel = CompressionLevel.MEDIUM,
    val shareAfterExport: Boolean = false,
    val watermark: String? = null
)

enum class ColorMode { COLOR, MONOCHROME }
enum class CompressionLevel { LOW, MEDIUM, HIGH }

class MobileDocumentExportService(private val context: Context) {

    private val numberFormat = NumberFormat.getCurrencyInstance(Locale.US)
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.US)

    /**
     * Export business document with mobile optimizations
     */
    suspend fun exportDocument(
        document: Any, // Can be Invoice, PurchaseOrder, Quote, etc.
        documentType: String,
        options: MobileExportOptions
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            when (options.format) {
                MobileExportFormat.PDF -> exportToPDF(document, documentType, options)
                MobileExportFormat.HTML -> exportToHTML(document, documentType, options)
                MobileExportFormat.SHARE_TEXT -> exportToShareableText(document, documentType, options)
                MobileExportFormat.PRINT -> printDocument(document, documentType, options)
                MobileExportFormat.QR_CODE -> generateQRCode(document, documentType, options)
                MobileExportFormat.IMAGE -> exportToImage(document, documentType, options)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Export to PDF with mobile-optimized formatting
     */
    private suspend fun exportToPDF(
        document: Any,
        documentType: String,
        options: MobileExportOptions
    ): Result<String> {
        val pdfDocument = PdfDocument()
        
        // A4 page info
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas
        
        // Set up paint for text
        val paint = Paint().apply {
            isAntiAlias = true
            textSize = 12f
            color = if (options.colorMode == ColorMode.COLOR) Color.BLACK else Color.BLACK
        }
        
        val titlePaint = Paint().apply {
            isAntiAlias = true
            textSize = 18f
            color = if (options.colorMode == ColorMode.COLOR) Color.BLUE else Color.BLACK
            isFakeBoldText = true
        }
        
        var y = 50f
        val margin = 40f
        val pageWidth = pageInfo.pageWidth - (margin * 2)
        
        // Generate document content
        val content = generateDocumentContent(document, documentType)
        
        // Title
        canvas.drawText(content.title, margin, y, titlePaint)
        y += 40f
        
        // Company info
        content.companyInfo?.let { companyInfo ->
            canvas.drawText("Company: $companyInfo", margin, y, paint)
            y += 20f
        }
        
        // Document number and date
        canvas.drawText("Document: ${content.documentNumber}", margin, y, paint)
        canvas.drawText("Date: ${content.date}", pageInfo.pageWidth - margin - 100, y, paint)
        y += 30f
        
        // Customer/Vendor info
        content.customerInfo?.let { info ->
            canvas.drawText("Customer: $info", margin, y, paint)
            y += 20f
        }
        
        content.vendorInfo?.let { info ->
            canvas.drawText("Vendor: $info", margin, y, paint)
            y += 20f
        }
        
        y += 20f
        
        // Line items table
        if (content.lineItems.isNotEmpty()) {
            // Table headers
            canvas.drawText("Description", margin, y, paint)
            canvas.drawText("Qty", margin + 200, y, paint)
            canvas.drawText("Price", margin + 250, y, paint)
            canvas.drawText("Total", margin + 320, y, paint)
            y += 25f
            
            // Draw line under headers
            canvas.drawLine(margin, y - 5, pageInfo.pageWidth - margin, y - 5, paint)
            y += 10f
            
            // Line items
            content.lineItems.forEach { item ->
                if (y > pageInfo.pageHeight - 100) {
                    // Start new page if needed
                    pdfDocument.finishPage(page)
                    val newPage = pdfDocument.startPage(pageInfo)
                    y = 50f
                }
                
                canvas.drawText(truncateText(item.description, 25), margin, y, paint)
                canvas.drawText(item.quantity.toString(), margin + 200, y, paint)
                canvas.drawText(numberFormat.format(item.unitPrice), margin + 250, y, paint)
                canvas.drawText(numberFormat.format(item.total), margin + 320, y, paint)
                y += 20f
            }
        }
        
        // Totals
        y += 20f
        canvas.drawText("Subtotal: ${numberFormat.format(content.subtotal)}", margin + 200, y, paint)
        y += 20f
        
        if (content.taxAmount > 0) {
            canvas.drawText("Tax: ${numberFormat.format(content.taxAmount)}", margin + 200, y, paint)
            y += 20f
        }
        
        canvas.drawText("Total: ${numberFormat.format(content.total)}", margin + 200, y, titlePaint)
        
        // Add watermark if specified
        options.watermark?.let { watermark ->
            val watermarkPaint = Paint().apply {
                isAntiAlias = true
                textSize = 48f
                color = Color.argb(30, 128, 128, 128)
                textAlign = Paint.Align.CENTER
            }
            canvas.save()
            canvas.rotate(-45f, pageInfo.pageWidth / 2f, pageInfo.pageHeight / 2f)
            canvas.drawText(watermark, pageInfo.pageWidth / 2f, pageInfo.pageHeight / 2f, watermarkPaint)
            canvas.restore()
        }
        
        pdfDocument.finishPage(page)
        
        // Save PDF file
        val filename = options.filename ?: "${content.documentNumber}.pdf"
        val file = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), filename)
        
        FileOutputStream(file).use { outputStream ->
            pdfDocument.writeTo(outputStream)
        }
        
        pdfDocument.close()
        
        if (options.shareAfterExport) {
            shareFile(file, "application/pdf")
        }
        
Result.success(file.absolutePath)
        }
        return Result.success(file.absolutePath)
    }

    /**
     * Export to HTML with mobile-responsive design
     */
    private suspend fun exportToHTML(
        document: Any,
        documentType: String,
        options: MobileExportOptions
    ): Result<String> {
        val content = generateDocumentContent(document, documentType)
        
        val html = buildString {
            append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${content.title}</title>
                    <style>
                        ${generateMobileCSS(options)}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <header class="document-header">
                            <h1>${content.title}</h1>
                            <div class="document-info">
                                <p><strong>Document #:</strong> ${content.documentNumber}</p>
                                <p><strong>Date:</strong> ${content.date}</p>
                            </div>
                        </header>
                        
                        ${content.companyInfo?.let { "<div class=\"company-info\"><h3>Company Information</h3><p>$it</p></div>" } ?: ""}
                        
                        ${content.customerInfo?.let { "<div class=\"customer-info\"><h3>Customer Information</h3><p>$it</p></div>" } ?: ""}
                        
                        ${content.vendorInfo?.let { "<div class=\"vendor-info\"><h3>Vendor Information</h3><p>$it</p></div>" } ?: ""}
                        
                        <div class="line-items">
                            <h3>Items</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
            """)
            
            content.lineItems.forEach { item ->
                append("""
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${numberFormat.format(item.unitPrice)}</td>
                        <td>${numberFormat.format(item.total)}</td>
                    </tr>
                """)
            }
            
            append("""
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>${numberFormat.format(content.subtotal)}</span>
                            </div>
            """)
            
            if (content.taxAmount > 0) {
                append("""
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>${numberFormat.format(content.taxAmount)}</span>
                    </div>
                """)
            }
            
            append("""
                            <div class="total-row final-total">
                                <span><strong>Total:</strong></span>
                                <span><strong>${numberFormat.format(content.total)}</strong></span>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            """)
        }
        
        val filename = options.filename ?: "${content.documentNumber}.html"
        val file = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), filename)
        file.writeText(html)
        
        if (options.shareAfterExport) {
            shareFile(file, "text/html")
        }
        
        Result.success(file.absolutePath)
    }

    /**
     * Export to shareable text format for messaging apps
     */
    private suspend fun exportToShareableText(
        document: Any,
        documentType: String,
        options: MobileExportOptions
    ): Result<String> {
        val content = generateDocumentContent(document, documentType)
        
        val text = buildString {
            append("${content.title}\n")
            append("${"=".repeat(content.title.length)}\n\n")
            
            append("Document #: ${content.documentNumber}\n")
            append("Date: ${content.date}\n\n")
            
            content.companyInfo?.let {
                append("Company: $it\n\n")
            }
            
            content.customerInfo?.let {
                append("Customer: $it\n\n")
            }
            
            content.vendorInfo?.let {
                append("Vendor: $it\n\n")
            }
            
            if (content.lineItems.isNotEmpty()) {
                append("ITEMS:\n")
                append("-".repeat(50) + "\n")
                
                content.lineItems.forEachIndexed { index, item ->
                    append("${index + 1}. ${item.description}\n")
                    append("   Qty: ${item.quantity} × ${numberFormat.format(item.unitPrice)} = ${numberFormat.format(item.total)}\n\n")
                }
            }
            
            append("TOTALS:\n")
            append("-".repeat(20) + "\n")
            append("Subtotal: ${numberFormat.format(content.subtotal)}\n")
            
            if (content.taxAmount > 0) {
                append("Tax: ${numberFormat.format(content.taxAmount)}\n")
            }
            
            append("TOTAL: ${numberFormat.format(content.total)}\n\n")
            
            append("Generated on ${SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(Date())}")
        }
        
        // Share text directly
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
            putExtra(Intent.EXTRA_SUBJECT, "${content.title} - ${content.documentNumber}")
        }
        
        val chooser = Intent.createChooser(intent, "Share Document")
        chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(chooser)
        
        Result.success(text)
    }

    /**
     * Print document using Android Print Framework
     */
    private suspend fun printDocument(
        document: Any,
        documentType: String,
        options: MobileExportOptions
    ): Result<String> {
        val printManager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager
        val content = generateDocumentContent(document, documentType)
        
        // Create a WebView for printing
        val webView = WebView(context)
        val html = generatePrintHTML(content, options)
        
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
        
        val printAdapter = webView.createPrintDocumentAdapter(content.documentNumber)
        
        val printJob = printManager.print(
            "${content.title} - ${content.documentNumber}",
            printAdapter,
            PrintAttributes.Builder().build()
        )
        
        Result.success("Print job initiated: ${printJob.info?.label}")
    }

    /**
     * Generate QR code for document
     */
    private suspend fun generateQRCode(
        document: Any,
        documentType: String,
        options: MobileExportOptions
    ): Result<String> {
        val content = generateDocumentContent(document, documentType)
        
        val qrContent = buildString {
            append("Document: ${content.documentNumber}\n")
            append("Type: ${content.title}\n")
            append("Date: ${content.date}\n")
            append("Total: ${numberFormat.format(content.total)}")
        }
        
        val bitmap = QRCodeGenerator.generateQRCodeBitmap(qrContent, 512, 512) ?: return Result.failure(Exception("Failed to generate QR code"))
        
        val filename = options.filename ?: "${content.documentNumber}_QR.png"
        val file = File(context.getExternalFilesDir(Environment.DIRECTORY_PICTURES), filename)
        
        FileOutputStream(file).use { outputStream ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
        }
        
        if (options.shareAfterExport) {
            shareFile(file, "image/png")
        }
        
        Result.success(file.absolutePath)
    }

    /**
     * Export document as image
     */
    private suspend fun exportToImage(
        document: Any,
        documentType: String,
        options: MobileExportOptions
    ): Result<String> {
        val content = generateDocumentContent(document, documentType)
        
        val width = 595
        val height = 842
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        // White background
        canvas.drawColor(Color.WHITE)
        
        val paint = Paint().apply {
            isAntiAlias = true
            textSize = 24f
            color = Color.BLACK
        }
        
        var y = 50f
        val margin = 40f
        
        // Draw content similar to PDF
        canvas.drawText(content.title, margin, y, paint)
        y += 60f
        
        canvas.drawText("Document: ${content.documentNumber}", margin, y, paint)
        y += 40f
        
        canvas.drawText("Date: ${content.date}", margin, y, paint)
        y += 40f
        
        canvas.drawText("Total: ${numberFormat.format(content.total)}", margin, y, paint)
        
        val filename = options.filename ?: "${content.documentNumber}.png"
        val file = File(context.getExternalFilesDir(Environment.DIRECTORY_PICTURES), filename)
        
        FileOutputStream(file).use { outputStream ->
            val format = when (options.compressionLevel) {
                CompressionLevel.LOW -> Bitmap.CompressFormat.PNG
                CompressionLevel.MEDIUM -> Bitmap.CompressFormat.JPEG
                CompressionLevel.HIGH -> Bitmap.CompressFormat.WEBP
            }
            
            val quality = when (options.compressionLevel) {
                CompressionLevel.LOW -> 100
                CompressionLevel.MEDIUM -> 75
                CompressionLevel.HIGH -> 50
            }
            
            bitmap.compress(format, quality, outputStream)
        }
        
        if (options.shareAfterExport) {
            shareFile(file, "image/*")
        }
        
        Result.success(file.absolutePath)
    }

    private fun generateDocumentContent(document: Any, documentType: String): DocumentContent {
        // This would be implemented based on the actual document models
        // For now, returning a mock structure
        return when (document) {
            is Invoice -> DocumentContent(
                title = "Invoice",
                documentNumber = document.invoiceNumber,
                date = dateFormat.format(Date()), // Convert document.date
                companyInfo = "Sample Company Info",
                customerInfo = document.customerId, // Use customerId for now
                vendorInfo = null,
                lineItems = emptyList(), // TODO: Add line items handling
                subtotal = document.subtotal,
                taxAmount = document.taxAmount,
                total = document.totalAmount
            )
            // Add other document types...
            else -> DocumentContent(
                title = documentType.replaceFirstChar { it.uppercase() },
                documentNumber = "DOC-${System.currentTimeMillis()}",
                date = dateFormat.format(Date()),
                companyInfo = "Sample Company",
                customerInfo = null,
                vendorInfo = null,
                lineItems = emptyList(),
                subtotal = 0.0,
                taxAmount = 0.0,
                total = 0.0
            )
        }
    }

    private fun generateMobileCSS(options: MobileExportOptions): String {
        val primaryColor = if (options.colorMode == ColorMode.COLOR) "#007bff" else "#000000"
        val backgroundColor = if (options.colorMode == ColorMode.COLOR) "#ffffff" else "#ffffff"
        
        return """
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 16px;
                background-color: $backgroundColor;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .container {
                max-width: 100%;
                margin: 0 auto;
            }
            
            .document-header {
                text-align: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid $primaryColor;
            }
            
            .document-header h1 {
                color: $primaryColor;
                margin: 0 0 16px 0;
                font-size: 24px;
            }
            
            .document-info {
                font-size: 12px;
                color: #666;
            }
            
            .company-info, .customer-info, .vendor-info {
                margin-bottom: 20px;
                padding: 12px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            
            .company-info h3, .customer-info h3, .vendor-info h3 {
                margin: 0 0 8px 0;
                color: $primaryColor;
                font-size: 16px;
            }
            
            .line-items {
                margin-bottom: 24px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
            }
            
            th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            
            th {
                background-color: $primaryColor;
                color: white;
                font-weight: 600;
                font-size: 12px;
            }
            
            td {
                font-size: 12px;
            }
            
            tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .totals {
                margin-top: 24px;
                padding: 16px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 4px 0;
            }
            
            .final-total {
                font-size: 18px;
                font-weight: bold;
                color: $primaryColor;
                border-top: 2px solid $primaryColor;
                padding-top: 12px;
                margin-top: 12px;
            }
            
            @media (max-width: 600px) {
                body {
                    padding: 8px;
                    font-size: 12px;
                }
                
                .document-header h1 {
                    font-size: 20px;
                }
                
                table {
                    font-size: 10px;
                }
                
                th, td {
                    padding: 4px;
                }
            }
        """.trimIndent()
    }

    private fun generatePrintHTML(content: DocumentContent, options: MobileExportOptions): String {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @page { margin: 20mm; }
                    body { font-family: Arial, sans-serif; font-size: 12pt; }
                    .header { text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 5px; border: 1px solid #000; }
                    th { background-color: #f0f0f0; }
                    .totals { text-align: right; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${content.title}</h1>
                    <p>Document #: ${content.documentNumber} | Date: ${content.date}</p>
                </div>
                <!-- Content would be generated here based on the document -->
                <div class="totals">
                    <p><strong>Total: ${numberFormat.format(content.total)}</strong></p>
                </div>
            </body>
            </html>
        """.trimIndent()
    }

    private fun shareFile(file: File, mimeType: String) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.provider",
            file
        )
        
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
        }
        
        val chooser = Intent.createChooser(intent, "Share Document")
        chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(chooser)
    }

    private fun truncateText(text: String, maxLength: Int): String {
        return if (text.length <= maxLength) text else "${text.substring(0, maxLength)}..."
    }
}

// Data classes for document content
data class DocumentContent(
    val title: String,
    val documentNumber: String,
    val date: String,
    val companyInfo: String?,
    val customerInfo: String?,
    val vendorInfo: String?,
    val lineItems: List<LineItemContent>,
    val subtotal: Double,
    val taxAmount: Double,
    val total: Double
)

data class LineItemContent(
    val description: String,
    val quantity: Double,
    val unitPrice: Double,
    val total: Double
)
