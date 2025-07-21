import {
  Shipment,
  DeliveryNote,
  VehicleInfo,
  WarehouseLocation,
  TrackingEvent,
  DeliveryRoute,
  LogisticsMetrics,
  LogisticsSettings,
  LogisticsSearchCriteria,
  LogisticsSortOptions,
  LogisticsExportOptions,
  LogisticsImportData,
  LogisticsValidationResult,
  LogisticsOperationResult
} from '../types/logisticsTypes';

/**
 * Independent storage service for logistics operations
 * Manages all logistics data persistence and business logic
 */
export class LogisticsStorageService {
  private static readonly STORAGE_KEYS = {
    SHIPMENTS: 'logistics_shipments',
    DELIVERY_NOTES: 'logistics_delivery_notes',
    VEHICLES: 'logistics_vehicles',
    LOCATIONS: 'logistics_locations',
    TRACKING_EVENTS: 'logistics_tracking_events',
    ROUTES: 'logistics_routes',
    SETTINGS: 'logistics_settings',
    METRICS_CACHE: 'logistics_metrics_cache'
  };

  // ============= SHIPMENT OPERATIONS =============

  /**
   * Create a new shipment
   */
  static createShipment(shipmentData: Omit<Shipment, 'id' | 'createdDate' | 'updatedAt'>): LogisticsOperationResult {
    try {
      const validation = this.validateShipment(shipmentData);
      if (!validation.isValid) {
        return { success: false, error: 'Validation failed', validationResult: validation };
      }

      const shipments = this.getAllShipments();
      const newShipment: Shipment = {
        ...shipmentData,
        id: this.generateId('SHP'),
        createdDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      shipments.push(newShipment);
      this.saveShipments(shipments);

      console.log('✅ Shipment created:', newShipment.id);
      return { success: true, data: newShipment };
    } catch (error) {
      console.error('❌ Error creating shipment:', error);
      return { success: false, error: 'Failed to create shipment' };
    }
  }

  /**
   * Get all shipments with optional filtering and sorting
   */
  static getShipments(
    searchCriteria?: LogisticsSearchCriteria,
    sortOptions?: LogisticsSortOptions,
    limit?: number,
    offset?: number
  ): Shipment[] {
    try {
      let shipments = this.getAllShipments();

      // Apply filters
      if (searchCriteria) {
        shipments = this.filterShipments(shipments, searchCriteria);
      }

      // Apply sorting
      if (sortOptions) {
        shipments = this.sortShipments(shipments, sortOptions);
      }

      // Apply pagination
      if (offset !== undefined && limit !== undefined) {
        shipments = shipments.slice(offset, offset + limit);
      } else if (limit !== undefined) {
        shipments = shipments.slice(0, limit);
      }

      return shipments;
    } catch (error) {
      console.error('❌ Error fetching shipments:', error);
      return [];
    }
  }

  /**
   * Get shipment by ID
   */
  static getShipmentById(id: string): Shipment | null {
    try {
      const shipments = this.getAllShipments();
      return shipments.find(shipment => shipment.id === id) || null;
    } catch (error) {
      console.error('❌ Error fetching shipment:', error);
      return null;
    }
  }

  /**
   * Update shipment
   */
  static updateShipment(id: string, updates: Partial<Shipment>): LogisticsOperationResult {
    try {
      const shipments = this.getAllShipments();
      const index = shipments.findIndex(shipment => shipment.id === id);

      if (index === -1) {
        return { success: false, error: 'Shipment not found' };
      }

      const updatedShipment = {
        ...shipments[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      };

      const validation = this.validateShipment(updatedShipment);
      if (!validation.isValid) {
        return { success: false, error: 'Validation failed', validationResult: validation };
      }

      shipments[index] = updatedShipment;
      this.saveShipments(shipments);

      console.log('✅ Shipment updated:', id);
      return { success: true, data: updatedShipment };
    } catch (error) {
      console.error('❌ Error updating shipment:', error);
      return { success: false, error: 'Failed to update shipment' };
    }
  }

  /**
   * Delete shipment
   */
  static deleteShipment(id: string): LogisticsOperationResult {
    try {
      const shipments = this.getAllShipments();
      const index = shipments.findIndex(shipment => shipment.id === id);

      if (index === -1) {
        return { success: false, error: 'Shipment not found' };
      }

      // Check for dependencies
      const deliveryNotes = this.getAllDeliveryNotes().filter(dn => dn.shipmentId === id);
      if (deliveryNotes.length > 0) {
        return { success: false, error: 'Cannot delete shipment with associated delivery notes' };
      }

      shipments.splice(index, 1);
      this.saveShipments(shipments);

      // Clean up related tracking events
      this.deleteTrackingEventsByShipment(id);

      console.log('✅ Shipment deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting shipment:', error);
      return { success: false, error: 'Failed to delete shipment' };
    }
  }

  // ============= DELIVERY NOTE OPERATIONS =============

  /**
   * Create delivery note
   */
  static createDeliveryNote(deliveryNoteData: Omit<DeliveryNote, 'id' | 'createdDate' | 'updatedAt'>): LogisticsOperationResult {
    try {
      const validation = this.validateDeliveryNote(deliveryNoteData);
      if (!validation.isValid) {
        return { success: false, error: 'Validation failed', validationResult: validation };
      }

      const deliveryNotes = this.getAllDeliveryNotes();
      const newDeliveryNote: DeliveryNote = {
        ...deliveryNoteData,
        id: this.generateId('DN'),
        createdDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      deliveryNotes.push(newDeliveryNote);
      this.saveDeliveryNotes(deliveryNotes);

      console.log('✅ Delivery note created:', newDeliveryNote.id);
      return { success: true, data: newDeliveryNote };
    } catch (error) {
      console.error('❌ Error creating delivery note:', error);
      return { success: false, error: 'Failed to create delivery note' };
    }
  }

  /**
   * Get all delivery notes with filtering
   */
  static getDeliveryNotes(
    searchCriteria?: LogisticsSearchCriteria,
    sortOptions?: LogisticsSortOptions,
    limit?: number,
    offset?: number
  ): DeliveryNote[] {
    try {
      let deliveryNotes = this.getAllDeliveryNotes();

      // Apply filters
      if (searchCriteria) {
        deliveryNotes = this.filterDeliveryNotes(deliveryNotes, searchCriteria);
      }

      // Apply sorting
      if (sortOptions) {
        deliveryNotes = this.sortDeliveryNotes(deliveryNotes, sortOptions);
      }

      // Apply pagination
      if (offset !== undefined && limit !== undefined) {
        deliveryNotes = deliveryNotes.slice(offset, offset + limit);
      } else if (limit !== undefined) {
        deliveryNotes = deliveryNotes.slice(0, limit);
      }

      return deliveryNotes;
    } catch (error) {
      console.error('❌ Error fetching delivery notes:', error);
      return [];
    }
  }

  /**
   * Get delivery note by ID
   */
  static getDeliveryNoteById(id: string): DeliveryNote | null {
    try {
      const deliveryNotes = this.getAllDeliveryNotes();
      return deliveryNotes.find(dn => dn.id === id) || null;
    } catch (error) {
      console.error('❌ Error fetching delivery note:', error);
      return null;
    }
  }

  /**
   * Update delivery note
   */
  static updateDeliveryNote(id: string, updates: Partial<DeliveryNote>): LogisticsOperationResult {
    try {
      const deliveryNotes = this.getAllDeliveryNotes();
      const index = deliveryNotes.findIndex(dn => dn.id === id);

      if (index === -1) {
        return { success: false, error: 'Delivery note not found' };
      }

      const updatedDeliveryNote = {
        ...deliveryNotes[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      };

      const validation = this.validateDeliveryNote(updatedDeliveryNote);
      if (!validation.isValid) {
        return { success: false, error: 'Validation failed', validationResult: validation };
      }

      deliveryNotes[index] = updatedDeliveryNote;
      this.saveDeliveryNotes(deliveryNotes);

      console.log('✅ Delivery note updated:', id);
      return { success: true, data: updatedDeliveryNote };
    } catch (error) {
      console.error('❌ Error updating delivery note:', error);
      return { success: false, error: 'Failed to update delivery note' };
    }
  }

  /**
   * Delete delivery note
   */
  static deleteDeliveryNote(id: string): LogisticsOperationResult {
    try {
      const deliveryNotes = this.getAllDeliveryNotes();
      const index = deliveryNotes.findIndex(dn => dn.id === id);

      if (index === -1) {
        return { success: false, error: 'Delivery note not found' };
      }

      deliveryNotes.splice(index, 1);
      this.saveDeliveryNotes(deliveryNotes);

      console.log('✅ Delivery note deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting delivery note:', error);
      return { success: false, error: 'Failed to delete delivery note' };
    }
  }

  // ============= VEHICLE OPERATIONS =============

  /**
   * Create vehicle
   */
  static createVehicle(vehicleData: Omit<VehicleInfo, 'id'>): LogisticsOperationResult {
    try {
      const validation = this.validateVehicle(vehicleData);
      if (!validation.isValid) {
        return { success: false, error: 'Validation failed', validationResult: validation };
      }

      const vehicles = this.getAllVehicles();
      const newVehicle: VehicleInfo = {
        ...vehicleData,
        id: this.generateId('VEH')
      };

      vehicles.push(newVehicle);
      this.saveVehicles(vehicles);

      console.log('✅ Vehicle created:', newVehicle.id);
      return { success: true, data: newVehicle };
    } catch (error) {
      console.error('❌ Error creating vehicle:', error);
      return { success: false, error: 'Failed to create vehicle' };
    }
  }

  /**
   * Get all vehicles
   */
  static getVehicles(): VehicleInfo[] {
    try {
      return this.getAllVehicles();
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      return [];
    }
  }

  /**
   * Get vehicle by ID
   */
  static getVehicleById(id: string): VehicleInfo | null {
    try {
      const vehicles = this.getAllVehicles();
      return vehicles.find(vehicle => vehicle.id === id) || null;
    } catch (error) {
      console.error('❌ Error fetching vehicle:', error);
      return null;
    }
  }

  /**
   * Update vehicle
   */
  static updateVehicle(id: string, updates: Partial<VehicleInfo>): LogisticsOperationResult {
    try {
      const vehicles = this.getAllVehicles();
      const index = vehicles.findIndex(vehicle => vehicle.id === id);

      if (index === -1) {
        return { success: false, error: 'Vehicle not found' };
      }

      const updatedVehicle = {
        ...vehicles[index],
        ...updates,
        id
      };

      const validation = this.validateVehicle(updatedVehicle);
      if (!validation.isValid) {
        return { success: false, error: 'Validation failed', validationResult: validation };
      }

      vehicles[index] = updatedVehicle;
      this.saveVehicles(vehicles);

      console.log('✅ Vehicle updated:', id);
      return { success: true, data: updatedVehicle };
    } catch (error) {
      console.error('❌ Error updating vehicle:', error);
      return { success: false, error: 'Failed to update vehicle' };
    }
  }

  /**
   * Delete vehicle
   */
  static deleteVehicle(id: string): LogisticsOperationResult {
    try {
      const vehicles = this.getAllVehicles();
      const index = vehicles.findIndex(vehicle => vehicle.id === id);

      if (index === -1) {
        return { success: false, error: 'Vehicle not found' };
      }

      // Check for dependencies
      const routes = this.getAllRoutes().filter(route => route.vehicleId === id);
      if (routes.length > 0) {
        return { success: false, error: 'Cannot delete vehicle with assigned routes' };
      }

      vehicles.splice(index, 1);
      this.saveVehicles(vehicles);

      console.log('✅ Vehicle deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);
      return { success: false, error: 'Failed to delete vehicle' };
    }
  }

  // ============= TRACKING OPERATIONS =============

  /**
   * Add tracking event
   */
  static addTrackingEvent(eventData: Omit<TrackingEvent, 'id'>): LogisticsOperationResult {
    try {
      const events = this.getAllTrackingEvents();
      const newEvent: TrackingEvent = {
        ...eventData,
        id: this.generateId('TRK')
      };

      events.push(newEvent);
      this.saveTrackingEvents(events);

      // Update shipment status if needed
      this.updateShipmentStatusFromTracking(eventData.shipmentId, eventData.status);

      console.log('✅ Tracking event added:', newEvent.id);
      return { success: true, data: newEvent };
    } catch (error) {
      console.error('❌ Error adding tracking event:', error);
      return { success: false, error: 'Failed to add tracking event' };
    }
  }

  /**
   * Get tracking events for shipment
   */
  static getTrackingEventsForShipment(shipmentId: string): TrackingEvent[] {
    try {
      const events = this.getAllTrackingEvents();
      return events
        .filter(event => event.shipmentId === shipmentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('❌ Error fetching tracking events:', error);
      return [];
    }
  }

  // ============= ANALYTICS AND METRICS =============

  /**
   * Calculate logistics metrics for a given period
   */
  static calculateMetrics(startDate: string, endDate: string): LogisticsMetrics {
    try {
      const shipments = this.getShipments({
        dateRange: { start: startDate, end: endDate }
      });

      const deliveryNotes = this.getDeliveryNotes({
        dateRange: { start: startDate, end: endDate }
      });

      // Calculate delivery metrics
      const deliveredShipments = shipments.filter(s => s.status === 'delivered');
      const onTimeDeliveries = deliveredShipments.filter(s => 
        s.deliveryDate && s.estimatedDelivery && 
        new Date(s.deliveryDate) <= new Date(s.estimatedDelivery)
      );

      const deliveryMetrics = {
        totalDeliveries: deliveredShipments.length,
        onTimeDeliveries: onTimeDeliveries.length,
        onTimePercentage: deliveredShipments.length > 0 ? 
          (onTimeDeliveries.length / deliveredShipments.length) * 100 : 0,
        averageDeliveryTime: this.calculateAverageDeliveryTime(deliveredShipments),
        failedDeliveries: shipments.filter(s => s.status === 'cancelled').length,
        cancelledDeliveries: shipments.filter(s => s.status === 'cancelled').length
      };

      // Calculate cost metrics
      const totalShippingCost = shipments.reduce((sum, s) => sum + (s.shippingCost || 0), 0);
      const costMetrics = {
        totalShippingCost,
        averageCostPerDelivery: deliveredShipments.length > 0 ? 
          totalShippingCost / deliveredShipments.length : 0,
        fuelCosts: 0, // Would be calculated from route data
        laborCosts: 0, // Would be calculated from driver/time data
        vehicleMaintenance: 0 // Would be tracked separately
      };

      // Calculate efficiency metrics
      const routes = this.getAllRoutes().filter(r => 
        r.date >= startDate && r.date <= endDate
      );
      
      const efficiencyMetrics = {
        vehicleUtilization: this.calculateVehicleUtilization(routes),
        routeEfficiency: this.calculateRouteEfficiency(routes),
        averageStopsPerRoute: routes.length > 0 ? 
          routes.reduce((sum, r) => sum + r.waypoints.length, 0) / routes.length : 0,
        totalDistance: routes.reduce((sum, r) => sum + (r.totalDistance || 0), 0),
        averageDistancePerDelivery: deliveredShipments.length > 0 ? 
          routes.reduce((sum, r) => sum + (r.totalDistance || 0), 0) / deliveredShipments.length : 0
      };

      const metrics: LogisticsMetrics = {
        period: { start: startDate, end: endDate },
        deliveryMetrics,
        costMetrics,
        efficiencyMetrics,
        customerMetrics: {
          satisfactionScore: 4.2, // Would be calculated from feedback
          complaintsReceived: 0,
          damageClaims: 0,
          returnRequests: 0
        },
        carrierMetrics: this.calculateCarrierMetrics(shipments)
      };

      // Cache the metrics
      this.cacheMetrics(metrics);
      return metrics;

    } catch (error) {
      console.error('❌ Error calculating metrics:', error);
      return this.getEmptyMetrics(startDate, endDate);
    }
  }

  // ============= SETTINGS OPERATIONS =============

  /**
   * Get logistics settings
   */
  static getSettings(): LogisticsSettings {
    try {
      const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update logistics settings
   */
  static updateSettings(settings: Partial<LogisticsSettings>): LogisticsOperationResult {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      
      console.log('✅ Settings updated');
      return { success: true, data: updatedSettings };
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }

  // ============= EXPORT/IMPORT OPERATIONS =============

  /**
   * Export logistics data
   */
  static exportData(options: LogisticsExportOptions): LogisticsOperationResult {
    try {
      const data: any = {};
      
      // Get data based on date range if specified
      const searchCriteria = options.dateRange ? { dateRange: options.dateRange } : undefined;
      
      data.shipments = this.getShipments(searchCriteria);
      data.deliveryNotes = this.getDeliveryNotes(searchCriteria);
      
      if (options.includeTracking) {
        data.trackingEvents = this.getAllTrackingEvents();
      }
      
      if (options.includeMetrics && options.dateRange) {
        data.metrics = this.calculateMetrics(options.dateRange.start, options.dateRange.end);
      }

      // Format data based on export format
      let exportedData: string;
      switch (options.format) {
        case 'json':
          exportedData = JSON.stringify(data, null, 2);
          break;
        case 'csv':
          exportedData = this.convertToCSV(data.shipments);
          break;
        default:
          exportedData = JSON.stringify(data, null, 2);
      }

      console.log('✅ Data exported successfully');
      return { success: true, data: exportedData };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return { success: false, error: 'Failed to export data' };
    }
  }

  /**
   * Import logistics data
   */
  static importData(importData: LogisticsImportData): LogisticsOperationResult {
    try {
      let importedCount = 0;
      const errors: string[] = [];

      // Import shipments
      if (importData.shipments) {
        for (const shipmentData of importData.shipments) {
          if (shipmentData.shipmentNumber && shipmentData.customerName) {
            const result = this.createShipment(shipmentData as any);
            if (result.success) {
              importedCount++;
            } else {
              errors.push(`Failed to import shipment ${shipmentData.shipmentNumber}: ${result.error}`);
            }
          }
        }
      }

      // Import delivery notes
      if (importData.deliveryNotes) {
        for (const deliveryNoteData of importData.deliveryNotes) {
          if (deliveryNoteData.deliveryNoteNumber && deliveryNoteData.customerId) {
            const result = this.createDeliveryNote(deliveryNoteData as any);
            if (result.success) {
              importedCount++;
            } else {
              errors.push(`Failed to import delivery note ${deliveryNoteData.deliveryNoteNumber}: ${result.error}`);
            }
          }
        }
      }

      // Import vehicles
      if (importData.vehicles) {
        for (const vehicleData of importData.vehicles) {
          if (vehicleData.vehicleNumber) {
            const result = this.createVehicle(vehicleData as any);
            if (result.success) {
              importedCount++;
            } else {
              errors.push(`Failed to import vehicle ${vehicleData.vehicleNumber}: ${result.error}`);
            }
          }
        }
      }

      console.log(`✅ Import completed: ${importedCount} items imported`);
      return { 
        success: true, 
        data: { importedCount, errors: errors.length > 0 ? errors : undefined }
      };
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return { success: false, error: 'Failed to import data' };
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  private static getAllShipments(): Shipment[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.SHIPMENTS);
    return data ? JSON.parse(data) : [];
  }

  private static saveShipments(shipments: Shipment[]): void {
    localStorage.setItem(this.STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
  }

  private static getAllDeliveryNotes(): DeliveryNote[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.DELIVERY_NOTES);
    return data ? JSON.parse(data) : [];
  }

  private static saveDeliveryNotes(deliveryNotes: DeliveryNote[]): void {
    localStorage.setItem(this.STORAGE_KEYS.DELIVERY_NOTES, JSON.stringify(deliveryNotes));
  }

  private static getAllVehicles(): VehicleInfo[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  }

  private static saveVehicles(vehicles: VehicleInfo[]): void {
    localStorage.setItem(this.STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }

  private static getAllLocations(): WarehouseLocation[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.LOCATIONS);
    return data ? JSON.parse(data) : [];
  }

  private static getAllTrackingEvents(): TrackingEvent[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.TRACKING_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  private static saveTrackingEvents(events: TrackingEvent[]): void {
    localStorage.setItem(this.STORAGE_KEYS.TRACKING_EVENTS, JSON.stringify(events));
  }

  private static getAllRoutes(): DeliveryRoute[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.ROUTES);
    return data ? JSON.parse(data) : [];
  }

  private static deleteTrackingEventsByShipment(shipmentId: string): void {
    const events = this.getAllTrackingEvents();
    const filteredEvents = events.filter(event => event.shipmentId !== shipmentId);
    this.saveTrackingEvents(filteredEvents);
  }

  private static updateShipmentStatusFromTracking(shipmentId: string, status: string): void {
    const statusMapping: { [key: string]: 'pending' | 'in-transit' | 'delivered' | 'cancelled' | 'delayed' } = {
      'picked-up': 'in-transit',
      'in-transit': 'in-transit',
      'out-for-delivery': 'in-transit',
      'delivered': 'delivered',
      'exception': 'delayed',
      'returned': 'cancelled'
    };

    const newStatus = statusMapping[status];
    if (newStatus) {
      this.updateShipment(shipmentId, { status: newStatus });
    }
  }

  private static generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  private static validateShipment(shipment: Partial<Shipment>): LogisticsValidationResult {
    const errors: string[] = [];
    const fieldErrors: { [field: string]: string } = {};

    if (!shipment.shipmentNumber?.trim()) {
      errors.push('Shipment number is required');
      fieldErrors.shipmentNumber = 'Required';
    }

    if (!shipment.customerName?.trim()) {
      errors.push('Customer name is required');
      fieldErrors.customerName = 'Required';
    }

    if (!shipment.origin) {
      errors.push('Origin address is required');
      fieldErrors.origin = 'Required';
    }

    if (!shipment.destination) {
      errors.push('Destination address is required');
      fieldErrors.destination = 'Required';
    }

    if (!shipment.carrier?.trim()) {
      errors.push('Carrier is required');
      fieldErrors.carrier = 'Required';
    }

    if (!shipment.items || shipment.items.length === 0) {
      errors.push('At least one item is required');
      fieldErrors.items = 'Required';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      fieldErrors
    };
  }

  private static validateDeliveryNote(deliveryNote: Partial<DeliveryNote>): LogisticsValidationResult {
    const errors: string[] = [];
    const fieldErrors: { [field: string]: string } = {};

    if (!deliveryNote.deliveryNoteNumber?.trim()) {
      errors.push('Delivery note number is required');
      fieldErrors.deliveryNoteNumber = 'Required';
    }

    if (!deliveryNote.customerId?.trim()) {
      errors.push('Customer ID is required');
      fieldErrors.customerId = 'Required';
    }

    if (!deliveryNote.customerName?.trim()) {
      errors.push('Customer name is required');
      fieldErrors.customerName = 'Required';
    }

    if (!deliveryNote.deliveryDate) {
      errors.push('Delivery date is required');
      fieldErrors.deliveryDate = 'Required';
    }

    if (!deliveryNote.items || deliveryNote.items.length === 0) {
      errors.push('At least one item is required');
      fieldErrors.items = 'Required';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      fieldErrors
    };
  }

  private static validateVehicle(vehicle: Partial<VehicleInfo>): LogisticsValidationResult {
    const errors: string[] = [];
    const fieldErrors: { [field: string]: string } = {};

    if (!vehicle.vehicleNumber?.trim()) {
      errors.push('Vehicle number is required');
      fieldErrors.vehicleNumber = 'Required';
    }

    if (!vehicle.type) {
      errors.push('Vehicle type is required');
      fieldErrors.type = 'Required';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      fieldErrors
    };
  }

  private static filterShipments(shipments: Shipment[], criteria: LogisticsSearchCriteria): Shipment[] {
    return shipments.filter(shipment => {
      if (criteria.dateRange) {
        const shipmentDate = new Date(shipment.createdDate);
        const start = new Date(criteria.dateRange.start);
        const end = new Date(criteria.dateRange.end);
        if (shipmentDate < start || shipmentDate > end) return false;
      }

      if (criteria.status && criteria.status.length > 0) {
        if (!criteria.status.includes(shipment.status)) return false;
      }

      if (criteria.customerId && shipment.customerId !== criteria.customerId) {
        return false;
      }

      if (criteria.carrier && !shipment.carrier.toLowerCase().includes(criteria.carrier.toLowerCase())) {
        return false;
      }

      if (criteria.trackingNumber && shipment.trackingNumber !== criteria.trackingNumber) {
        return false;
      }

      if (criteria.shipmentNumber && !shipment.shipmentNumber.toLowerCase().includes(criteria.shipmentNumber.toLowerCase())) {
        return false;
      }

      if (criteria.searchText) {
        const searchLower = criteria.searchText.toLowerCase();
        return (
          shipment.shipmentNumber.toLowerCase().includes(searchLower) ||
          shipment.customerName.toLowerCase().includes(searchLower) ||
          shipment.carrier.toLowerCase().includes(searchLower) ||
          (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }

  private static filterDeliveryNotes(deliveryNotes: DeliveryNote[], criteria: LogisticsSearchCriteria): DeliveryNote[] {
    return deliveryNotes.filter(dn => {
      if (criteria.dateRange) {
        const deliveryDate = new Date(dn.createdDate);
        const start = new Date(criteria.dateRange.start);
        const end = new Date(criteria.dateRange.end);
        if (deliveryDate < start || deliveryDate > end) return false;
      }

      if (criteria.status && criteria.status.length > 0) {
        if (!criteria.status.includes(dn.status)) return false;
      }

      if (criteria.customerId && dn.customerId !== criteria.customerId) {
        return false;
      }

      if (criteria.deliveryNoteNumber && !dn.deliveryNoteNumber.toLowerCase().includes(criteria.deliveryNoteNumber.toLowerCase())) {
        return false;
      }

      if (criteria.searchText) {
        const searchLower = criteria.searchText.toLowerCase();
        return (
          dn.deliveryNoteNumber.toLowerCase().includes(searchLower) ||
          dn.customerName.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }

  private static sortShipments(shipments: Shipment[], options: LogisticsSortOptions): Shipment[] {
    return shipments.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (options.field) {
        case 'date':
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'customer':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'carrier':
          aValue = a.carrier;
          bValue = b.carrier;
          break;
        case 'cost':
          aValue = a.shippingCost || 0;
          bValue = b.shippingCost || 0;
          break;
        default:
          aValue = a.createdDate;
          bValue = b.createdDate;
      }

      if (aValue < bValue) return options.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return options.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private static sortDeliveryNotes(deliveryNotes: DeliveryNote[], options: LogisticsSortOptions): DeliveryNote[] {
    return deliveryNotes.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (options.field) {
        case 'date':
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
          break;
        case 'deliveryDate':
          aValue = new Date(a.deliveryDate);
          bValue = new Date(b.deliveryDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'customer':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        default:
          aValue = a.createdDate;
          bValue = b.createdDate;
      }

      if (aValue < bValue) return options.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return options.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private static calculateAverageDeliveryTime(deliveredShipments: Shipment[]): number {
    const shipmentsWithTimes = deliveredShipments.filter(s => s.deliveryDate && s.createdDate);
    if (shipmentsWithTimes.length === 0) return 0;

    const totalHours = shipmentsWithTimes.reduce((sum, shipment) => {
      const created = new Date(shipment.createdDate);
      const delivered = new Date(shipment.deliveryDate!);
      const hours = (delivered.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return totalHours / shipmentsWithTimes.length;
  }

  private static calculateVehicleUtilization(routes: DeliveryRoute[]): number {
    if (routes.length === 0) return 0;
    
    const activeRoutes = routes.filter(r => r.status === 'completed' || r.status === 'in-progress');
    return activeRoutes.length > 0 ? (activeRoutes.length / routes.length) * 100 : 0;
  }

  private static calculateRouteEfficiency(routes: DeliveryRoute[]): number {
    const completedRoutes = routes.filter(r => r.status === 'completed' && r.actualDuration && r.estimatedDuration);
    if (completedRoutes.length === 0) return 0;

    const efficiencySum = completedRoutes.reduce((sum, route) => {
      const efficiency = Math.min(100, (route.estimatedDuration / route.actualDuration!) * 100);
      return sum + efficiency;
    }, 0);

    return efficiencySum / completedRoutes.length;
  }

  private static calculateCarrierMetrics(shipments: Shipment[]): { [carrierName: string]: any } {
    const carrierMetrics: { [carrierName: string]: any } = {};

    shipments.forEach(shipment => {
      if (!carrierMetrics[shipment.carrier]) {
        carrierMetrics[shipment.carrier] = {
          deliveries: 0,
          onTimePercentage: 0,
          averageCost: 0,
          customerRating: 4.0,
          issuesReported: 0
        };
      }

      carrierMetrics[shipment.carrier].deliveries++;
      
      if (shipment.shippingCost) {
        carrierMetrics[shipment.carrier].averageCost = 
          (carrierMetrics[shipment.carrier].averageCost + shipment.shippingCost) / 2;
      }
    });

    return carrierMetrics;
  }

  private static getDefaultSettings(): LogisticsSettings {
    return {
      defaultCarrier: 'Standard Carrier',
      defaultShippingService: 'Standard Delivery',
      autoCreateDeliveryNotes: true,
      requireSignature: true,
      enableGPSTracking: false,
      enablePhotoProof: false,
      defaultDeliveryWindow: 8,
      leadTime: 2,
      cutoffTime: '14:00',
      defaultCurrency: 'USD',
      includeFuelSurcharge: false,
      includeInsurance: false,
      notifyCustomerOnShipment: true,
      notifyCustomerOnDelivery: true,
      sendTrackingUpdates: true,
      emailTemplates: {
        shipmentCreated: 'Your shipment has been created',
        outForDelivery: 'Your package is out for delivery',
        delivered: 'Your package has been delivered',
        delayed: 'Your delivery has been delayed',
        exception: 'There was an issue with your delivery'
      },
      apiKeys: {},
      webhookUrls: {},
      businessRules: {
        maxDeliveryAttempts: 3,
        rescheduleWindow: 24,
        autoRescheduleOnFailure: true,
        requirePhotoForHighValue: true,
        highValueThreshold: 1000
      }
    };
  }

  private static getEmptyMetrics(startDate: string, endDate: string): LogisticsMetrics {
    return {
      period: { start: startDate, end: endDate },
      deliveryMetrics: {
        totalDeliveries: 0,
        onTimeDeliveries: 0,
        onTimePercentage: 0,
        averageDeliveryTime: 0,
        failedDeliveries: 0,
        cancelledDeliveries: 0
      },
      costMetrics: {
        totalShippingCost: 0,
        averageCostPerDelivery: 0,
        fuelCosts: 0,
        laborCosts: 0,
        vehicleMaintenance: 0
      },
      efficiencyMetrics: {
        vehicleUtilization: 0,
        routeEfficiency: 0,
        averageStopsPerRoute: 0,
        totalDistance: 0,
        averageDistancePerDelivery: 0
      },
      customerMetrics: {
        satisfactionScore: 0,
        complaintsReceived: 0,
        damageClaims: 0,
        returnRequests: 0
      },
      carrierMetrics: {}
    };
  }

  private static cacheMetrics(metrics: LogisticsMetrics): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.METRICS_CACHE, JSON.stringify({
        metrics,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Could not cache metrics:', error);
    }
  }

  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}
