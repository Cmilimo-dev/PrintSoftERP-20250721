package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.*
import kotlinx.coroutines.flow.Flow

// Credit Note DAO
@Dao
interface CreditNoteDao {
    
    @Query("SELECT * FROM credit_notes ORDER BY credit_date DESC")
    fun getAllCreditNotes(): Flow<List<CreditNote>>
    
    @Query("SELECT * FROM credit_notes WHERE id = :id")
    suspend fun getCreditNoteById(id: String): CreditNote?
    
    @Query("SELECT * FROM credit_notes WHERE customer_id = :customerId ORDER BY credit_date DESC")
    fun getCreditNotesByCustomer(customerId: String): Flow<List<CreditNote>>
    
    @Query("SELECT * FROM credit_notes WHERE invoice_id = :invoiceId ORDER BY credit_date DESC")
    fun getCreditNotesByInvoice(invoiceId: String): Flow<List<CreditNote>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCreditNote(creditNote: CreditNote)
    
    @Update
    suspend fun updateCreditNote(creditNote: CreditNote)
    
    @Delete
    suspend fun deleteCreditNote(creditNote: CreditNote)
    
    @Query("DELETE FROM credit_notes WHERE id = :id")
    suspend fun deleteCreditNoteById(id: String)
}

// Purchase Receipt DAO
@Dao
interface PurchaseReceiptDao {
    
    @Query("SELECT * FROM purchase_receipts ORDER BY receipt_date DESC")
    fun getAllPurchaseReceipts(): Flow<List<PurchaseReceipt>>
    
    @Query("SELECT * FROM purchase_receipts WHERE id = :id")
    suspend fun getPurchaseReceiptById(id: String): PurchaseReceipt?
    
    @Query("SELECT * FROM purchase_receipts WHERE vendor_id = :vendorId ORDER BY receipt_date DESC")
    fun getPurchaseReceiptsByVendor(vendorId: String): Flow<List<PurchaseReceipt>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseReceipt(purchaseReceipt: PurchaseReceipt)
    
    @Update
    suspend fun updatePurchaseReceipt(purchaseReceipt: PurchaseReceipt)
    
    @Delete
    suspend fun deletePurchaseReceipt(purchaseReceipt: PurchaseReceipt)
}

// Proforma Invoice DAO
@Dao
interface ProformaInvoiceDao {
    
    @Query("SELECT * FROM proforma_invoices ORDER BY proforma_date DESC")
    fun getAllProformaInvoices(): Flow<List<ProformaInvoice>>
    
    @Query("SELECT * FROM proforma_invoices WHERE id = :id")
    suspend fun getProformaInvoiceById(id: String): ProformaInvoice?
    
    @Query("SELECT * FROM proforma_invoices WHERE customer_id = :customerId ORDER BY proforma_date DESC")
    fun getProformaInvoicesByCustomer(customerId: String): Flow<List<ProformaInvoice>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProformaInvoice(proformaInvoice: ProformaInvoice)
    
    @Update
    suspend fun updateProformaInvoice(proformaInvoice: ProformaInvoice)
    
    @Delete
    suspend fun deleteProformaInvoice(proformaInvoice: ProformaInvoice)
}

// Delivery Note DAO
@Dao
interface DeliveryNoteDao {
    
    @Query("SELECT * FROM delivery_notes ORDER BY delivery_date DESC")
    fun getAllDeliveryNotes(): Flow<List<DeliveryNote>>
    
    @Query("SELECT * FROM delivery_notes WHERE id = :id")
    suspend fun getDeliveryNoteById(id: String): DeliveryNote?
    
    @Query("SELECT * FROM delivery_notes WHERE sales_order_id = :salesOrderId ORDER BY delivery_date DESC")
    fun getDeliveryNotesBySalesOrder(salesOrderId: String): Flow<List<DeliveryNote>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDeliveryNote(deliveryNote: DeliveryNote)
    
    @Update
    suspend fun updateDeliveryNote(deliveryNote: DeliveryNote)
    
    @Delete
    suspend fun deleteDeliveryNote(deliveryNote: DeliveryNote)
}

// Document Workflow DAO
@Dao
interface DocumentWorkflowDao {
    
    @Query("SELECT * FROM document_workflows ORDER BY created_at DESC")
    fun getAllWorkflows(): Flow<List<DocumentWorkflow>>
    
    @Query("SELECT * FROM document_workflows WHERE id = :id")
    suspend fun getWorkflowById(id: String): DocumentWorkflow?
    
    @Query("SELECT * FROM document_workflows WHERE document_id = :documentId")
    suspend fun getWorkflowByDocumentId(documentId: String): DocumentWorkflow?
    
    @Query("SELECT * FROM document_workflows WHERE document_type = :documentType")
    fun getWorkflowsByDocumentType(documentType: String): Flow<List<DocumentWorkflow>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkflow(workflow: DocumentWorkflow)
    
    @Update
    suspend fun updateWorkflow(workflow: DocumentWorkflow)
    
    @Delete
    suspend fun deleteWorkflow(workflow: DocumentWorkflow)
}

// Document Conversion DAO
@Dao
interface DocumentConversionDao {
    
    @Query("SELECT * FROM document_conversions ORDER BY conversion_date DESC")
    fun getAllConversions(): Flow<List<DocumentConversion>>
    
    @Query("SELECT * FROM document_conversions WHERE id = :id")
    suspend fun getConversionById(id: String): DocumentConversion?
    
    @Query("SELECT * FROM document_conversions WHERE source_document_id = :sourceId")
    fun getConversionsBySourceDocument(sourceId: String): Flow<List<DocumentConversion>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConversion(conversion: DocumentConversion)
    
    @Delete
    suspend fun deleteConversion(conversion: DocumentConversion)
}

// Document Status History DAO
@Dao
interface DocumentStatusHistoryDao {
    
    @Query("SELECT * FROM document_status_history ORDER BY change_date DESC")
    fun getAllStatusHistory(): Flow<List<DocumentStatusHistory>>
    
    @Query("SELECT * FROM document_status_history WHERE document_id = :documentId ORDER BY change_date DESC")
    fun getStatusHistoryByDocument(documentId: String): Flow<List<DocumentStatusHistory>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStatusHistory(statusHistory: DocumentStatusHistory)
    
    @Delete
    suspend fun deleteStatusHistory(statusHistory: DocumentStatusHistory)
}

// Document Template DAO
@Dao
interface DocumentTemplateDao {
    
    @Query("SELECT * FROM document_templates WHERE is_active = 1 ORDER BY name ASC")
    fun getAllActiveTemplates(): Flow<List<DocumentTemplate>>
    
    @Query("SELECT * FROM document_templates WHERE document_type = :documentType AND is_active = 1")
    fun getTemplatesByType(documentType: String): Flow<List<DocumentTemplate>>
    
    @Query("SELECT * FROM document_templates WHERE document_type = :documentType AND is_default = 1 AND is_active = 1 LIMIT 1")
    suspend fun getDefaultTemplate(documentType: String): DocumentTemplate?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTemplate(template: DocumentTemplate)
    
    @Update
    suspend fun updateTemplate(template: DocumentTemplate)
    
    @Delete
    suspend fun deleteTemplate(template: DocumentTemplate)
}

// Document Attachment DAO
@Dao
interface DocumentAttachmentDao {
    
    @Query("SELECT * FROM document_attachments ORDER BY uploaded_at DESC")
    fun getAllAttachments(): Flow<List<DocumentAttachment>>
    
    @Query("SELECT * FROM document_attachments WHERE document_id = :documentId ORDER BY uploaded_at DESC")
    fun getAttachmentsByDocument(documentId: String): Flow<List<DocumentAttachment>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttachment(attachment: DocumentAttachment)
    
    @Delete
    suspend fun deleteAttachment(attachment: DocumentAttachment)
    
    @Query("DELETE FROM document_attachments WHERE document_id = :documentId")
    suspend fun deleteAttachmentsByDocument(documentId: String)
}
