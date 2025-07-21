package com.printsoft.erp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.printsoft.erp.ui.screens.dashboard.DashboardScreen
import com.printsoft.erp.ui.screens.customers.CustomersScreen
import com.printsoft.erp.ui.screens.inventory.InventoryScreen
import com.printsoft.erp.ui.screens.sales.SalesScreen
import com.printsoft.erp.ui.screens.purchase.PurchaseScreen
import com.printsoft.erp.ui.screens.financial.FinancialScreen
import com.printsoft.erp.ui.screens.hr.HRScreen
import com.printsoft.erp.ui.screens.logistics.LogisticsScreen
import com.printsoft.erp.ui.screens.mailbox.MailboxScreen
import com.printsoft.erp.ui.screens.settings.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.printsoft.erp.ui.viewmodel.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentRoute == item.route,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
NavHost(
            navController = navController,
            startDestination = "dashboard",
            modifier = Modifier.padding(paddingValues)
            ) {
                composable("dashboard") { DashboardScreen(navController) }
                composable("customers") { CustomersScreen(navController) }
                composable("inventory") { InventoryScreen(navController) }
                composable("sales") { SalesScreen(navController) }
                composable("purchase") { PurchaseScreen(navController) }
composable("financial") { FinancialScreen(navController) }
composable("hr") { HRScreen(navController) }
composable("logistics") { LogisticsScreen(navController) }
composable("mailbox") { MailboxScreen(navController) }
composable("settings") { SettingsScreen(navController) }
                composable("userProfile") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    UserProfileForm(settingsViewModel)
                }
                composable("companySettings") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    CompanySettingsForm(settingsViewModel)
                }
                composable("permissionsManager") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    PermissionsManagerForm(settingsViewModel)
                }
                composable("systemSettings") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    SystemSettingsForm(settingsViewModel)
                }
                composable("documentCustomization") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    DocumentCustomizationForm(settingsViewModel)
                }
                composable("taxSettings") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    TaxSettingsForm(settingsViewModel)
                }
                composable("etimsSettings") {
                    val settingsViewModel: SettingsViewModel = viewModel()
                    EtimsSettingsForm(settingsViewModel)
                }
            }
        }
    }
data class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
)

val bottomNavItems = listOf(
    BottomNavItem("dashboard", Icons.Default.Dashboard, "Dashboard"),
    BottomNavItem("customers", Icons.Default.People, "Customers"),
    BottomNavItem("inventory", Icons.Default.Inventory, "Inventory"),
    BottomNavItem("sales", Icons.Default.ShoppingCart, "Sales"),
    BottomNavItem("purchase", Icons.Default.ShoppingBag, "Purchase"),
    BottomNavItem("financial", Icons.Default.AttachMoney, "Financial"),
BottomNavItem("hr", Icons.Default.Work, "HR"),
    BottomNavItem("logistics", Icons.Default.LocalShipping, "Logistics"),
    BottomNavItem("mailbox", Icons.Default.Email, "Mailbox"),
    BottomNavItem("settings", Icons.Default.Settings, "Settings")
)
