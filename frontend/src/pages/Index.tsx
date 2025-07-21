import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileDashboardLayout } from '@/components/ui/mobile-dashboard-layout';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  Truck,
  BarChart3,
  FileBarChart,
  Search,
  Mail,
  Ship,
  Quote,
  Receipt,
  Warehouse,
  UserCog,
  Archive,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  CreditCard,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useSuppliers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useInventory';
import { useSalesOrders, useQuotations, useInvoices, useDeliveryNotes } from '@/hooks/useSales';

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  // Sidebar components removed - using full width layout

  // Fetch data for counts
  const { data: customers = [] } = useCustomers();
  const { data: suppliers = [] } = useSuppliers();
  const { data: products = [] } = useProducts();
  const { data: salesOrders = [] } = useSalesOrders();
  const { data: quotations = [] } = useQuotations();
  const { data: invoices = [] } = useInvoices();
  const { data: deliveryNotes = [] } = useDeliveryNotes();

  // Dashboard modules configuration
  const dashboardModules = [
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
      count: customers.length,
      route: '/customers',
      color: 'blue',
      description: 'Manage customer information and relationships'
    },
    {
      id: 'suppliers',
      name: 'Suppliers',
      icon: Truck,
      count: suppliers.length,
      route: '/customers', // Using same route as it handles both
      color: 'indigo',
      description: 'Manage supplier and vendor relationships'
    },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      count: products.length,
      route: '/inventory',
      color: 'green',
      description: 'Product inventory and catalogue management'
    },
    {
      id: 'sales_orders',
      name: 'Sales Orders',
      icon: ShoppingCart,
      count: salesOrders.length,
      route: '/sales',
      color: 'emerald',
      description: 'Process and manage sales orders'
    },
    {
      id: 'quotations',
      name: 'Quotations',
      icon: Quote,
      count: quotations.length,
      route: '/sales',
      color: 'yellow',
      description: 'Create and manage customer quotations'
    },
    {
      id: 'invoices',
      name: 'Invoices',
      icon: FileText,
      count: invoices.length,
      route: '/sales',
      color: 'orange',
      description: 'Invoice generation and management'
    },
    {
      id: 'delivery_notes',
      name: 'Delivery Notes',
      icon: Ship,
      count: deliveryNotes.length,
      route: '/logistics',
      color: 'cyan',
      description: 'Track delivery and shipment notes'
    },
    {
      id: 'purchase_orders',
      name: 'Purchase Orders',
      icon: Receipt,
      count: 0, // Will be updated when PO hook is implemented
      route: '/purchase-orders',
      color: 'purple',
      description: 'Manage purchase orders and procurement'
    },
    {
      id: 'analytics',
      name: 'Analytics & Reports',
      icon: BarChart3,
      count: 0,
      route: '/analytics',
      color: 'rose',
      description: 'Business analytics and reporting'
    },
    {
      id: 'hr',
      name: 'HR Management',
      icon: UserCog,
      count: 0, // Will be updated when HR data is available
      route: '/hr',
      color: 'indigo',
      description: 'Human resources and employee management'
    },
    {
      id: 'mailbox',
      name: 'Mailbox',
      icon: Mail,
      count: 0, // Will be updated when mailbox data is available
      route: '/mailbox',
      color: 'blue',
      description: 'Internal messaging and communication'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: Settings,
      count: 0,
      route: '/system-settings',
      color: 'gray',
      description: 'Configure system settings and preferences'
    }
  ];

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    // Search in customers
    customers.forEach(customer => {
      const customerName = customer.customer_type === 'company' 
        ? customer.company_name 
        : `${customer.first_name} ${customer.last_name}`;
      
      if (customerName?.toLowerCase().includes(query) || 
          customer.email?.toLowerCase().includes(query) ||
          customer.phone?.toLowerCase().includes(query)) {
        results.push({
          type: 'customer',
          name: customerName,
          subtitle: customer.email || customer.phone,
          icon: Users,
          action: () => navigate('/customers')
        });
      }
    });
    
    // Search in suppliers
    suppliers.forEach(supplier => {
      const supplierName = supplier.supplier_type === 'company' 
        ? supplier.company_name 
        : `${supplier.first_name} ${supplier.last_name}`;
      
      if (supplierName?.toLowerCase().includes(query) || 
          supplier.email?.toLowerCase().includes(query) ||
          supplier.phone?.toLowerCase().includes(query)) {
        results.push({
          type: 'supplier',
          name: supplierName,
          subtitle: supplier.email || supplier.phone,
          icon: Truck,
          action: () => navigate('/customers')
        });
      }
    });
    
    // Search in products
    products.forEach(product => {
      if (product.name?.toLowerCase().includes(query) || 
          product.sku?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)) {
        results.push({
          type: 'product',
          name: product.name,
          subtitle: `SKU: ${product.sku}`,
          icon: Package,
          action: () => navigate('/inventory')
        });
      }
    });
    
    // Search in modules
    dashboardModules.forEach(module => {
      if (module.name.toLowerCase().includes(query) || 
          module.description.toLowerCase().includes(query)) {
        results.push({
          type: 'module',
          name: module.name,
          subtitle: module.description,
          icon: module.icon,
          action: () => navigate(module.route)
        });
      }
    });
    
    return results.slice(0, 8); // Limit results
  }, [searchQuery, customers, suppliers, products, dashboardModules, navigate]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <MobileDashboardLayout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PrintSoft ERP Dashboard</h1>
          <p className="text-gray-600">Manage your business operations efficiently</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search customers, suppliers, products, documents and more..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-12 py-3 text-base bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-2 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2">
                <div className="text-sm text-gray-500 mb-2">Search Results ({searchResults.length})</div>
                {searchResults.map((result, index) => {
                  const IconComponent = result.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        result.action();
                        setSearchQuery('');
                      }}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.name}</div>
                        <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          {/* Main Content - Module Cards */}
          <div className="w-full">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="text-2xl font-bold text-green-600">{products.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sales Orders</p>
                      <p className="text-2xl font-bold text-emerald-600">{salesOrders.length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Invoices</p>
                      <p className="text-2xl font-bold text-orange-600">{invoices.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardModules.map((module) => {
                const IconComponent = module.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                  indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
                  green: 'bg-green-100 text-green-600 hover:bg-green-200',
                  emerald: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
                  yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
                  orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
                  cyan: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
                  purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
                  rose: 'bg-rose-100 text-rose-600 hover:bg-rose-200',
                  gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                };
                
                return (
                  <Card 
                    key={module.id} 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border-l-4 border-l-transparent hover:border-l-blue-500 group"
                    onClick={() => navigate(module.route)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-lg transition-colors ${colorClasses[module.color]}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {module.count}
                          </Badge>
                          <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {module.name}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>


        </div>
      </div>
    </MobileDashboardLayout>
  );
};

export default Index;
