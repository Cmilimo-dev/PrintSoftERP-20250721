package com.printsoft.erp.data.local.database

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import android.content.Context
import com.printsoft.erp.data.local.database.dao.*
import com.printsoft.erp.data.models.*

@Database(
    entities = [
        Customer::class,
        Vendor::class,
        Product::class,
        SalesOrder::class,
        Invoice::class,
        Quotation::class,
        PurchaseOrder::class,
        StockMovement::class,
        FinancialTransaction::class,
        ChartOfAccount::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class ERPDatabase : RoomDatabase() {
    
    abstract fun customerDao(): CustomerDao
    abstract fun vendorDao(): VendorDao
    abstract fun productDao(): ProductDao
    abstract fun salesOrderDao(): SalesOrderDao
    abstract fun invoiceDao(): InvoiceDao
    abstract fun quotationDao(): QuotationDao
    abstract fun purchaseOrderDao(): PurchaseOrderDao
    abstract fun stockMovementDao(): StockMovementDao
    abstract fun financialTransactionDao(): FinancialTransactionDao
    abstract fun chartOfAccountDao(): ChartOfAccountDao

    companion object {
        private const val DATABASE_NAME = "erp_database"

        fun create(context: Context): ERPDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                ERPDatabase::class.java,
                DATABASE_NAME
            )
            .fallbackToDestructiveMigration()
            .build()
        }
    }
}
