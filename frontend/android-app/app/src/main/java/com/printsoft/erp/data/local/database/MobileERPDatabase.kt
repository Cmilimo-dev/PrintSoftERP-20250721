package com.printsoft.erp.data.local.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.printsoft.erp.data.local.database.dao.*
import com.printsoft.erp.data.local.database.Converters

@Database(
    entities = [
        // Core entities from unified models package
        com.printsoft.erp.data.models.Customer::class,
        com.printsoft.erp.data.models.Vendor::class,
        com.printsoft.erp.data.models.Product::class,
        
        // Sales documents from unified models package
        com.printsoft.erp.data.models.SalesOrder::class,
        com.printsoft.erp.data.models.Invoice::class,
        com.printsoft.erp.data.models.Quotation::class,
        com.printsoft.erp.data.models.DeliveryNote::class,
        
        // Purchase documents from unified models package
        com.printsoft.erp.data.models.PurchaseOrder::class,
        com.printsoft.erp.data.models.PurchaseReceipt::class,
        com.printsoft.erp.data.models.PurchaseInvoice::class,
        
        // Financial documents from unified models package
        com.printsoft.erp.data.models.FinancialTransaction::class,
        com.printsoft.erp.data.models.ChartOfAccount::class,
        
        // Inventory from unified models package
        com.printsoft.erp.data.models.StockMovement::class,
        com.printsoft.erp.data.models.StockAdjustment::class,
        com.printsoft.erp.data.models.StockAdjustmentItem::class,
        com.printsoft.erp.data.models.Warehouse::class,
        com.printsoft.erp.data.models.ProductCategory::class,
        com.printsoft.erp.data.models.StockAlert::class,
        
        // Line items for various documents from unified models package
        com.printsoft.erp.data.models.SalesOrderItem::class,
        com.printsoft.erp.data.models.InvoiceItem::class,
        com.printsoft.erp.data.models.QuotationItem::class,
        com.printsoft.erp.data.models.DeliveryNoteItem::class,
        com.printsoft.erp.data.models.PurchaseOrderItem::class,
        com.printsoft.erp.data.models.PurchaseReceiptItem::class,
        
        // Additional models from unified models package
        com.printsoft.erp.data.models.PaymentReceipt::class,
        com.printsoft.erp.data.models.CreditNote::class,
        com.printsoft.erp.data.models.ProformaInvoice::class,
        com.printsoft.erp.data.models.ProformaInvoiceItem::class,
        com.printsoft.erp.data.models.DocumentWorkflow::class,
        com.printsoft.erp.data.models.DocumentConversion::class,
        com.printsoft.erp.data.models.DocumentStatusHistory::class,
        com.printsoft.erp.data.models.DocumentTemplate::class,
        com.printsoft.erp.data.models.DocumentAttachment::class
    ],
    version = 2,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class MobileERPDatabase : RoomDatabase() {

    // Core DAOs (existing)
    abstract fun customerDao(): CustomerDao
    abstract fun vendorDao(): VendorDao
    abstract fun productDao(): ProductDao
    
    // Sales document DAOs (existing)
    abstract fun salesOrderDao(): SalesOrderDao
    abstract fun invoiceDao(): InvoiceDao
    abstract fun quotationDao(): QuotationDao
    
    // Purchase document DAOs (existing)
    abstract fun purchaseOrderDao(): PurchaseOrderDao
    
    // Financial document DAOs (existing)
    abstract fun financialTransactionDao(): FinancialTransactionDao
    abstract fun chartOfAccountDao(): ChartOfAccountDao
    
    // Inventory DAOs (existing)
    abstract fun stockMovementDao(): StockMovementDao
    abstract fun stockAdjustmentDao(): StockAdjustmentDao
    abstract fun stockAdjustmentItemDao(): StockAdjustmentItemDao
    abstract fun warehouseDao(): WarehouseDao
    abstract fun productCategoryDao(): ProductCategoryDao
    abstract fun stockLevelDao(): StockLevelDao
    
    // Additional DAOs from DocumentDao
    abstract fun paymentReceiptDao(): PaymentReceiptDao
    abstract fun documentWorkflowDao(): DocumentWorkflowDao
    abstract fun documentStatusHistoryDao(): DocumentStatusHistoryDao
    abstract fun documentConversionDao(): DocumentConversionDao
    abstract fun creditNoteDao(): CreditNoteDao
    abstract fun purchaseReceiptDao(): PurchaseReceiptDao
    abstract fun proformaInvoiceDao(): ProformaInvoiceDao
    abstract fun deliveryNoteDao(): DeliveryNoteDao
    abstract fun documentTemplateDao(): DocumentTemplateDao
    abstract fun documentAttachmentDao(): DocumentAttachmentDao

    companion object {
        @Volatile private var INSTANCE: MobileERPDatabase? = null

        fun getInstance(context: Context): MobileERPDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MobileERPDatabase::class.java,
                    "mobile_erp_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
