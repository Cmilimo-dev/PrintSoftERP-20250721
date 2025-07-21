package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.repository.InventoryRepository
import com.printsoft.erp.data.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class InventoryViewModel @Inject constructor(
    private val repository: InventoryRepository
) : ViewModel() {

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> get() = _products

    private val _stockMovements = MutableStateFlow<List<StockMovement>>(emptyList())
    val stockMovements: StateFlow<List<StockMovement>> get() = _stockMovements

    private val _warehouses = MutableStateFlow<List<Warehouse>>(emptyList())
    val warehouses: StateFlow<List<Warehouse>> get() = _warehouses

    private val _categories = MutableStateFlow<List<ProductCategory>>(emptyList())
    val categories: StateFlow<List<ProductCategory>> get() = _categories

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> get() = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> get() = _error

    private val _inventoryStats = MutableStateFlow<InventoryStats?>(null)
    val inventoryStats: StateFlow<InventoryStats?> get() = _inventoryStats

    init {
        loadAllInventoryData()
    }

    private fun loadAllInventoryData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                _products.value = repository.getAllProducts().value
                _warehouses.value = repository.getAllWarehouses().value
                _categories.value = repository.getAllCategories().value
                _stockMovements.value = repository.getAllStockMovements().value
                _inventoryStats.value = repository.getInventoryStats()
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun refreshData() {
        viewModelScope.launch {
            _loading.value = true
            val result = repository.syncAllInventoryData()
            if (result.isSuccess) {
                loadAllInventoryData()
            } else {
                _error.value = result.exceptionOrNull()?.message
                _loading.value = false
            }
        }
    }

    fun createProduct(product: Product) {
        viewModelScope.launch {
            val result = repository.createProduct(product)
            if (result.isSuccess) {
                refreshData()
            } else {
                _error.value = result.exceptionOrNull()?.message
            }
        }
    }

    fun updateProduct(product: Product) {
        viewModelScope.launch {
            val result = repository.updateProduct(product)
            if (result.isSuccess) {
                refreshData()
            } else {
                _error.value = result.exceptionOrNull()?.message
            }
        }
    }

    fun createStockMovement(movement: StockMovement) {
        viewModelScope.launch {
            val result = repository.createStockMovement(movement)
            if (result.isSuccess) {
                refreshData()
            } else {
                _error.value = result.exceptionOrNull()?.message
            }
        }
    }

    fun updateStockMovement(stockMovement: StockMovement) {
        viewModelScope.launch {
            try {
                val result = repository.updateStockMovement(stockMovement)
                if (result.isSuccess) {
                    refreshData()
                } else {
                    _error.value = result.exceptionOrNull()?.message
                }
            } catch (e: Exception) {
                _error.value = "Failed to update stock movement: ${e.message}"
            }
        }
    }

    fun deleteStockMovement(movementId: String) {
        viewModelScope.launch {
            try {
                val result = repository.deleteStockMovement(movementId)
                if (result.isSuccess) {
                    refreshData()
                } else {
                    _error.value = result.exceptionOrNull()?.message
                }
            } catch (e: Exception) {
                _error.value = "Failed to delete stock movement: ${e.message}"
            }
        }
    }

    fun createWarehouse(warehouse: Warehouse) {
        viewModelScope.launch {
            val result = repository.createWarehouse(warehouse)
            if (result.isSuccess) {
                refreshData()
            } else {
                _error.value = result.exceptionOrNull()?.message
            }
        }
    }

    fun updateWarehouse(warehouse: Warehouse) {
        viewModelScope.launch {
            try {
                val result = repository.updateWarehouse(warehouse)
                if (result.isSuccess) {
                    refreshData()
                } else {
                    _error.value = result.exceptionOrNull()?.message
                }
            } catch (e: Exception) {
                _error.value = "Failed to update warehouse: ${e.message}"
            }
        }
    }

    fun deleteWarehouse(warehouseId: String) {
        viewModelScope.launch {
            try {
                val result = repository.deleteWarehouse(warehouseId)
                if (result.isSuccess) {
                    refreshData()
                } else {
                    _error.value = result.exceptionOrNull()?.message
                }
            } catch (e: Exception) {
                _error.value = "Failed to delete warehouse: ${e.message}"
            }
        }
    }

    fun createCategory(category: ProductCategory) {
        viewModelScope.launch {
            val result = repository.createCategory(category)
            if (result.isSuccess) {
                refreshData()
            } else {
                _error.value = result.exceptionOrNull()?.message
            }
        }
    }

    fun updateCategory(category: ProductCategory) {
        viewModelScope.launch {
            try {
                val result = repository.updateCategory(category)
                if (result.isSuccess) {
                    refreshData()
                } else {
                    _error.value = result.exceptionOrNull()?.message
                }
            } catch (e: Exception) {
                _error.value = "Failed to update category: ${e.message}"
            }
        }
    }

    fun deleteCategory(categoryId: String) {
        viewModelScope.launch {
            try {
                val result = repository.deleteCategory(categoryId)
                if (result.isSuccess) {
                    refreshData()
                } else {
                    _error.value = result.exceptionOrNull()?.message
                }
            } catch (e: Exception) {
                _error.value = "Failed to delete category: ${e.message}"
            }
        }
    }
}
