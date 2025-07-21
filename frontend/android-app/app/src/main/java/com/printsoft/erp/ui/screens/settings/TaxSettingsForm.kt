package com.printsoft.erp.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.SettingsViewModel

@Composable
fun TaxSettingsForm(viewModel: SettingsViewModel) {
    val taxSettings = viewModel.taxSettings.collectAsState().value

    var taxType by remember { mutableStateOf(taxSettings?.type ?: "exclusive") }
    var defaultRate by remember { mutableStateOf(taxSettings?.defaultRate?.toString() ?: "0.0") }

    val taxTypes = listOf("inclusive", "exclusive", "per_item", "overall")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Tax Settings",
            style = MaterialTheme.typography.headlineMedium
        )

        // Tax type dropdown
        var expandedTaxType by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedTaxType,
            onExpandedChange = { expandedTaxType = !expandedTaxType },
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedTextField(
                value = taxType.replaceFirstChar { it.uppercase() },
                onValueChange = { },
                readOnly = true,
                label = { Text("Tax Type") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedTaxType) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedTaxType,
                onDismissRequest = { expandedTaxType = false }
            ) {
                taxTypes.forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type.replaceFirstChar { it.uppercase() }) },
                        onClick = {
                            taxType = type
                            expandedTaxType = false
                        }
                    )
                }
            }
        }

        OutlinedTextField(
            value = defaultRate,
            onValueChange = { defaultRate = it },
            label = { Text("Default Tax Rate (%)") },
            keyboardOptions = KeyboardOptions.Default.copy(keyboardType = KeyboardType.Decimal),
            modifier = Modifier.fillMaxWidth()
        )

        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Tax Type Information",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                when (taxType) {
                    "inclusive" -> Text(
                        "Tax is included in the item price",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    "exclusive" -> Text(
                        "Tax is added to the item price",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    "per_item" -> Text(
                        "Tax is calculated per item",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    "overall" -> Text(
                        "Tax is calculated on the total amount",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }

        Button(
            onClick = {
                val updatedSettings = taxSettings?.copy(
                    type = taxType,
                    defaultRate = defaultRate.toDoubleOrNull() ?: 0.0
                )
                updatedSettings?.let { viewModel.updateTaxSettings(it) }
            },
            modifier = Modifier.align(Alignment.End)
        ) {
            Text("Save")
        }
    }
}
