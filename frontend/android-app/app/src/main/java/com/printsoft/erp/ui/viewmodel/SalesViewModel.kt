package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.models.*
import com.printsoft.erp.data.repository.SalesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SalesViewModel @Inject constructor(
    private val salesRepository: SalesRepository
) : ViewModel() {

    // Loading states
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Sales Orders
    private val _salesOrders = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val salesOrders: StateFlow<List<Map<String, Any>>> = _salesOrders.asStateFlow()

    private val _selectedSalesOrder = MutableStateFlow<SalesOrder?>(null)
    val selectedSalesOrder: StateFlow<SalesOrder?> = _selectedSalesOrder.asStateFlow()

    // Quotations
    private val _quotations = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val quotations: StateFlow<List<Map<String, Any>>> = _quotations.asStateFlow()

    private val _selectedQuotation = MutableStateFlow<Quotation?>(null)
    val selectedQuotation: StateFlow<Quotation?> = _selectedQuotation.asStateFlow()

    // Invoices
    private val _invoices = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val invoices: StateFlow<List<Map<String, Any>>> = _invoices.asStateFlow()

    private val _selectedInvoice = MutableStateFlow<Invoice?>(null)
    val selectedInvoice: StateFlow<Invoice?> = _selectedInvoice.asStateFlow()

    // Delivery Notes
    private val _deliveryNotes = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val deliveryNotes: StateFlow<List<Map<String, Any>>> = _deliveryNotes.asStateFlow()

    private val _selectedDeliveryNote = MutableStateFlow<DeliveryNote?>(null)
    val selectedDeliveryNote: StateFlow<DeliveryNote?> = _selectedDeliveryNote.asStateFlow()

    // Search functionality
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // Filter functionality
    private val _selectedStatus = MutableStateFlow("all")
    val selectedStatus: StateFlow<String> = _selectedStatus.asStateFlow()

    // Business flow states
    private val _conversionResult = MutableStateFlow<String?>(null)
    val conversionResult: StateFlow<String?> = _conversionResult.asStateFlow()

    init {
        loadSalesData()
    }

    private fun loadSalesData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                loadSalesOrders()
                loadQuotations()
                loadInvoices()
                loadDeliveryNotes()
            } catch (e: Exception) {
                _error.value = "Error loading sales data: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Sales Orders Functions
    fun loadSalesOrders() {
        viewModelScope.launch {
            try {
                salesRepository.getAllSalesOrders().collect { orders ->
                    _salesOrders.value = orders.map { order ->
                        mapOf(
                            "id" to order.id,
                            "orderNumber" to order.orderNumber,
                            "customerId" to order.customerId,
                            "customerName" to "Customer ${order.customerId}", // Replace with actual customer lookup
                            "status" to order.status,
                            "orderDate" to order.orderDate,
                            "expectedDeliveryDate" to (order.expectedDeliveryDate ?: ""),
                            "subtotal" to order.subtotal,
                            "taxAmount" to order.taxAmount,
                            "totalAmount" to order.totalAmount,
                            "notes" to (order.notes ?: ""),
                            "createdAt" to order.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading sales orders: ${e.message}"
            }
        }
    }

    fun createSalesOrder(salesOrder: SalesOrder) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.createSalesOrder(salesOrder)
                if (result.isSuccess) {
                    loadSalesOrders() // Refresh the list
                    _conversionResult.value = "Sales order created successfully"
                } else {
                    _error.value = "Failed to create sales order"
                }
            } catch (e: Exception) {
                _error.value = "Error creating sales order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateSalesOrder(salesOrder: SalesOrder) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.updateSalesOrder(salesOrder)
                if (result.isSuccess) {
                    loadSalesOrders()
                    _conversionResult.value = "Sales order updated successfully"
                } else {
                    _error.value = "Failed to update sales order"
                }
            } catch (e: Exception) {
                _error.value = "Error updating sales order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteSalesOrder(id: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.deleteSalesOrder(id)
                if (result.isSuccess) {
                    loadSalesOrders()
                    _conversionResult.value = "Sales order deleted successfully"
                } else {
                    _error.value = "Failed to delete sales order"
                }
            } catch (e: Exception) {
                _error.value = "Error deleting sales order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun getSalesOrderById(id: String) {
        viewModelScope.launch {
            try {
                val order = salesRepository.getSalesOrderById(id)
                _selectedSalesOrder.value = order
            } catch (e: Exception) {
                _error.value = "Error getting sales order: ${e.message}"
            }
        }
    }

    // Quotations Functions
    fun loadQuotations() {
        viewModelScope.launch {
            try {
                salesRepository.getAllQuotations().collect { quotations ->
                    _quotations.value = quotations.map { quotation ->
                        mapOf(
                            "id" to quotation.id,
                            "quotationNumber" to quotation.quotationNumber,
                            "customerId" to quotation.customerId,
                            "customerName" to "Customer ${quotation.customerId}", // Replace with actual customer lookup
                            "status" to quotation.status,
                            "quotationDate" to quotation.quotationDate,
                            "validUntil" to (quotation.validUntil ?: ""),
                            "subtotal" to quotation.subtotal,
                            "taxAmount" to quotation.taxAmount,
                            "totalAmount" to quotation.totalAmount,
                            "notes" to (quotation.notes ?: ""),
                            "termsAndConditions" to (quotation.termsAndConditions ?: ""),
                            "createdAt" to quotation.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading quotations: ${e.message}"
            }
        }
    }

    fun createQuotation(quotation: Quotation) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.createQuotation(quotation)
                if (result.isSuccess) {
                    loadQuotations()
                    _conversionResult.value = "Quotation created successfully"
                } else {
                    _error.value = "Failed to create quotation"
                }
            } catch (e: Exception) {
                _error.value = "Error creating quotation: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateQuotation(quotation: Quotation) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.updateQuotation(quotation)
                if (result.isSuccess) {
                    loadQuotations()
                    _conversionResult.value = "Quotation updated successfully"
                } else {
                    _error.value = "Failed to update quotation"
                }
            } catch (e: Exception) {
                _error.value = "Error updating quotation: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteQuotation(id: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.deleteQuotation(id)
                if (result.isSuccess) {
                    loadQuotations()
                    _conversionResult.value = "Quotation deleted successfully"
                } else {
                    _error.value = "Failed to delete quotation"
                }
            } catch (e: Exception) {
                _error.value = "Error deleting quotation: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Invoices Functions
    fun loadInvoices() {
        viewModelScope.launch {
            try {
                salesRepository.getAllInvoices().collect { invoices ->
                    _invoices.value = invoices.map { invoice ->
                        mapOf(
                            "id" to invoice.id,
                            "invoiceNumber" to invoice.invoiceNumber,
                            "customerId" to invoice.customerId,
                            "customerName" to "Customer ${invoice.customerId}", // Replace with actual customer lookup
                            "salesOrderId" to (invoice.salesOrderId ?: ""),
                            "status" to invoice.status,
                            "invoiceDate" to invoice.invoiceDate,
                            "dueDate" to invoice.dueDate,
                            "subtotal" to invoice.subtotal,
                            "taxAmount" to invoice.taxAmount,
                            "totalAmount" to invoice.totalAmount,
                            "paidAmount" to invoice.paidAmount,
                            "notes" to (invoice.notes ?: ""),
                            "createdAt" to invoice.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading invoices: ${e.message}"
            }
        }
    }

    fun createInvoice(invoice: Invoice) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.createInvoice(invoice)
                if (result.isSuccess) {
                    loadInvoices()
                    _conversionResult.value = "Invoice created successfully"
                } else {
                    _error.value = "Failed to create invoice"
                }
            } catch (e: Exception) {
                _error.value = "Error creating invoice: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateInvoice(invoice: Invoice) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.updateInvoice(invoice)
                if (result.isSuccess) {
                    loadInvoices()
                    _conversionResult.value = "Invoice updated successfully"
                } else {
                    _error.value = "Failed to update invoice"
                }
            } catch (e: Exception) {
                _error.value = "Error updating invoice: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Delivery Notes Functions
    fun loadDeliveryNotes() {
        viewModelScope.launch {
            try {
                salesRepository.getAllDeliveryNotes().collect { notes: List<DeliveryNote> ->
                    _deliveryNotes.value = notes.map { note: DeliveryNote ->
                        mapOf(
                            "id" to note.id,
                            "deliveryNumber" to note.deliveryNumber,
                            "salesOrderId" to note.salesOrderId,
                            "customerId" to note.customerId,
                            "customerName" to "Customer ${note.customerId}", // Replace with actual customer lookup
                            "status" to note.status,
                            "deliveryDate" to note.deliveryDate,
                            "deliveryAddress" to (note.deliveryAddress ?: ""),
                            "deliveredBy" to (note.deliveredBy ?: ""),
                            "recipientName" to (note.recipientName ?: ""),
                            "notes" to (note.notes ?: ""),
                            "createdAt" to note.createdAt
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error loading delivery notes: ${e.message}"
            }
        }
    }

    fun createDeliveryNote(deliveryNote: DeliveryNote) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.createDeliveryNote(deliveryNote)
                if (result.isSuccess) {
                    loadDeliveryNotes()
                    _conversionResult.value = "Delivery note created successfully"
                } else {
                    _error.value = "Failed to create delivery note"
                }
            } catch (e: Exception) {
                _error.value = "Error creating delivery note: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateDeliveryNote(deliveryNote: DeliveryNote) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.updateDeliveryNote(deliveryNote)
                if (result.isSuccess) {
                    loadDeliveryNotes()
                    _conversionResult.value = "Delivery note updated successfully"
                } else {
                    _error.value = "Failed to update delivery note"
                }
            } catch (e: Exception) {
                _error.value = "Error updating delivery note: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Business Flow Functions
    fun convertQuotationToSalesOrder(quotationId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.convertQuotationToSalesOrder(quotationId)
                if (result.isSuccess) {
                    loadSalesOrders()
                    loadQuotations() // Refresh both lists
                    _conversionResult.value = "Quotation converted to sales order successfully"
                } else {
                    _error.value = "Failed to convert quotation to sales order"
                }
            } catch (e: Exception) {
                _error.value = "Error converting quotation: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun convertSalesOrderToInvoice(salesOrderId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.convertSalesOrderToInvoice(salesOrderId)
                if (result.isSuccess) {
                    loadInvoices()
                    loadSalesOrders() // Refresh both lists
                    _conversionResult.value = "Sales order converted to invoice successfully"
                } else {
                    _error.value = "Failed to convert sales order to invoice"
                }
            } catch (e: Exception) {
                _error.value = "Error converting sales order: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun createDeliveryNoteFromSalesOrder(salesOrderId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = salesRepository.createDeliveryNoteFromSalesOrder(salesOrderId)
                if (result.isSuccess) {
                    loadDeliveryNotes()
                    _conversionResult.value = "Delivery note created from sales order successfully"
                } else {
                    _error.value = "Failed to create delivery note from sales order"
                }
            } catch (e: Exception) {
                _error.value = "Error creating delivery note: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    // Search Functions
    fun searchSalesOrders(query: String) {
        viewModelScope.launch {
            _searchQuery.value = query
            try {
                val results = salesRepository.searchSalesOrders(query)
                _salesOrders.value = results.map { order ->
                    mapOf(
                        "id" to order.id,
                        "orderNumber" to order.orderNumber,
                        "customerId" to order.customerId,
                        "customerName" to "Customer ${order.customerId}",
                        "status" to order.status,
                        "orderDate" to order.orderDate,
                        "totalAmount" to order.totalAmount,
                        "notes" to (order.notes ?: "")
                    )
                }
            } catch (e: Exception) {
                _error.value = "Error searching sales orders: ${e.message}"
            }
        }
    }

    fun searchQuotations(query: String) {
        viewModelScope.launch {
            _searchQuery.value = query
            try {
                val results = salesRepository.searchQuotations(query)
                _quotations.value = results.map { quotation ->
                    mapOf(
                        "id" to quotation.id,
                        "quotationNumber" to quotation.quotationNumber,
                        "customerId" to quotation.customerId,
                        "customerName" to "Customer ${quotation.customerId}",
                        "status" to quotation.status,
                        "quotationDate" to quotation.quotationDate,
                        "validUntil" to (quotation.validUntil ?: ""),
                        "totalAmount" to quotation.totalAmount
                    )
                }
            } catch (e: Exception) {
                _error.value = "Error searching quotations: ${e.message}"
            }
        }
    }

    fun searchInvoices(query: String) {
        viewModelScope.launch {
            _searchQuery.value = query
            try {
                val results = salesRepository.searchInvoices(query)
                _invoices.value = results.map { invoice ->
                    mapOf(
                        "id" to invoice.id,
                        "invoiceNumber" to invoice.invoiceNumber,
                        "customerId" to invoice.customerId,
                        "customerName" to "Customer ${invoice.customerId}",
                        "status" to invoice.status,
                        "invoiceDate" to invoice.invoiceDate,
                        "dueDate" to invoice.dueDate,
                        "totalAmount" to invoice.totalAmount,
                        "paidAmount" to invoice.paidAmount
                    )
                }
            } catch (e: Exception) {
                _error.value = "Error searching invoices: ${e.message}"
            }
        }
    }

    // Filter Functions
    fun filterSalesOrdersByStatus(status: String) {
        viewModelScope.launch {
            _selectedStatus.value = status
            try {
                if (status == "all") {
                    loadSalesOrders()
                } else {
                    val results = salesRepository.getSalesOrdersByStatus(status)
                    _salesOrders.value = results.map { order ->
                        mapOf(
                            "id" to order.id,
                            "orderNumber" to order.orderNumber,
                            "customerId" to order.customerId,
                            "customerName" to "Customer ${order.customerId}",
                            "status" to order.status,
                            "orderDate" to order.orderDate,
                            "totalAmount" to order.totalAmount
                        )
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error filtering sales orders: ${e.message}"
            }
        }
    }

    // Refresh Functions
    fun refreshSalesData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                salesRepository.syncSalesData()
                loadSalesData()
                _conversionResult.value = "Sales data refreshed successfully"
            } catch (e: Exception) {
                _error.value = "Error refreshing sales data: ${e.message}"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun clearConversionResult() {
        _conversionResult.value = null
    }
}
