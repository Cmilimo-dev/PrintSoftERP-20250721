package com.printsoft.erp.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "products")
data class Product(
    @PrimaryKey val id: String,
    @SerializedName("item_code") val itemCode: String,
    val name: String,
    val description: String? = null,
    val category: String,
    val unit: String,
    @SerializedName("current_stock") val currentStock: Int,
    @SerializedName("min_stock") val minStock: Int,
    @SerializedName("max_stock") val maxStock: Int? = null,
    @SerializedName("unit_cost") val unitCost: Double,
    @SerializedName("sell_price") val sellPrice: Double,
    val location: String? = null,
    val barcode: String? = null,
    @SerializedName("supplier_id") val supplierId: String? = null,
    @SerializedName("reorder_level") val reorderLevel: Int? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "stock_movements")
data class StockMovement(
    @PrimaryKey val id: String,
    @SerializedName("product_id") val productId: String,
    @SerializedName("movement_type") val movementType: String, // 'in' | 'out' | 'adjustment' | 'transfer'
    val quantity: Int,
    @SerializedName("reference_type") val referenceType: String? = null, // 'purchase_order' | 'sales_order' | 'adjustment' | 'transfer'
    @SerializedName("reference_id") val referenceId: String? = null,
    @SerializedName("reference_number") val referenceNumber: String? = null,
    val reason: String? = null,
    val notes: String? = null,
    @SerializedName("from_location") val fromLocation: String? = null,
    @SerializedName("to_location") val toLocation: String? = null,
    @SerializedName("unit_cost") val unitCost: Double? = null,
    @SerializedName("total_cost") val totalCost: Double? = null,
    @SerializedName("movement_date") val movementDate: String,
    @SerializedName("created_by") val createdBy: String? = null,
    @SerializedName("created_at") val createdAt: String
)

@Entity(tableName = "stock_adjustments")
data class StockAdjustment(
    @PrimaryKey val id: String,
    @SerializedName("adjustment_number") val adjustmentNumber: String,
    @SerializedName("adjustment_date") val adjustmentDate: String,
    @SerializedName("adjustment_type") val adjustmentType: String, // 'increase' | 'decrease' | 'recount'
    val reason: String,
    val status: String, // 'draft' | 'approved' | 'completed'
    val notes: String? = null,
    @SerializedName("created_by") val createdBy: String? = null,
    @SerializedName("approved_by") val approvedBy: String? = null,
    @SerializedName("approved_at") val approvedAt: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "stock_adjustment_items")
data class StockAdjustmentItem(
    @PrimaryKey val id: String,
    @SerializedName("adjustment_id") val adjustmentId: String,
    @SerializedName("product_id") val productId: String,
    @SerializedName("current_quantity") val currentQuantity: Int,
    @SerializedName("adjusted_quantity") val adjustedQuantity: Int,
    @SerializedName("difference") val difference: Int,
    @SerializedName("unit_cost") val unitCost: Double,
    @SerializedName("total_cost") val totalCost: Double,
    val reason: String? = null
)

@Entity(tableName = "warehouses")
data class Warehouse(
    @PrimaryKey val id: String,
    @SerializedName("warehouse_code") val warehouseCode: String,
    val name: String,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    @SerializedName("postal_code") val postalCode: String? = null,
    val country: String? = null,
    val contact: String? = null,
    val phone: String? = null,
    val email: String? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("is_default") val isDefault: Boolean = false,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "product_categories")
data class ProductCategory(
    @PrimaryKey val id: String,
    @SerializedName("category_code") val categoryCode: String,
    val name: String,
    val description: String? = null,
    @SerializedName("parent_category_id") val parentCategoryId: String? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "stock_levels")
data class StockLevel(
    @PrimaryKey val id: String,
    @SerializedName("product_id") val productId: String,
    @SerializedName("warehouse_id") val warehouseId: String,
    @SerializedName("available_quantity") val availableQuantity: Int,
    @SerializedName("reserved_quantity") val reservedQuantity: Int,
    @SerializedName("total_quantity") val totalQuantity: Int,
    @SerializedName("min_stock") val minStock: Int,
    @SerializedName("max_stock") val maxStock: Int? = null,
    @SerializedName("reorder_level") val reorderLevel: Int,
    @SerializedName("last_updated") val lastUpdated: String
)

// Inventory Statistics and Reports
data class InventoryStats(
    @SerializedName("total_products") val totalProducts: Int,
    @SerializedName("total_categories") val totalCategories: Int,
    @SerializedName("low_stock_items") val lowStockItems: Int,
    @SerializedName("out_of_stock_items") val outOfStockItems: Int,
    @SerializedName("total_inventory_value") val totalInventoryValue: Double,
    @SerializedName("inventory_turnover") val inventoryTurnover: Double? = null
)

data class StockAlert(
    @SerializedName("product_id") val productId: String,
    @SerializedName("product_name") val productName: String,
    @SerializedName("current_stock") val currentStock: Int,
    @SerializedName("min_stock") val minStock: Int,
    @SerializedName("reorder_level") val reorderLevel: Int,
    @SerializedName("alert_type") val alertType: String, // 'low_stock' | 'out_of_stock' | 'overstock'
    @SerializedName("warehouse_name") val warehouseName: String? = null
)

data class InventoryValuation(
    @SerializedName("product_id") val productId: String,
    @SerializedName("product_name") val productName: String,
    val quantity: Int,
    @SerializedName("unit_cost") val unitCost: Double,
    @SerializedName("total_value") val totalValue: Double,
    val method: String // 'fifo' | 'lifo' | 'average'
)

// Search and Filter models
data class ProductSearchFilter(
    val query: String? = null,
    val category: String? = null,
    val warehouse: String? = null,
    @SerializedName("low_stock_only") val lowStockOnly: Boolean = false,
    @SerializedName("out_of_stock_only") val outOfStockOnly: Boolean = false,
    @SerializedName("active_only") val activeOnly: Boolean = true
)

data class StockMovementFilter(
    @SerializedName("product_id") val productId: String? = null,
    @SerializedName("movement_type") val movementType: String? = null,
    @SerializedName("date_from") val dateFrom: String? = null,
    @SerializedName("date_to") val dateTo: String? = null,
    @SerializedName("reference_type") val referenceType: String? = null
)
