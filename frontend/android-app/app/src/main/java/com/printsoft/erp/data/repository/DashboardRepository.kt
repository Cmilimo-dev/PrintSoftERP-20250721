package com.printsoft.erp.data.repository

import com.printsoft.erp.data.api.ERPApiService
import com.printsoft.erp.data.models.DashboardStats
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepository @Inject constructor(
    private val apiService: ERPApiService
) {
    
    suspend fun getDashboardStats(): Result<Map<String, Any>> {
        return try {
            val response = apiService.getDashboardStats()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Convert DashboardStats to Map for easier handling
                    val stats = apiResponse.data
                    val statsMap = mapOf(
                        "orders" to mapOf(
                            "totalOrders" to stats.orders.totalOrders,
                            "totalRevenue" to stats.orders.totalRevenue,
                            "ordersDueSoon" to stats.orders.ordersDueSoon,
                            "pendingOrders" to stats.orders.pendingOrders
                        ),
                        "inventory" to mapOf(
                            "totalProducts" to stats.inventory.totalProducts,
                            "totalCategories" to stats.inventory.totalCategories,
                            "totalWarehouses" to stats.inventory.totalWarehouses,
                            "totalInventoryValue" to stats.inventory.totalInventoryValue,
                            "lowStockItems" to stats.inventory.lowStockItems,
                            "outOfStockItems" to stats.inventory.outOfStockItems
                        ),
                        "financial" to mapOf(
                            "totalReceivables" to stats.financial.totalReceivables,
                            "totalPayables" to stats.financial.totalPayables,
                            "monthlyRevenue" to stats.financial.monthlyRevenue,
                            "monthlyExpenses" to stats.financial.monthlyExpenses
                        ),
                        "customers" to mapOf(
                            "totalCustomers" to stats.customers.totalCustomers,
                            "activeCustomers" to stats.customers.activeCustomers,
                            "newCustomersThisMonth" to stats.customers.newCustomersThisMonth
                        )
                    )
                    Result.success(statsMap)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to get dashboard stats"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getRecentActivities(): Result<List<Map<String, Any>>> {
        return try {
            val response = apiService.getRecentActivities()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    Result.success(apiResponse.data)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to get recent activities"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
