package com.printsoft.erp.data.repository

import com.printsoft.erp.data.local.dao.PurchaseDao
import com.printsoft.erp.data.local.database.dao.*
import com.printsoft.erp.data.models.*
import com.printsoft.erp.data.api.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PurchaseRepository @Inject constructor(
    private val apiService: ApiService,
    private val vendorDao: VendorDao,
    private val purchaseOrderDao: PurchaseOrderDao
) {
    
    // Vendors
    fun getAllVendors(): Flow<List<Vendor>> = vendorDao.getAllVendors()

    suspend fun getVendorById(id: String): Vendor? {
        return try {
            val apiResponse = apiService.getVendorById(id)
            apiResponse?.let { vendorDao.insertVendor(it) }
            apiResponse
        } catch (e: Exception) {
            vendorDao.getVendorById(id)
        }
    }

    suspend fun createVendor(vendor: Vendor): Result<Vendor> {
        return try {
            val createdVendor = apiService.createVendor(vendor)
            vendorDao.insertVendor(createdVendor)
            Result.success(createdVendor)
        } catch (e: Exception) {
            vendorDao.insertVendor(vendor)
            Result.success(vendor)
        }
    }

    suspend fun updateVendor(vendor: Vendor): Result<Vendor> {
        return try {
            val updatedVendor = apiService.updateVendor(vendor.id, vendor)
            vendorDao.updateVendor(updatedVendor)
            Result.success(updatedVendor)
        } catch (e: Exception) {
            vendorDao.updateVendor(vendor)
            Result.success(vendor)
        }
    }

    suspend fun deleteVendor(id: String): Result<Unit> {
        return try {
            apiService.deleteVendor(id)
            vendorDao.deleteVendorById(id)
            Result.success(Unit)
        } catch (e: Exception) {
            vendorDao.deleteVendorById(id)
            Result.success(Unit)
        }
    }

    // Purchase Orders
    fun getAllPurchaseOrders(): Flow<List<PurchaseOrder>> = purchaseOrderDao.getAllPurchaseOrders()

    suspend fun getPurchaseOrderById(id: String): PurchaseOrder? {
        return try {
            val apiResponse = apiService.getPurchaseOrderById(id)
            apiResponse?.let { purchaseOrderDao.insertPurchaseOrder(it) }
            apiResponse
        } catch (e: Exception) {
            purchaseOrderDao.getPurchaseOrderById(id)
        }
    }

    suspend fun createPurchaseOrder(purchaseOrder: PurchaseOrder): Result<PurchaseOrder> {
        return try {
            val createdPO = apiService.createPurchaseOrder(purchaseOrder)
            purchaseOrderDao.insertPurchaseOrder(createdPO)
            Result.success(createdPO)
        } catch (e: Exception) {
            purchaseOrderDao.insertPurchaseOrder(purchaseOrder)
            Result.success(purchaseOrder)
        }
    }

    suspend fun updatePurchaseOrder(purchaseOrder: PurchaseOrder): Result<PurchaseOrder> {
        return try {
            val updatedPO = apiService.updatePurchaseOrder(purchaseOrder.id, purchaseOrder)
            purchaseOrderDao.updatePurchaseOrder(updatedPO)
            Result.success(updatedPO)
        } catch (e: Exception) {
            purchaseOrderDao.updatePurchaseOrder(purchaseOrder)
            Result.success(purchaseOrder)
        }
    }

    suspend fun deletePurchaseOrder(id: String): Result<Unit> {
        return try {
            apiService.deletePurchaseOrder(id)
            purchaseOrderDao.deletePurchaseOrderById(id)
            Result.success(Unit)
        } catch (e: Exception) {
            purchaseOrderDao.deletePurchaseOrderById(id)
            Result.success(Unit)
        }
    }

    // Sync methods
    suspend fun syncPurchaseData(): Result<Unit> {
        return try {
            val vendors = apiService.getAllVendors()
            vendorDao.insertVendors(vendors)

            val purchaseOrders = apiService.getAllPurchaseOrders()
            purchaseOrderDao.insertPurchaseOrders(purchaseOrders)

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
