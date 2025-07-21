package com.printsoft.erp.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Shipment(
    val id: String,
    val shipmentNumber: String,
    val orderId: String,
    val customerId: String,
    val customerName: String,
    val status: String, // pending, in_transit, delivered, cancelled
    val priority: String, // low, medium, high, urgent
    val shipmentDate: String,
    val estimatedDeliveryDate: String,
    val actualDeliveryDate: String? = null,
    val trackingNumber: String? = null,
    val carrier: String,
    val shippingMethod: String,
    val origin: Address,
    val destination: Address,
    val items: List<ShipmentItem>,
    val weight: Double,
    val dimensions: Dimensions,
    val shippingCost: Double,
    val notes: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class ShipmentItem(
    val id: String,
    val productId: String,
    val productName: String,
    val sku: String,
    val quantity: Int,
    val weight: Double,
    val dimensions: Dimensions
)

@Serializable
data class Address(
    val street: String,
    val city: String,
    val state: String,
    val postalCode: String,
    val country: String,
    val contactName: String? = null,
    val phoneNumber: String? = null
)

@Serializable
data class Dimensions(
    val length: Double,
    val width: Double,
    val height: Double,
    val unit: String = "cm"
)

@Serializable
data class ShipmentDeliveryNote(
    val id: String,
    val deliveryNoteNumber: String,
    val shipmentId: String,
    val driverId: String,
    val driverName: String,
    val vehicleId: String,
    val deliveryDate: String,
    val deliveryTime: String,
    val recipientName: String,
    val recipientSignature: String? = null,
    val deliveryStatus: String, // pending, delivered, failed, rescheduled
    val deliveryNotes: String? = null,
    val proofOfDelivery: String? = null, // photo or document URL
    val createdAt: String
)

@Serializable
data class Vehicle(
    val id: String,
    val vehicleNumber: String,
    val make: String,
    val model: String,
    val year: Int,
    val type: String, // truck, van, car
    val capacity: Double,
    val status: String, // available, in_use, maintenance, out_of_service
    val currentLocation: String? = null,
    val driverId: String? = null,
    val driverName: String? = null,
    val fuelType: String,
    val mileage: Double,
    val lastMaintenanceDate: String? = null,
    val nextMaintenanceDate: String? = null,
    val insuranceExpiryDate: String,
    val createdAt: String
)

@Serializable
data class LogisticsStats(
    val totalShipments: Int,
    val pendingShipments: Int,
    val inTransitShipments: Int,
    val deliveredShipments: Int,
    val cancelledShipments: Int,
    val totalVehicles: Int,
    val availableVehicles: Int,
    val vehiclesInUse: Int,
    val vehiclesInMaintenance: Int,
    val averageDeliveryTime: Double,
    val onTimeDeliveryRate: Double,
    val totalShippingCost: Double
)
