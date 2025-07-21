
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MobileDashboardLayout,
  DashboardStatsGrid,
  DashboardHeader,
  MobileTableWrapper
} from '@/components/ui/mobile-dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Truck, Package, MapPin, Calendar, Search, Filter, Eye } from 'lucide-react';
import { LogisticsStorageService } from '@/modules/logistics/services/logisticsStorageService';
import { LogisticsNumberService } from '@/modules/logistics/services/logisticsNumberService';
import { Shipment, DeliveryNote, VehicleInfo } from '@/modules/logistics/types/logisticsTypes';

const Logistics: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('shipments');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const shipmentsData = LogisticsStorageService.getShipments();
      const deliveryNotesData = LogisticsStorageService.getDeliveryNotes();
      const vehiclesData = LogisticsStorageService.getVehicles();
      
      setShipments(shipmentsData);
      setDeliveryNotes(deliveryNotesData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to load logistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const stats = [
    {
      title: 'Active Shipments',
      value: shipments.filter(s => s.status === 'in-transit').length,
      icon: Truck,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Shipments',
      value: shipments.filter(s => s.status === 'pending').length,
      icon: Package,
      color: 'text-orange-600',
    },
    {
      title: 'Delivered Today',
      value: shipments.filter(s => {
        if (s.status !== 'delivered' || !s.deliveryDate) return false;
        const today = new Date().toDateString();
        return new Date(s.deliveryDate).toDateString() === today;
      }).length,
      icon: MapPin,
      color: 'text-green-600',
    },
    {
      title: 'Available Vehicles',
      value: vehicles.filter(v => v.status === 'available').length,
      icon: Calendar,
      color: 'text-purple-600',
    },
  ];

  const handleCreateShipment = () => {
    const newShipment = {
      shipmentNumber: LogisticsNumberService.generateShipmentNumber(),
      status: 'pending' as const,
      priority: 'normal' as const,
      origin: {
        street: '123 Warehouse St',
        city: 'Origin City',
        state: 'OS',
        zip: '12345',
        country: 'Country'
      },
      destination: {
        street: '456 Customer Ave',
        city: 'Destination City',
        state: 'DS',
        zip: '67890',
        country: 'Country'
      },
      customerName: 'Sample Customer',
      carrier: 'Default Carrier',
      items: [],
      packageCount: 1,
      currency: 'USD',
      relatedDocuments: [],
      createdBy: 'system'
    };

    const result = LogisticsStorageService.createShipment(newShipment);
    if (result.success) {
      loadData();
      setIsCreateDialogOpen(false);
    }
  };

  const handleCreateDeliveryNote = () => {
    const newDeliveryNote = {
      deliveryNoteNumber: LogisticsNumberService.generateDeliveryNoteNumber(),
      status: 'draft' as const,
      customerId: 'CUST-001',
      customerName: 'Sample Customer',
      customerAddress: {
        street: '456 Customer Ave',
        city: 'Customer City',
        state: 'CS',
        zip: '67890',
        country: 'Country'
      },
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryAddress: {
        street: '456 Customer Ave',
        city: 'Customer City',
        state: 'CS',
        zip: '67890',
        country: 'Country'
      },
      items: [],
      createdBy: 'system'
    };

    const result = LogisticsStorageService.createDeliveryNote(newDeliveryNote);
    if (result.success) {
      loadData();
      setIsCreateDialogOpen(false);
    }
  };

  const handleCreateVehicle = () => {
    const newVehicle = {
      vehicleNumber: LogisticsNumberService.generateVehicleNumber(),
      type: 'truck' as const,
      capacity: {
        weight: 1000,
        volume: 50,
        unit: 'kg/m³'
      },
      status: 'available' as const
    };

    const result = LogisticsStorageService.createVehicle(newVehicle);
    if (result.success) {
      loadData();
      setIsCreateDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      pending: 'outline',
      'in-transit': 'default',
      delivered: 'secondary',
      cancelled: 'destructive',
      delayed: 'destructive',
      draft: 'outline',
      confirmed: 'default',
      available: 'secondary',
      'in-use': 'default',
      maintenance: 'outline',
      'out-of-service': 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDeliveryNotes = deliveryNotes.filter(dn => {
    const matchesSearch = dn.deliveryNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dn.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p>Loading logistics data...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileDashboardLayout className="container mx-auto p-6 space-y-6">
      <DashboardHeader
        title="Logistics Management"
      >
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-0">
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 p-1">
                <Button onClick={handleCreateShipment} className="w-full py-3 text-sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Create Shipment
                </Button>
                <Button onClick={handleCreateDeliveryNote} className="w-full py-3 text-sm">
                  <Package className="h-4 w-4 mr-2" />
                  Create Delivery Note
                </Button>
                <Button onClick={handleCreateVehicle} className="w-full py-3 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardHeader>

      {/* Stats Dashboard */}
      <DashboardStatsGrid columns={4}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </DashboardStatsGrid>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadData} variant="outline" size="sm" className="whitespace-nowrap">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative overflow-hidden">
          <TabsList className="inline-flex w-auto min-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide gap-1 p-1">
            <TabsTrigger value="shipments" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Shipments</span>
              <span className="sm:hidden">Ships</span>
              <span className="ml-1">({filteredShipments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="delivery-notes" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Delivery Notes</span>
              <span className="sm:hidden">Notes</span>
              <span className="ml-1">({filteredDeliveryNotes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Vehicles</span>
              <span className="sm:hidden">Fleet</span>
              <span className="ml-1">({filteredVehicles.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="shipments">
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredShipments.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No shipments found</p>
                </div>
              ) : (
                <MobileTableWrapper>
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Shipment #</TableHead>
                      <TableHead className="min-w-[120px]">Customer</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[100px]">Carrier</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[80px]">Priority</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[90px]">Created</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium text-sm">{shipment.shipmentNumber}</TableCell>
                        <TableCell className="text-sm">{shipment.customerName}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{shipment.carrier}</TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={shipment.priority === 'urgent' ? 'destructive' : 'outline'} className="text-xs">
                            {shipment.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{new Date(shipment.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </MobileTableWrapper>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery-notes">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDeliveryNotes.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No delivery notes found</p>
                </div>
              ) : (
                <MobileTableWrapper>
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Note #</TableHead>
                      <TableHead className="min-w-[120px]">Customer</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[100px]">Delivery Date</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[60px]">Items</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[90px]">Created</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveryNotes.map((deliveryNote) => (
                      <TableRow key={deliveryNote.id}>
                        <TableCell className="font-medium text-sm">{deliveryNote.deliveryNoteNumber}</TableCell>
                        <TableCell className="text-sm">{deliveryNote.customerName}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{new Date(deliveryNote.deliveryDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(deliveryNote.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{deliveryNote.items.length}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{new Date(deliveryNote.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </MobileTableWrapper>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No vehicles found</p>
                </div>
              ) : (
                <MobileTableWrapper>
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Vehicle #</TableHead>
                      <TableHead className="min-w-[80px]">Type</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[120px]">Capacity</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[100px]">Driver</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium text-sm">{vehicle.vehicleNumber}</TableCell>
                        <TableCell className="capitalize text-sm">{vehicle.type}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {vehicle.capacity.weight} {vehicle.capacity.unit.split('/')[0]} / {vehicle.capacity.volume} {vehicle.capacity.unit.split('/')[1]}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{vehicle.driver?.name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </MobileTableWrapper>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MobileDashboardLayout>
  );
};

export default Logistics;
