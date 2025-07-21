package com.printsoft.erp.ui.screens.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController

@Composable
fun SettingsScreen(navController: NavHostController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Settings",
            style = MaterialTheme.typography.headlineMedium
        )

        Divider()

        ListItem(
            icon = { Icon(Icons.Filled.Person, contentDescription = null) },
            text = { Text("User Profile") },
            secondaryText = { Text("Manage your profile and account details") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("userProfile") }
        )

        ListItem(
            icon = { Icon(Icons.Filled.Business, contentDescription = null) },
            text = { Text("Company Settings") },
            secondaryText = { Text("Update company details and preferences") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("companySettings") }
        )

        ListItem(
            icon = { Icon(Icons.Filled.Security, contentDescription = null) },
            text = { Text("Manage Permissions") },
            secondaryText = { Text("Control roles and permissions for users") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("permissionsManager") }
        )

        ListItem(
            icon = { Icon(Icons.Filled.Settings, contentDescription = null) },
            text = { Text("System Settings") },
            secondaryText = { Text("Configure application-wide settings") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("systemSettings") }
        )

        ListItem(
            icon = { Icon(Icons.Filled.Description, contentDescription = null) },
            text = { Text("Document Customization") },
            secondaryText = { Text("Customize document templates and layouts") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("documentCustomization") }
        )

        ListItem(
            icon = { Icon(Icons.Filled.ReceiptLong, contentDescription = null) },
            text = { Text("Tax Settings") },
            secondaryText = { Text("Configure tax rates and calculation methods") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("taxSettings") }
        )

        ListItem(
            icon = { Icon(Icons.Filled.AccountBalance, contentDescription = null) },
            text = { Text("eTIMS Integration") },
            secondaryText = { Text("Configure Ethiopian tax system integration") },
            trailing = { Icon(Icons.Filled.NavigateNext, contentDescription = null) },
            modifier = Modifier.clickable { navController.navigate("etimsSettings") }
        )

        Spacer(modifier = Modifier.height(50.dp))
    }
}

