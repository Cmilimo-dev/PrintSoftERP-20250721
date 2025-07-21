package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.repository.CustomerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CustomersViewModel @Inject constructor(
    private val customerRepository: CustomerRepository
) : ViewModel() {

    private val _customers = MutableStateFlow<List<Map<String, Any>>>(emptyList())
    val customers: StateFlow<List<Map<String, Any>>> = _customers

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    init {
        loadCustomers()
    }

    private fun loadCustomers() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = customerRepository.getCustomers()
                result.fold(
                    onSuccess = { customerList ->
                        _customers.value = customerList.map { customer ->
                            mapOf(
                                "id" to customer.id,
                                "name" to customer.name,
                                "email" to (customer.email ?: "N/A"),
                                "phone" to (customer.phone ?: "N/A"),
                                "address" to (customer.address ?: "N/A"),
                                "customerType" to (customer.customerType ?: "individual"),
                                "creditLimit" to (customer.creditLimit ?: 0.0),
                                "status" to (customer.status ?: "active")
                            )
                        }
                    },
                    onFailure = { exception ->
                        _error.value = exception.message
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }

    fun refreshCustomers() {
        loadCustomers()
    }

    fun searchCustomers(query: String) {
        viewModelScope.launch {
            try {
                val result = customerRepository.searchCustomers(query)
                result.fold(
                    onSuccess = { customerList ->
                        _customers.value = customerList.map { customer ->
                            mapOf(
                                "id" to customer.id,
                                "name" to customer.name,
                                "email" to (customer.email ?: "N/A"),
                                "phone" to (customer.phone ?: "N/A"),
                                "address" to (customer.address ?: "N/A"),
                                "customerType" to (customer.customerType ?: "individual"),
                                "creditLimit" to (customer.creditLimit ?: 0.0),
                                "status" to (customer.status ?: "active")
                            )
                        }
                    },
                    onFailure = { exception ->
                        _error.value = exception.message
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}
