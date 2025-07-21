package com.printsoft.erp.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateShipmentRequest(
    val orderId: String,
    val customerId: String,
    val priority: String,
    val estimatedDeliveryDate: String,
    val carrier: String,
    val shippingMethod: String,
    val destination: AddressDto,
    val items: List<ShipmentItemDto>,
    val notes: String? = null
)

@Serializable
data class UpdateShipmentRequest(
    val status: String? = null,
    val priority: String? = null,
    val estimatedDeliveryDate: String? = null,
    val actualDeliveryDate: String? = null,
    val trackingNumber: String? = null,
    val carrier: String? = null,
    val shippingMethod: String? = null,
    val notes: String? = null
)

@Serializable
data class ShipmentItemDto(
    val productId: String,
    val quantity: Int,
    val weight: Double,
    val dimensions: DimensionsDto
)

@Serializable
data class AddressDto(
    val street: String,
    val city: String,
    val state: String,
    val postalCode: String,
    val country: String,
    val contactName: String? = null,
    val phoneNumber: String? = null
)

@Serializable
data class DimensionsDto(
    val length: Double,
    val width: Double,
    val height: Double,
    val unit: String = "cm"
)

@Serializable
data class CreateDeliveryNoteRequest(
    val shipmentId: String,
    val driverId: String,
    val vehicleId: String,
    val deliveryDate: String,
    val deliveryTime: String,
    val recipientName: String,
    val deliveryNotes: String? = null
)

@Serializable
data class UpdateDeliveryNoteRequest(
    val deliveryStatus: String,
    val recipientName: String? = null,
    val recipientSignature: String? = null,
    val deliveryNotes: String? = null,
    val proofOfDelivery: String? = null
)

@Serializable
data class CreateVehicleRequest(
    val vehicleNumber: String,
    val make: String,
    val model: String,
    val year: Int,
    val type: String,
    val capacity: Double,
    val fuelType: String,
    val insuranceExpiryDate: String
)

@Serializable
data class UpdateVehicleRequest(
    val status: String? = null,
    val currentLocation: String? = null,
    val driverId: String? = null,
    val mileage: Double? = null,
    val lastMaintenanceDate: String? = null,
    val nextMaintenanceDate: String? = null,
    val insuranceExpiryDate: String? = null
)

@Serializable
data class ShipmentFilterRequest(
    val status: String? = null,
    val priority: String? = null,
    val customerId: String? = null,
    val carrier: String? = null,
    val dateFrom: String? = null,
    val dateTo: String? = null,
    val page: Int = 1,
    val limit: Int = 20
)

@Serializable
data class VehicleFilterRequest(
    val status: String? = null,
    val type: String? = null,
    val driverId: String? = null,
    val availableOnly: Boolean = false,
    val page: Int = 1,
    val limit: Int = 20
)

@Serializable
data class TrackingResponse(
    val shipmentId: String,
    val trackingNumber: String,
    val status: String,
    val currentLocation: String? = null,
    val estimatedDeliveryDate: String,
    val actualDeliveryDate: String? = null,
    val trackingHistory: List<TrackingEvent>
)

@Serializable
data class TrackingEvent(
    val timestamp: String,
    val location: String,
    val status: String,
    val description: String
)
