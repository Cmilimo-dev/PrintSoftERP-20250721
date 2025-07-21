package com.printsoft.erp.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.SettingsViewModel

@Composable
fun EtimsSettingsForm(viewModel: SettingsViewModel) {
    val etimsSettings = viewModel.etimsSettings.collectAsState().value

    var enabled by remember { mutableStateOf(etimsSettings?.enabled ?: false) }
    var pin by remember { mutableStateOf(etimsSettings?.pin ?: "0000") }
    var apiUrl by remember { mutableStateOf(etimsSettings?.apiUrl ?: "") }
    var environment by remember { mutableStateOf(etimsSettings?.environment ?: "sandbox") }
    var autoSubmit by remember { mutableStateOf(etimsSettings?.autoSubmit ?: false) }
    var certificatePath by remember { mutableStateOf(etimsSettings?.certificatePath ?: "") }

    val environments = listOf("sandbox", "production")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "eTIMS Integration Settings",
            style = MaterialTheme.typography.headlineMedium
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "eTIMS (Electronic Tax Invoice Management System)",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Configure integration with Ethiopia's electronic tax system",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            Checkbox(
                checked = enabled,
                onCheckedChange = { enabled = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Enable eTIMS Integration")
        }

        if (enabled) {
            OutlinedTextField(
                value = pin,
                onValueChange = { pin = it },
                label = { Text("eTIMS PIN") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = apiUrl,
                onValueChange = { apiUrl = it },
                label = { Text("API URL") },
                modifier = Modifier.fillMaxWidth()
            )

            // Environment dropdown
            var expandedEnvironment by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expandedEnvironment,
                onExpandedChange = { expandedEnvironment = !expandedEnvironment },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = environment.replaceFirstChar { it.uppercase() },
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Environment") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedEnvironment) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = expandedEnvironment,
                    onDismissRequest = { expandedEnvironment = false }
                ) {
                    environments.forEach { env ->
                        DropdownMenuItem(
                            text = { Text(env.replaceFirstChar { it.uppercase() }) },
                            onClick = {
                                environment = env
                                expandedEnvironment = false
                            }
                        )
                    }
                }
            }

            OutlinedTextField(
                value = certificatePath,
                onValueChange = { certificatePath = it },
                label = { Text("Certificate Path (Optional)") },
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = autoSubmit,
                    onCheckedChange = { autoSubmit = it }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Automatically submit invoices to eTIMS")
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Integration Status",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (environment == "production") {
                            "⚠️ Production environment - Live tax submissions"
                        } else {
                            "🧪 Sandbox environment - Test submissions only"
                        },
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }

        Button(
            onClick = {
                val updatedSettings = etimsSettings?.copy(
                    enabled = enabled,
                    pin = pin,
                    apiUrl = apiUrl,
                    environment = environment,
                    autoSubmit = autoSubmit,
                    certificatePath = certificatePath.takeIf { it.isNotEmpty() }
                )
                updatedSettings?.let { viewModel.updateEtimsSettings(it) }
            },
            modifier = Modifier.align(Alignment.End)
        ) {
            Text("Save")
        }
    }
}
