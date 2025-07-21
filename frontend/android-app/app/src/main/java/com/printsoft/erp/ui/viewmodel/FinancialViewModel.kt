package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.repository.FinancialRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FinancialViewModel @Inject constructor(
    private val financialRepository: FinancialRepository
) : ViewModel() {

    private val _accountsState = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val accountsState: StateFlow<List<Map<String, Any>>> = _accountsState

    private val _invoicesState = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val invoicesState: StateFlow<List<Map<String, Any>>> = _invoicesState

    private val _loadingState = MutableStateFlow(false)
    val loadingState: StateFlow<Boolean> = _loadingState

    private val _errorState = MutableStateFlow<String?>(null)
    val errorState: StateFlow<String?> = _errorState

    init {
        loadFinancialData()
    }

    private fun loadFinancialData() {
        loadChartOfAccounts()
        loadInvoices()
    }

    private fun loadChartOfAccounts() {
        viewModelScope.launch {
            _loadingState.value = true
            try {
                val result = financialRepository.getChartOfAccounts()
                result.fold(
                    onSuccess = { accounts ->
                        _accountsState.value = accounts.map { account ->
                            mapOf(
                                "id" to account.id,
                                "accountCode" to account.accountCode,
                                "accountName" to account.accountName,
                                "accountType" to account.accountType,
                                "balance" to 0.0, // Default balance, should be calculated
                                "isActive" to account.isActive
                            )
                        }
                    },
                    onFailure = { exception ->
                        _errorState.value = exception.message
                    }
                )
            } catch (e: Exception) {
                _errorState.value = e.message
            } finally {
                _loadingState.value = false
            }
        }
    }

    private fun loadInvoices() {
        viewModelScope.launch {
            try {
                val result = financialRepository.getInvoices()
                result.fold(
                    onSuccess = { invoices ->
                        _invoicesState.value = invoices.map { invoice ->
                            mapOf(
                                "id" to invoice.id,
                                "invoiceNumber" to invoice.invoiceNumber,
                                "customerId" to invoice.customerId,
                                "invoiceDate" to invoice.invoiceDate,
                                "dueDate" to invoice.dueDate,
                                "status" to invoice.status,
                                "totalAmount" to invoice.totalAmount,
                                "paidAmount" to invoice.paidAmount
                            )
                        }
                    },
                    onFailure = { exception ->
                        _errorState.value = exception.message
                    }
                )
            } catch (e: Exception) {
                _errorState.value = e.message
            }
        }
    }

    fun refreshData() {
        loadFinancialData()
    }
}
