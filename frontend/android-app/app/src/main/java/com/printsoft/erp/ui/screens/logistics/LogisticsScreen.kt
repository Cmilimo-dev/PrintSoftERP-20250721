package com.printsoft.erp.ui.screens.logistics

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.lifecycle.viewmodel.compose.viewModel
import com.printsoft.erp.ui.viewmodel.LogisticsViewModel
import com.printsoft.erp.data.model.Shipment

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogisticsScreen(navController: NavHostController) {
    val logisticsViewModel: LogisticsViewModel = viewModel()
    val shipments = logisticsViewModel.shipments.collectAsState().value
    val logisticsStats = logisticsViewModel.logisticsStats.collectAsState().value

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Logistics",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            IconButton(onClick = { logisticsViewModel.refreshData() }) {
                Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        logisticsStats?.let { stats ->
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.height(120.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            title = "Total Shipments",
                            value = stats.totalShipments.toString(),
                            icon = Icons.Filled.LocalShipping,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "In Transit",
                            value = stats.inTransitShipments.toString(),
                            icon = Icons.Filled.DirectionBus,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Delivered",
                            value = stats.deliveredShipments.toString(),
                            icon = Icons.Filled.Check,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            title = "Vehicles Available",
                            value = stats.availableVehicles.toString(),
                            icon = Icons.Filled.DirectionsCar,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Avg Delivery Time",
                            value = "${stats.averageDeliveryTime} hr",
                            icon = Icons.Filled.Timer,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Shipping Cost",
                            value = "\$${stats.totalShippingCost}",
                            icon = Icons.Filled.AttachMoney,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Shipments",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxHeight()
        ) {
            items(shipments) { shipment ->
                ShipmentCard(shipment = shipment)
            }
        }
    }
}

@Composable
fun ShipmentCard(shipment: Shipment) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Shipment #${shipment.shipmentNumber}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Status: ${shipment.status}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Priority: ${shipment.priority}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Estimated Delivery: ${shipment.estimatedDeliveryDate}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Carrier: ${shipment.carrier}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Destination: ${shipment.destination.city}, ${shipment.destination.country}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
