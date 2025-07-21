package com.printsoft.erp.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentCustomizationForm(viewModel: SettingsViewModel) {
    var selectedTab by remember { mutableStateOf(0) }
    var documentName by remember { mutableStateOf("Invoice Template") }
    var documentType by remember { mutableStateOf("invoice") }
    var isDefault by remember { mutableStateOf(true) }

    val tabs = listOf(
        "Layout",
        "Header/Footer", 
        "Typography",
        "Colors",
        "Elements",
        "Export",
        "Advanced"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header Section
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Document Customization",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Customize the appearance and layout of your business documents",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }

        // Basic Settings
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                OutlinedTextField(
                    value = documentName,
                    onValueChange = { documentName = it },
                    label = { Text("Template Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                var expandedDocType by remember { mutableStateOf(false) }
                val docTypes = listOf("invoice", "quote", "purchase-order", "delivery-note", "receipt")
                
                ExposedDropdownMenuBox(
                    expanded = expandedDocType,
                    onExpandedChange = { expandedDocType = !expandedDocType }
                ) {
                    OutlinedTextField(
                        value = documentType.replaceFirstChar { it.uppercase() },
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Document Type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDocType) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )
                    
                    ExposedDropdownMenu(
                        expanded = expandedDocType,
                        onDismissRequest = { expandedDocType = false }
                    ) {
                        docTypes.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.replaceFirstChar { it.uppercase() }) },
                                onClick = {
                                    documentType = type
                                    expandedDocType = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isDefault,
                        onCheckedChange = { isDefault = it }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Set as default template")
                }
            }
        }

        // Tab Bar
        ScrollableTabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Tab Content
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                when (selectedTab) {
                    0 -> LayoutSettingsContent()
                    1 -> HeaderFooterSettingsContent()
                    2 -> TypographySettingsContent()
                    3 -> ColorSettingsContent()
                    4 -> ElementsSettingsContent()
                    5 -> ExportSettingsContent()
                    6 -> AdvancedSettingsContent()
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { /* Preview */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Filled.Visibility, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Preview")
            }
            
            Button(
                onClick = { /* Save */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Filled.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save")
            }
        }
    }
}

@Composable
fun LayoutSettingsContent() {
    var pageFormat by remember { mutableStateOf("A4") }
    var orientation by remember { mutableStateOf("portrait") }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Page Layout",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Page Format
            var expandedFormat by remember { mutableStateOf(false) }
            val formats = listOf("A4", "Letter", "Legal", "A3")
            
            ExposedDropdownMenuBox(
                expanded = expandedFormat,
                onExpandedChange = { expandedFormat = !expandedFormat },
                modifier = Modifier.weight(1f)
            ) {
                OutlinedTextField(
                    value = pageFormat,
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Page Format") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedFormat) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = expandedFormat,
                    onDismissRequest = { expandedFormat = false }
                ) {
                    formats.forEach { format ->
                        DropdownMenuItem(
                            text = { Text(format) },
                            onClick = {
                                pageFormat = format
                                expandedFormat = false
                            }
                        )
                    }
                }
            }
            
            // Orientation
            var expandedOrientation by remember { mutableStateOf(false) }
            val orientations = listOf("portrait", "landscape")
            
            ExposedDropdownMenuBox(
                expanded = expandedOrientation,
                onExpandedChange = { expandedOrientation = !expandedOrientation },
                modifier = Modifier.weight(1f)
            ) {
                OutlinedTextField(
                    value = orientation.replaceFirstChar { it.uppercase() },
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Orientation") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedOrientation) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )
                ExposedDropdownMenu(
                    expanded = expandedOrientation,
                    onDismissRequest = { expandedOrientation = false }
                ) {
                    orientations.forEach { orient ->
                        DropdownMenuItem(
                            text = { Text(orient.replaceFirstChar { it.uppercase() }) },
                            onClick = {
                                orientation = orient
                                expandedOrientation = false
                            }
                        )
                    }
                }
            }
        }
        
        Divider()
        
        Text(
            text = "Margins (mm)",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = "20",
                onValueChange = { },
                label = { Text("Top") },
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = "20",
                onValueChange = { },
                label = { Text("Right") },
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = "20",
                onValueChange = { },
                label = { Text("Bottom") },
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = "20",
                onValueChange = { },
                label = { Text("Left") },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun HeaderFooterSettingsContent() {
    var headerEnabled by remember { mutableStateOf(true) }
    var footerEnabled by remember { mutableStateOf(true) }
    var showLogo by remember { mutableStateOf(true) }
    var showCompanyName by remember { mutableStateOf(true) }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header Settings
        Text(
            text = "Header Settings",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = headerEnabled,
                onCheckedChange = { headerEnabled = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Enable Header")
        }
        
        if (headerEnabled) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = showLogo,
                    onCheckedChange = { showLogo = it }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Show Logo")
            }
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = showCompanyName,
                    onCheckedChange = { showCompanyName = it }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Show Company Name")
            }
        }
        
        Divider()
        
        // Footer Settings
        Text(
            text = "Footer Settings",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = footerEnabled,
                onCheckedChange = { footerEnabled = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Enable Footer")
        }
        
        if (footerEnabled) {
            OutlinedTextField(
                value = "This document was generated electronically",
                onValueChange = { },
                label = { Text("Footer Text") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun TypographySettingsContent() {
    var documentTitleFont by remember { mutableStateOf("Arial") }
    var bodyFont by remember { mutableStateOf("Arial") }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Font Settings",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        val fonts = listOf("Arial", "Times New Roman", "Calibri", "Helvetica")
        
        // Document Title Font
        var expandedTitleFont by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedTitleFont,
            onExpandedChange = { expandedTitleFont = !expandedTitleFont }
        ) {
            OutlinedTextField(
                value = documentTitleFont,
                onValueChange = { },
                readOnly = true,
                label = { Text("Document Title Font") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedTitleFont) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedTitleFont,
                onDismissRequest = { expandedTitleFont = false }
            ) {
                fonts.forEach { font ->
                    DropdownMenuItem(
                        text = { Text(font) },
                        onClick = {
                            documentTitleFont = font
                            expandedTitleFont = false
                        }
                    )
                }
            }
        }
        
        // Body Font
        var expandedBodyFont by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expandedBodyFont,
            onExpandedChange = { expandedBodyFont = !expandedBodyFont }
        ) {
            OutlinedTextField(
                value = bodyFont,
                onValueChange = { },
                readOnly = true,
                label = { Text("Body Font") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedBodyFont) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedBodyFont,
                onDismissRequest = { expandedBodyFont = false }
            ) {
                fonts.forEach { font ->
                    DropdownMenuItem(
                        text = { Text(font) },
                        onClick = {
                            bodyFont = font
                            expandedBodyFont = false
                        }
                    )
                }
            }
        }
        
        Divider()
        
        Text(
            text = "Font Sizes",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = "24",
                onValueChange = { },
                label = { Text("Title Size") },
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = "12",
                onValueChange = { },
                label = { Text("Body Size") },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun ColorSettingsContent() {
    var primaryColor by remember { mutableStateOf("#2196F3") }
    var secondaryColor by remember { mutableStateOf("#FFC107") }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Color Scheme",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        OutlinedTextField(
            value = primaryColor,
            onValueChange = { primaryColor = it },
            label = { Text("Primary Color") },
            modifier = Modifier.fillMaxWidth()
        )
        
        OutlinedTextField(
            value = secondaryColor,
            onValueChange = { secondaryColor = it },
            label = { Text("Secondary Color") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun ElementsSettingsContent() {
    var showQRCode by remember { mutableStateOf(true) }
    var showWatermark by remember { mutableStateOf(false) }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Document Elements",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = showQRCode,
                onCheckedChange = { showQRCode = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Show QR Code")
        }
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = showWatermark,
                onCheckedChange = { showWatermark = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Show Watermark")
        }
    }
}

@Composable
fun ExportSettingsContent() {
    var defaultFormat by remember { mutableStateOf("pdf") }
    var includeMetadata by remember { mutableStateOf(true) }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Export Settings",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        var expandedFormat by remember { mutableStateOf(false) }
        val formats = listOf("pdf", "docx", "html", "xlsx")
        
        ExposedDropdownMenuBox(
            expanded = expandedFormat,
            onExpandedChange = { expandedFormat = !expandedFormat }
        ) {
            OutlinedTextField(
                value = defaultFormat.uppercase(),
                onValueChange = { },
                readOnly = true,
                label = { Text("Default Export Format") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedFormat) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = expandedFormat,
                onDismissRequest = { expandedFormat = false }
            ) {
                formats.forEach { format ->
                    DropdownMenuItem(
                        text = { Text(format.uppercase()) },
                        onClick = {
                            defaultFormat = format
                            expandedFormat = false
                        }
                    )
                }
            }
        }
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = includeMetadata,
                onCheckedChange = { includeMetadata = it }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Include Metadata")
        }
    }
}

@Composable
fun AdvancedSettingsContent() {
    var customCSS by remember { mutableStateOf("") }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Advanced Customization",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        OutlinedTextField(
            value = customCSS,
            onValueChange = { customCSS = it },
            label = { Text("Custom CSS") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5
        )
        
        Text(
            text = "Add custom CSS to further customize your document appearance",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
