package com.printsoft.erp.ui.screens.inventory

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.printsoft.erp.data.model.ProductCategory
import com.printsoft.erp.ui.viewmodel.InventoryViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun CategoryForm(
    category: ProductCategory?,
    categories: List<ProductCategory>,
    viewModel: InventoryViewModel,
    onClose: () -> Unit
) {
    var code by remember { mutableStateOf(category?.code ?: "") }
    var name by remember { mutableStateOf(category?.name ?: "") }
    var description by remember { mutableStateOf(category?.description ?: "") }
    var parentCategoryId by remember { mutableStateOf(category?.parentCategoryId ?: "") }
    var parentCategoryName by remember { mutableStateOf(category?.parentCategoryName ?: "") }
    var color by remember { mutableStateOf(category?.color ?: "#2196F3") }
    var isActive by remember { mutableStateOf(category?.isActive ?: true) }

    // Filter out current category and its children from parent options to prevent circular references
    val availableParentCategories = categories.filter { cat ->
        cat.id != category?.id && cat.parentCategoryId != category?.id
    }

    val predefinedColors = listOf(
        "#2196F3", "#4CAF50", "#FF9800", "#F44336", "#9C27B0",
        "#00BCD4", "#FFEB3B", "#795548", "#607D8B", "#E91E63"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (category == null) "Create Category" else "Edit Category",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Basic Information
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = code,
                onValueChange = { code = it },
                label = { Text("Category Code") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            TextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Category Name") },
                modifier = Modifier.weight(2f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Parent Category Selection
        var expandedParent by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedParent,
            onExpandedChange = { expandedParent = !expandedParent },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = parentCategoryName.ifEmpty { "None (Root Category)" },
                onValueChange = { },
                readOnly = true,
                label = { Text("Parent Category") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedParent)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedParent,
                onDismissRequest = { expandedParent = false }
            ) {
                DropdownMenuItem(
                    text = { Text("None (Root Category)") },
                    onClick = {
                        parentCategoryId = ""
                        parentCategoryName = ""
                        expandedParent = false
                    }
                )
                availableParentCategories.forEach { cat ->
                    DropdownMenuItem(
                        text = { Text("${cat.code} - ${cat.name}") },
                        onClick = {
                            parentCategoryId = cat.id
                            parentCategoryName = "${cat.code} - ${cat.name}"
                            expandedParent = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Color Selection
        Text(
            text = "Category Color",
            style = MaterialTheme.typography.titleMedium
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            predefinedColors.chunked(5).forEach { colorRow ->
                Column {
                    colorRow.forEach { colorHex ->
                        val isSelected = color == colorHex
                        Card(
                            modifier = Modifier
                                .size(40.dp)
                                .padding(2.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(android.graphics.Color.parseColor(colorHex))
                            ),
                            onClick = { color = colorHex },
                            border = if (isSelected) {
                                androidx.compose.foundation.BorderStroke(
                                    3.dp, 
                                    MaterialTheme.colorScheme.primary
                                )
                            } else null
                        ) {}
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = color,
            onValueChange = { color = it },
            label = { Text("Color (Hex)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            placeholder = { Text("#2196F3") }
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isActive,
                    onCheckedChange = { isActive = it }
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Active")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Preview
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = try {
                    Color(android.graphics.Color.parseColor(color))
                } catch (e: Exception) {
                    MaterialTheme.colorScheme.primaryContainer
                }
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Preview",
                    style = MaterialTheme.typography.titleSmall,
                    color = Color.White
                )
                Text(
                    text = if (name.isNotEmpty()) name else "Category Name",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            horizontalArrangement = Arrangement.End,
            modifier = Modifier.fillMaxWidth()
        ) {
            TextButton(onClick = { onClose() }) {
                Icon(Icons.Filled.Close, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Cancel")
            }
            Spacer(modifier = Modifier.width(16.dp))
            Button(
                onClick = {
                    val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date())
                    val newCategory = ProductCategory(
                        id = category?.id ?: UUID.randomUUID().toString(),
                        code = code,
                        name = name,
                        description = description.takeIf { it.isNotEmpty() },
                        parentCategoryId = parentCategoryId.takeIf { it.isNotEmpty() },
                        parentCategoryName = parentCategoryName.takeIf { it.isNotEmpty() },
                        color = color,
                        isActive = isActive,
                        createdAt = category?.createdAt ?: now,
                        updatedAt = now
                    )
                    
                    if (category == null) {
                        viewModel.createCategory(newCategory)
                    } else {
                        viewModel.updateCategory(newCategory)
                    }
                    onClose()
                }
            ) {
                Icon(Icons.Filled.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save")
            }
        }
    }
}
