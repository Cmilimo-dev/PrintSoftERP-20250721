package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.model.*
import com.printsoft.erp.data.repository.PurchaseRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PurchaseViewModel @Inject constructor(
    private val purchaseRepository: PurchaseRepository
) : ViewModel() {

    // Loading states
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Vendors
    private val _vendors = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val vendors: StateFlow<List<Map<String, Any>>> = _vendors.asStateFlow()

    private val _selectedVendor = MutableStateFlow<Vendor?>(null)
    val selectedVendor: StateFlow<Vendor?> = _selectedVendor.asStateFlow()

    // Purchase Orders
    private val _purchaseOrders = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val purchaseOrders: StateFlow<List<Map<String, Any>>> = _purchaseOrders.asStateFlow()

    private val _selectedPurchaseOrder = MutableStateFlow<PurchaseOrder?>(null)
    val selectedPurchaseOrder: StateFlow<PurchaseOrder?> = _selectedPurchaseOrder.asStateFlow()

    // Purchase Receipts
    private val _purchaseReceipts = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val purchaseReceipts: StateFlow<List<Map<String, Any>>> = _purchaseReceipts.asStateFlow()

    private val _selectedPurchaseReceipt = MutableStateFlow<PurchaseReceipt?>(null)
    val selectedPurchaseReceipt: StateFlow<PurchaseReceipt?> = _selectedPurchaseReceipt.asStateFlow()

    // Purchase Invoices
    private val _purchaseInvoices = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val purchaseInvoices: StateFlow<List<Map<String, Any>>> = _purchaseInvoices.asStateFlow()

    private val _selectedPurchaseInvoice = MutableStateFlow<PurchaseInvoice?>(null)
    val selectedPurchaseInvoice: StateFlow<PurchaseInvoice?> = _selectedPurchaseInvoice.asStateFlow()

    // Search functionality
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // Filter functionality
    private val _selectedStatus = MutableStateFlow("all")
    val selectedStatus: StateFlow<String> = _selectedStatus.asStateFlow()

    private val _selectedApprovalStatus = MutableStateFlow("all")
    val selectedApprovalStatus: StateFlow<String> = _selectedApprovalStatus.asStateFlow()

    // Business flow states
    private val _operationResult = MutableStateFlow<String?>(null)
    val operationResult: StateFlow<String?> = _operationResult.asStateFlow()

    init {
        loadPurchaseData()
    }

    private fun loadPurchaseData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                loadVendors()
                loadPurchaseOrders()
                loadPurchaseReceipts()
                loadPurchaseInvoices()
            } catch (e: Exception) {
                _error.value = "Error loading purchase data: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Vendors Functions
    fun loadVendors() {
        viewModelScope.launch {
            try {
                purchaseRepository.getAllVendors().collect { vendors ->
                    _vendors.value = vendors.map { vendor ->
                        mapOf(
                            "id" to vendor.id,
                            "name" to vendor.name,
                            "email" to (vendor.email ?: ""),
                            "phone" to (vendor.phone ?: ""),
                            "address" to (vendor.address ?: ""),
                            "city" to (vendor.city ?: ""),
                            "state" to (vendor.state ?: ""),
                            "country" to (vendor.country ?: ""),
                            "paymentTerms" to (vendor.paymentTerms ?: ""),
                            "preferredCurrency" to (vendor.preferredCurrency ?: ""),
                            "leadTimeDays" to (vendor.leadTimeDays ?: 0),
                            "status" to vendor.status,
                            "capabilities" to (vendor.capabilities ?: ""),
                            "createdAt" to vendor.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading vendors: ${e.message}"
            }
        }
    }

    fun createVendor(vendor: Vendor) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.createVendor(vendor)
                if (result.isSuccess) {
                    loadVendors()
                    _operationResult.value = "Vendor created successfully"
                } else {
                    _error.value = "Failed to create vendor"
                }
            } catch (e: Exception) {
                _error.value = "Error creating vendor: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateVendor(vendor: Vendor) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.updateVendor(vendor)
                if (result.isSuccess) {
                    loadVendors()
                    _operationResult.value = "Vendor updated successfully"
                } else {
                    _error.value = "Failed to update vendor"
                }
            } catch (e: Exception) {
                _error.value = "Error updating vendor: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteVendor(id: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.deleteVendor(id)
                if (result.isSuccess) {
                    loadVendors()
                    _operationResult.value = "Vendor deleted successfully"
                } else {
                    _error.value = "Failed to delete vendor"
                }
            } catch (e: Exception) {
                _error.value = "Error deleting vendor: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun getVendorById(id: String) {
        viewModelScope.launch {
            try {
                val vendor = purchaseRepository.getVendorById(id)
                _selectedVendor.value = vendor
            } catch (e: Exception) {
                _error.value = "Error getting vendor: ${e.message}"
            }
        }
    }

    // Purchase Orders Functions
    fun loadPurchaseOrders() {
        viewModelScope.launch {
            try {
                purchaseRepository.getAllPurchaseOrders().collect { orders ->
                    _purchaseOrders.value = orders.map { order ->
                        mapOf(
                            "id" to order.id,
                            "poNumber" to order.poNumber,
                            "vendorId" to order.vendorId,
                            "vendorName" to "Vendor ${order.vendorId}", // Replace with actual vendor lookup
                            "orderDate" to order.orderDate,
                            "expectedDeliveryDate" to (order.expectedDeliveryDate ?: ""),
                            "status" to order.status,
                            "approvalStatus" to order.approvalStatus,
                            "subtotal" to order.subtotal,
                            "taxAmount" to order.taxAmount,
                            "totalAmount" to order.totalAmount,
                            "currency" to order.currency,
                            "notes" to (order.notes ?: ""),
                            "createdBy" to (order.createdBy ?: ""),
                            "approvedBy" to (order.approvedBy ?: ""),
                            "createdAt" to order.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading purchase orders: ${e.message}"
            }
        }
    }

    fun createPurchaseOrder(purchaseOrder: PurchaseOrder) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.createPurchaseOrder(purchaseOrder)
                if (result.isSuccess) {
                    loadPurchaseOrders()
                    _operationResult.value = "Purchase order created successfully"
                } else {
                    _error.value = "Failed to create purchase order"
                }
            } catch (e: Exception) {
                _error.value = "Error creating purchase order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updatePurchaseOrder(purchaseOrder: PurchaseOrder) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.updatePurchaseOrder(purchaseOrder)
                if (result.isSuccess) {
                    loadPurchaseOrders()
                    _operationResult.value = "Purchase order updated successfully"
                } else {
                    _error.value = "Failed to update purchase order"
                }
            } catch (e: Exception) {
                _error.value = "Error updating purchase order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deletePurchaseOrder(id: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.deletePurchaseOrder(id)
                if (result.isSuccess) {
                    loadPurchaseOrders()
                    _operationResult.value = "Purchase order deleted successfully"
                } else {
                    _error.value = "Failed to delete purchase order"
                }
            } catch (e: Exception) {
                _error.value = "Error deleting purchase order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun approvePurchaseOrder(id: String, approvedBy: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.approvePurchaseOrder(id, approvedBy)
                if (result.isSuccess) {
                    loadPurchaseOrders()
                    _operationResult.value = "Purchase order approved successfully"
                } else {
                    _error.value = "Failed to approve purchase order"
                }
            } catch (e: Exception) {
                _error.value = "Error approving purchase order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Purchase Receipts Functions
    fun loadPurchaseReceipts() {
        viewModelScope.launch {
            try {
                purchaseRepository.getAllPurchaseReceipts().collect { receipts ->
                    _purchaseReceipts.value = receipts.map { receipt ->
                        mapOf(
                            "id" to receipt.id,
                            "receiptNumber" to receipt.receiptNumber,
                            "purchaseOrderId" to receipt.purchaseOrderId,
                            "vendorId" to receipt.vendorId,
                            "vendorName" to "Vendor ${receipt.vendorId}", // Replace with actual vendor lookup
                            "receiptDate" to receipt.receiptDate,
                            "status" to receipt.status,
                            "receivedBy" to (receipt.receivedBy ?: ""),
                            "inspectionNotes" to (receipt.inspectionNotes ?: ""),
                            "qualityCheckStatus" to (receipt.qualityCheckStatus ?: ""),
                            "createdBy" to (receipt.createdBy ?: ""),
                            "createdAt" to receipt.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading purchase receipts: ${e.message}"
            }
        }
    }

    fun createPurchaseReceipt(receipt: PurchaseReceipt) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.createPurchaseReceipt(receipt)
                if (result.isSuccess) {
                    loadPurchaseReceipts()
                    _operationResult.value = "Purchase receipt created successfully"
                } else {
                    _error.value = "Failed to create purchase receipt"
                }
            } catch (e: Exception) {
                _error.value = "Error creating purchase receipt: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun createReceiptFromPurchaseOrder(purchaseOrderId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.createReceiptFromPurchaseOrder(purchaseOrderId)
                if (result.isSuccess) {
                    loadPurchaseReceipts()
                    _operationResult.value = "Receipt created from purchase order successfully"
                } else {
                    _error.value = "Failed to create receipt from purchase order"
                }
            } catch (e: Exception) {
                _error.value = "Error creating receipt: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Purchase Invoices Functions
    fun loadPurchaseInvoices() {
        viewModelScope.launch {
            try {
                purchaseRepository.getAllPurchaseInvoices().collect { invoices ->
                    _purchaseInvoices.value = invoices.map { invoice ->
                        mapOf(
                            "id" to invoice.id,
                            "invoiceNumber" to invoice.invoiceNumber,
                            "vendorInvoiceNumber" to (invoice.vendorInvoiceNumber ?: ""),
                            "purchaseOrderId" to invoice.purchaseOrderId,
                            "vendorId" to invoice.vendorId,
                            "vendorName" to "Vendor ${invoice.vendorId}", // Replace with actual vendor lookup
                            "invoiceDate" to invoice.invoiceDate,
                            "dueDate" to invoice.dueDate,
                            "status" to invoice.status,
                            "subtotal" to invoice.subtotal,
                            "taxAmount" to invoice.taxAmount,
                            "totalAmount" to invoice.totalAmount,
                            "paidAmount" to invoice.paidAmount,
                            "currency" to invoice.currency,
                            "paymentTerms" to (invoice.paymentTerms ?: ""),
                            "notes" to (invoice.notes ?: ""),
                            "approvedBy" to (invoice.approvedBy ?: ""),
                            "createdAt" to invoice.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading purchase invoices: ${e.message}"
            }
        }
    }

    fun createPurchaseInvoice(invoice: PurchaseInvoice) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.createPurchaseInvoice(invoice)
                if (result.isSuccess) {
                    loadPurchaseInvoices()
                    _operationResult.value = "Purchase invoice created successfully"
                } else {
                    _error.value = "Failed to create purchase invoice"
                }
            } catch (e: Exception) {
                _error.value = "Error creating purchase invoice: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun createInvoiceFromPurchaseOrder(purchaseOrderId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.createInvoiceFromPurchaseOrder(purchaseOrderId)
                if (result.isSuccess) {
                    loadPurchaseInvoices()
                    _operationResult.value = "Invoice created from purchase order successfully"
                } else {
                    _error.value = "Failed to create invoice from purchase order"
                }
            } catch (e: Exception) {
                _error.value = "Error creating invoice: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateInvoicePayment(invoiceId: String, paidAmount: Double, status: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = purchaseRepository.updateInvoicePayment(invoiceId, paidAmount, status)
                if (result.isSuccess) {
                    loadPurchaseInvoices()
                    _operationResult.value = "Invoice payment updated successfully"
                } else {
                    _error.value = "Failed to update invoice payment"
                }
            } catch (e: Exception) {
                _error.value = "Error updating invoice payment: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Search Functions
    fun searchVendors(query: String) {
        viewModelScope.launch {
            _searchQuery.value = query
            try {
                val results = purchaseRepository.searchVendors(query)
                _vendors.value = results.map { vendor ->
                    mapOf(
                        "id" to vendor.id,
                        "name" to vendor.name,
                        "email" to (vendor.email ?: ""),
                        "phone" to (vendor.phone ?: ""),
                        "status" to vendor.status
                    )
                }
            } catch (e: Exception) {
                _error.value = "Error searching vendors: ${e.message}"
            }
        }
    }

    fun searchPurchaseOrders(query: String) {
        viewModelScope.launch {
            _searchQuery.value = query
            try {
                val results = purchaseRepository.searchPurchaseOrders(query)
                _purchaseOrders.value = results.map { order ->
                    mapOf(
                        "id" to order.id,
                        "poNumber" to order.poNumber,
                        "vendorId" to order.vendorId,
                        "vendorName" to "Vendor ${order.vendorId}",
                        "status" to order.status,
                        "orderDate" to order.orderDate,
                        "totalAmount" to order.totalAmount
                    )
                }
            } catch (e: Exception) {
                _error.value = "Error searching purchase orders: ${e.message}"
            }
        }
    }

    // Filter Functions
    fun filterPurchaseOrdersByStatus(status: String) {
        viewModelScope.launch {
            _selectedStatus.value = status
            try {
                if (status == "all") {
                    loadPurchaseOrders()
                } else {
                    val results = purchaseRepository.getPurchaseOrdersByStatus(status)
                    _purchaseOrders.value = results.map { order ->
                        mapOf(
                            "id" to order.id,
                            "poNumber" to order.poNumber,
                            "vendorId" to order.vendorId,
                            "vendorName" to "Vendor ${order.vendorId}",
                            "status" to order.status,
                            "orderDate" to order.orderDate,
                            "totalAmount" to order.totalAmount
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error filtering purchase orders: ${e.message}"
            }
        }
    }

    fun filterPurchaseOrdersByApprovalStatus(approvalStatus: String) {
        viewModelScope.launch {
            _selectedApprovalStatus.value = approvalStatus
            try {
                if (approvalStatus == "all") {
                    loadPurchaseOrders()
                } else {
                    val results = purchaseRepository.getPurchaseOrdersByApprovalStatus(approvalStatus)
                    _purchaseOrders.value = results.map { order ->
                        mapOf(
                            "id" to order.id,
                            "poNumber" to order.poNumber,
                            "vendorId" to order.vendorId,
                            "vendorName" to "Vendor ${order.vendorId}",
                            "status" to order.status,
                            "approvalStatus" to order.approvalStatus,
                            "orderDate" to order.orderDate,
                            "totalAmount" to order.totalAmount
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error filtering purchase orders by approval status: ${e.message}"
            }
        }
    }

    // Refresh Functions
    fun refreshPurchaseData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                purchaseRepository.syncPurchaseData()
                loadPurchaseData()
                _operationResult.value = "Purchase data refreshed successfully"
            } catch (e: Exception) {
                _error.value = "Error refreshing purchase data: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun clearOperationResult() {
        _operationResult.value = null
    }
}
