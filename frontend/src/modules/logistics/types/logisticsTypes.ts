// Base types for logistics module
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

// Shipment and delivery types
export interface Shipment {
  id: string;
  shipmentNumber: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled' | 'delayed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Origin and destination
  origin: Address;
  destination: Address;
  
  // Customer/vendor info
  customerId?: string;
  customerName: string;
  vendorId?: string;
  vendorName?: string;
  
  // Shipment details
  trackingNumber?: string;
  carrier: string;
  carrierService?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  
  // Dates
  createdDate: string;
  scheduledDate?: string;
  pickupDate?: string;
  deliveryDate?: string;
  estimatedDelivery?: string;
  
  // Items
  items: ShipmentItem[];
  packageCount: number;
  
  // Costs
  shippingCost?: number;
  insuranceValue?: number;
  currency: string;
  
  // References
  relatedDocuments: string[]; // IDs of related sales orders, invoices, etc.
  
  // Contacts
  senderContact?: ContactInfo;
  recipientContact?: ContactInfo;
  
  // Notes and instructions
  notes?: string;
  specialInstructions?: string;
  handlingInstructions?: string;
  
  // Proof of delivery
  proofOfDelivery?: {
    signature?: string;
    photo?: string;
    receivedBy: string;
    receivedAt: string;
    notes?: string;
  };
  
  // Metadata
  createdBy: string;
  updatedAt: string;
}

export interface ShipmentItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  quantityShipped?: number;
  quantityReceived?: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  value?: number;
  serialNumbers?: string[];
  batchNumbers?: string[];
  expiryDate?: string;
  hazardous?: boolean;
  fragile?: boolean;
  temperatureControlled?: boolean;
}

// Delivery Note types
export interface DeliveryNote {
  id: string;
  deliveryNoteNumber: string;
  status: 'draft' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  
  // Customer info
  customerId: string;
  customerName: string;
  customerAddress: Address;
  
  // Delivery details
  deliveryDate: string;
  deliveryAddress: Address;
  
  // Items
  items: DeliveryNoteItem[];
  
  // Shipment info
  shipmentId?: string;
  carrier?: string;
  trackingNumber?: string;
  vehicleInfo?: VehicleInfo;
  
  // Personnel
  deliveredBy?: string;
  driverName?: string;
  driverPhone?: string;
  receivedBy?: string;
  
  // References
  relatedSalesOrder?: string;
  relatedInvoice?: string;
  
  // Signatures and proof
  customerSignature?: string;
  driverSignature?: string;
  deliveryPhoto?: string;
  
  // Notes
  notes?: string;
  deliveryInstructions?: string;
  
  // Timestamps
  createdDate: string;
  scheduledDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdBy: string;
  updatedAt: string;
}

export interface DeliveryNoteItem {
  id: string;
  itemCode: string;
  description: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unit: string;
  serialNumbers?: string[];
  batchNumbers?: string[];
  condition?: 'new' | 'damaged' | 'returned';
  notes?: string;
}

// Vehicle and transportation
export interface VehicleInfo {
  id: string;
  vehicleNumber: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle' | 'bicycle' | 'other';
  capacity: {
    weight: number;
    volume: number;
    unit: string;
  };
  driver?: {
    name: string;
    phone: string;
    licenseNumber?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
}

// Route and tracking
export interface DeliveryRoute {
  id: string;
  routeName: string;
  date: string;
  vehicleId: string;
  driverId: string;
  
  // Route details
  startLocation: Address;
  endLocation: Address;
  waypoints: RouteStop[];
  
  // Progress tracking
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  
  // Performance metrics
  totalDistance?: number;
  fuelConsumed?: number;
  deliveriesCompleted: number;
  deliveriesPlanned: number;
  
  notes?: string;
  createdBy: string;
  updatedAt: string;
}

export interface RouteStop {
  id: string;
  sequence: number;
  address: Address;
  customerId?: string;
  customerName: string;
  deliveryNoteIds: string[];
  
  // Timing
  estimatedArrival: string;
  actualArrival?: string;
  estimatedDeparture: string;
  actualDeparture?: string;
  serviceTime: number; // minutes
  
  // Status
  status: 'pending' | 'arrived' | 'completed' | 'failed' | 'skipped';
  
  // Contact
  contactPerson?: ContactInfo;
  specialInstructions?: string;
  
  // Results
  itemsDelivered?: number;
  signature?: string;
  notes?: string;
}

// Warehouse and inventory locations
export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'distribution-center' | 'store' | 'depot';
  address: Address;
  
  // Capacity and capabilities
  capacity: {
    maxWeight: number;
    maxVolume: number;
    unit: string;
  };
  
  // Facilities
  capabilities: {
    refrigerated: boolean;
    hazardousStorage: boolean;
    securityLevel: 'basic' | 'standard' | 'high' | 'maximum';
    loadingDocks: number;
    parkingSpaces: number;
  };
  
  // Operating hours
  operatingHours: {
    [key: string]: { // day of week
      open: string;
      close: string;
      breaks?: Array<{start: string; end: string}>;
    };
  };
  
  // Staff
  manager?: ContactInfo;
  staff?: ContactInfo[];
  
  // Status
  status: 'active' | 'inactive' | 'maintenance';
  
  // Metadata
  createdDate: string;
  updatedAt: string;
}

// Tracking and monitoring
export interface TrackingEvent {
  id: string;
  shipmentId: string;
  timestamp: string;
  location: Address;
  status: 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception' | 'returned';
  description: string;
  eventCode?: string;
  
  // Personnel
  recordedBy?: string;
  
  // Additional data
  temperature?: number;
  humidity?: number;
  signature?: string;
  photo?: string;
  notes?: string;
  
  // System info
  source: 'manual' | 'gps' | 'scan' | 'api' | 'sensor';
  deviceId?: string;
}

// Performance metrics and analytics
export interface LogisticsMetrics {
  period: {
    start: string;
    end: string;
  };
  
  // Delivery performance
  deliveryMetrics: {
    totalDeliveries: number;
    onTimeDeliveries: number;
    onTimePercentage: number;
    averageDeliveryTime: number; // hours
    failedDeliveries: number;
    cancelledDeliveries: number;
  };
  
  // Cost metrics
  costMetrics: {
    totalShippingCost: number;
    averageCostPerDelivery: number;
    fuelCosts: number;
    laborCosts: number;
    vehicleMaintenance: number;
  };
  
  // Efficiency metrics
  efficiencyMetrics: {
    vehicleUtilization: number; // percentage
    routeEfficiency: number; // percentage
    averageStopsPerRoute: number;
    totalDistance: number;
    averageDistancePerDelivery: number;
  };
  
  // Customer satisfaction
  customerMetrics: {
    satisfactionScore?: number;
    complaintsReceived: number;
    damageClaims: number;
    returnRequests: number;
  };
  
  // Carrier performance
  carrierMetrics: {
    [carrierName: string]: {
      deliveries: number;
      onTimePercentage: number;
      averageCost: number;
      customerRating: number;
      issuesReported: number;
    };
  };
}

// Settings and configuration
export interface LogisticsSettings {
  defaultCarrier: string;
  defaultShippingService: string;
  autoCreateDeliveryNotes: boolean;
  requireSignature: boolean;
  enableGPSTracking: boolean;
  enablePhotoProof: boolean;
  
  // Timing defaults
  defaultDeliveryWindow: number; // hours
  leadTime: number; // days
  cutoffTime: string; // time for same-day delivery
  
  // Cost settings
  defaultCurrency: string;
  includeFuelSurcharge: boolean;
  includeInsurance: boolean;
  
  // Notification settings
  notifyCustomerOnShipment: boolean;
  notifyCustomerOnDelivery: boolean;
  sendTrackingUpdates: boolean;
  emailTemplates: {
    shipmentCreated: string;
    outForDelivery: string;
    delivered: string;
    delayed: string;
    exception: string;
  };
  
  // Integration settings
  apiKeys: {
    [carrier: string]: string;
  };
  webhookUrls: {
    [eventType: string]: string;
  };
  
  // Business rules
  businessRules: {
    maxDeliveryAttempts: number;
    rescheduleWindow: number; // hours
    autoRescheduleOnFailure: boolean;
    requirePhotoForHighValue: boolean;
    highValueThreshold: number;
  };
}

// Search and filter types
export interface LogisticsSearchCriteria {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  customerId?: string;
  carrier?: string;
  trackingNumber?: string;
  deliveryNoteNumber?: string;
  shipmentNumber?: string;
  routeId?: string;
  priority?: string[];
  searchText?: string;
}

export interface LogisticsSortOptions {
  field: 'date' | 'status' | 'customer' | 'carrier' | 'deliveryDate' | 'priority' | 'cost';
  direction: 'asc' | 'desc';
}

// Export and import types
export interface LogisticsExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeItems: boolean;
  includeTracking: boolean;
  includeMetrics: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface LogisticsImportData {
  shipments?: Partial<Shipment>[];
  deliveryNotes?: Partial<DeliveryNote>[];
  vehicles?: Partial<VehicleInfo>[];
  locations?: Partial<WarehouseLocation>[];
}

// Validation types
export interface LogisticsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: { [field: string]: string };
}

// Status and error types
export interface LogisticsOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  validationResult?: LogisticsValidationResult;
}
