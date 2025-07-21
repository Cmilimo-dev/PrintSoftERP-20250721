package com.printsoft.erp.ui.screens.inventory

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.printsoft.erp.ui.viewmodel.InventoryViewModel
import com.printsoft.erp.data.model.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    navController: NavHostController,
    viewModel: InventoryViewModel = hiltViewModel()
) {
    val products by viewModel.products.collectAsState()
    val stockMovements by viewModel.stockMovements.collectAsState()
    val warehouses by viewModel.warehouses.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val inventoryStats by viewModel.inventoryStats.collectAsState()
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Products", "Stock Movements", "Warehouses", "Categories")
    
    var showDialog by remember { mutableStateOf(false) }
    var editingItem by remember { mutableStateOf<Any?>(null) }
    
    // Show error messages
    LaunchedEffect(error) {
        error?.let {
            // Show error snackbar
            viewModel.clearError()
        }
    }

    // Dialog handling
    if (showDialog) {
        AlertDialog(
            onDismissRequest = { 
                showDialog = false
                editingItem = null
            },
            title = { Text("${if (editingItem == null) "Create" else "Edit"} ${getTabTitle(selectedTab)}") },
            text = {
                when (selectedTab) {
                    0 -> ProductForm(
                        product = editingItem as? Product,
                        categories = categories,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    1 -> StockMovementForm(
                        movement = editingItem as? StockMovement,
                        products = products,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    2 -> WarehouseForm(
                        warehouse = editingItem as? Warehouse,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    3 -> CategoryForm(
                        category = editingItem as? ProductCategory,
                        categories = categories,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                }
            },
            confirmButton = {},
            dismissButton = {}
        )
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingItem = null
                    showDialog = true
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add New")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                text = "Inventory Management",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Inventory stats summary
            inventoryStats?.let { stats ->
                InventoryStatsCard(stats)
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            if (loading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                when (selectedTab) {
                    0 -> ProductsList(products, viewModel) { product ->
                        editingItem = product
                        showDialog = true
                    }
                    1 -> StockMovementsList(stockMovements, products, viewModel)
                    2 -> WarehousesList(warehouses, viewModel) { warehouse ->
                        editingItem = warehouse
                        showDialog = true
                    }
                    3 -> CategoriesList(categories, viewModel) { category ->
                        editingItem = category
                        showDialog = true
                    }
                }
            }
        }
    }
}

@Composable
fun InventoryStatsCard(stats: InventoryStats) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Inventory Overview",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatsItem("Products", stats.totalProducts.toString())
                StatsItem("Categories", stats.totalCategories.toString())
                StatsItem("Low Stock", stats.lowStockItems.toString())
                StatsItem("Out of Stock", stats.outOfStockItems.toString())
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Total Value: $${String.format("%.2f", stats.totalInventoryValue)}",
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun StatsItem(label: String, value: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall
        )
    }
}

@Composable
fun ProductsList(
    products: List<Product>, 
    viewModel: InventoryViewModel,
    onEditProduct: (Product) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(products) { product ->
            ProductCard(product, viewModel, onEditProduct)
        }
    }
}

@Composable
fun ProductCard(
    product: Product, 
    viewModel: InventoryViewModel,
    onEditProduct: (Product) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onEditProduct(product) }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(
                        text = if (product.currentStock <= product.minStock) "Low Stock" else "In Stock",
                        color = if (product.currentStock <= product.minStock) 
                            MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Code: ${product.itemCode}",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                text = "Category: ${product.category}",
                style = MaterialTheme.typography.bodyMedium
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Stock: ${product.currentStock} ${product.unit}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                
                Text(
                    text = "Price: $${product.sellPrice}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }

            product.description?.let { description ->
                if (description.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

@Composable
fun StockMovementsList(
    movements: List<StockMovement>,
    products: List<Product>,
    viewModel: InventoryViewModel
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(movements) { movement ->
            StockMovementCard(movement, products)
        }
    }
}

@Composable
fun StockMovementCard(movement: StockMovement, products: List<Product>) {
    val product = products.find { it.id == movement.productId }
    
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = product?.name ?: "Unknown Product",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(movement.movementType.uppercase())
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Quantity: ${if (movement.movementType == "out") "-" else "+"}${movement.quantity}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            movement.reason?.let { reason ->
                Text(
                    text = "Reason: $reason",
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Text(
                text = "Date: ${movement.movementDate}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun WarehousesList(
    warehouses: List<Warehouse>, 
    viewModel: InventoryViewModel,
    onEditWarehouse: (Warehouse) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(warehouses) { warehouse ->
            WarehouseCard(warehouse, onEditWarehouse)
        }
    }
}

@Composable
fun WarehouseCard(warehouse: Warehouse, onEditWarehouse: (Warehouse) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onEditWarehouse(warehouse) }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = warehouse.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                if (warehouse.isDefault) {
                    Badge {
                        Text("Default")
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Code: ${warehouse.warehouseCode}",
                style = MaterialTheme.typography.bodyMedium
            )

            warehouse.address?.let { address ->
                Text(
                    text = "Address: $address",
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            warehouse.contact?.let { contact ->
                Text(
                    text = "Contact: $contact",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@Composable
fun CategoriesList(
    categories: List<ProductCategory>, 
    viewModel: InventoryViewModel,
    onEditCategory: (ProductCategory) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(categories) { category ->
            CategoryCard(category, onEditCategory)
        }
    }
}

@Composable
fun CategoryCard(category: ProductCategory, onEditCategory: (ProductCategory) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onEditCategory(category) }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = category.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Code: ${category.categoryCode}",
                style = MaterialTheme.typography.bodyMedium
            )

            category.description?.let { description ->
                if (description.isNotEmpty()) {
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

private fun getTabTitle(selectedTab: Int): String {
    return when (selectedTab) {
        0 -> "Product"
        1 -> "Stock Movement"
        2 -> "Warehouse"
        3 -> "Category"
        else -> "Item"
    }
}
