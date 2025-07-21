package com.printsoft.erp.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.SettingsViewModel

@Composable
fun SystemSettingsForm(viewModel: SettingsViewModel) {
    val systemSettings = viewModel.systemSettings.collectAsState().value

    var currency by remember { mutableStateOf(systemSettings?.currency ?: "USD") }
    var defaultLanguage by remember { mutableStateOf(systemSettings?.defaultLanguage ?: "en") }
    var dateFormat by remember { mutableStateOf(systemSettings?.dateFormat ?: "yyyy-MM-dd") }
    var timeFormat by remember { mutableStateOf(systemSettings?.timeFormat ?: "HH:mm:ss") }
    var fiscalYearStart by remember { mutableStateOf(systemSettings?.fiscalYearStart ?: "01-01") }
    var backupEnabled by remember { mutableStateOf(systemSettings?.backupEnabled ?: true) }
    var backupFrequency by remember { mutableStateOf(systemSettings?.backupFrequency ?: "daily") }

    val currencies = listOf("USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY")
    val languages = listOf("en", "es", "fr", "de", "it", "pt", "zh", "ja")
    val dateFormats = listOf("yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy", "dd-MM-yyyy")
    val timeFormats = listOf("HH:mm:ss", "hh:mm:ss a", "HH:mm", "hh:mm a")
    val backupFrequencies = listOf("daily", "weekly", "monthly")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "System Settings",
            style = MaterialTheme.typography.headlineMedium
        )

        // Currency dropdown
        var expandedCurrency by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedCurrency,
            onExpandedChange = { expandedCurrency = !expandedCurrency },
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedTextField(
                value = currency,
                onValueChange = { },
                readOnly = true,
                label = { Text("Currency") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedCurrency) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedCurrency,
                onDismissRequest = { expandedCurrency = false }
            ) {
                currencies.forEach { currencyOption ->
                    DropdownMenuItem(
                        text = { Text(currencyOption) },
                        onClick = {
                            currency = currencyOption
                            expandedCurrency = false
                        }
                    )
                }
            }
        }

        // Language dropdown
        var expandedLanguage by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedLanguage,
            onExpandedChange = { expandedLanguage = !expandedLanguage },
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedTextField(
                value = defaultLanguage,
                onValueChange = { },
                readOnly = true,
                label = { Text("Default Language") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedLanguage) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedLanguage,
                onDismissRequest = { expandedLanguage = false }
            ) {
                languages.forEach { languageOption ->
                    DropdownMenuItem(
                        text = { Text(languageOption) },
                        onClick = {
                            defaultLanguage = languageOption
                            expandedLanguage = false
                        }
                    )
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Date format dropdown
            var expandedDateFormat by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expandedDateFormat,
                onExpandedChange = { expandedDateFormat = !expandedDateFormat },
                modifier = Modifier.weight(1f)
            ) {
                OutlinedTextField(
                    value = dateFormat,
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Date Format") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDateFormat) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = expandedDateFormat,
                    onDismissRequest = { expandedDateFormat = false }
                ) {
                    dateFormats.forEach { dateFormatOption ->
                        DropdownMenuItem(
                            text = { Text(dateFormatOption) },
                            onClick = {
                                dateFormat = dateFormatOption
                                expandedDateFormat = false
                            }
                        )
                    }
                }
            }

            // Time format dropdown
            var expandedTimeFormat by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expandedTimeFormat,
                onExpandedChange = { expandedTimeFormat = !expandedTimeFormat },
                modifier = Modifier.weight(1f)
            ) {
                OutlinedTextField(
                    value = timeFormat,
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Time Format") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedTimeFormat) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = expandedTimeFormat,
                    onDismissRequest = { expandedTimeFormat = false }
                ) {
                    timeFormats.forEach { timeFormatOption ->
                        DropdownMenuItem(
                            text = { Text(timeFormatOption) },
                            onClick = {
                                timeFormat = timeFormatOption
                                expandedTimeFormat = false
                            }
                        )
                    }
                }
            }
        }

        OutlinedTextField(
            value = fiscalYearStart,
            onValueChange = { fiscalYearStart = it },
            label = { Text("Fiscal Year Start (MM-dd)") },
            modifier = Modifier.fillMaxWidth()
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            Checkbox(
                checked = backupEnabled,
                onCheckedChange = { backupEnabled = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Enable Automatic Backups")
        }

        if (backupEnabled) {
            // Backup frequency dropdown
            var expandedBackupFreq by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expandedBackupFreq,
                onExpandedChange = { expandedBackupFreq = !expandedBackupFreq },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = backupFrequency,
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Backup Frequency") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedBackupFreq) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = expandedBackupFreq,
                    onDismissRequest = { expandedBackupFreq = false }
                ) {
                    backupFrequencies.forEach { backupFreqOption ->
                        DropdownMenuItem(
                            text = { Text(backupFreqOption) },
                            onClick = {
                                backupFrequency = backupFreqOption
                                expandedBackupFreq = false
                            }
                        )
                    }
                }
            }
        }

        Button(
            onClick = {
                val updatedSettings = systemSettings?.copy(
                    currency = currency,
                    defaultLanguage = defaultLanguage,
                    dateFormat = dateFormat,
                    timeFormat = timeFormat,
                    fiscalYearStart = fiscalYearStart,
                    backupEnabled = backupEnabled,
                    backupFrequency = backupFrequency
                )
                updatedSettings?.let { viewModel.updateSystemSettings(it) }
            },
            modifier = Modifier.align(Alignment.End)
        ) {
            Text("Save")
        }
    }
}
