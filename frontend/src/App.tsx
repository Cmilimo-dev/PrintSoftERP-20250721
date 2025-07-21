
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { navItems } from "./nav-items";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ExportSettingsProvider } from "@/contexts/ExportSettingsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ERPProvider } from "@/contexts/ERPContext";
import { lazy } from "react";
import HomePage from "@/components/HomePage";
import SubscriptionPage from "@/components/SubscriptionPage";
import AuthPage from "@/components/auth/AuthPage";

const Index = lazy(() => import("@/pages/Index"));

// Existing component imports for sub-routes
// Customer components
const EnhancedCustomerList = lazy(() => import("@/components/customers/EnhancedCustomerList"));
const EnhancedLeadList = lazy(() => import("@/components/customers/EnhancedLeadList"));
const CustomerList = lazy(() => import("@/components/customers/CustomerList"));
const CustomerView = lazy(() => import("@/components/customers/CustomerView"));

// Purchasing/Supplier components
const EnhancedSupplierList = lazy(() => import("@/components/suppliers/EnhancedSupplierList"));
const EnhancedPurchaseOrderList = lazy(() => import("@/components/purchase-orders/EnhancedPurchaseOrderList"));

// Sales components
const SalesOrderList = lazy(() => import("@/components/sales/SalesOrderList"));
const QuotationList = lazy(() => import("@/components/sales/QuotationList"));
const DeliveryNoteList = lazy(() => import("@/components/sales/DeliveryNoteList"));
const InvoiceList = lazy(() => import("@/components/sales/InvoiceList"));
const CleanSalesOrderList = lazy(() => import("@/components/sales/CleanSalesOrderList"));

// Financial components
const ExpensesManagement = lazy(() => import("@/components/financial/ExpensesManagement"));
const CommissionManagement = lazy(() => import("@/components/financial/CommissionManagement"));
const GeneralLedger = lazy(() => import("@/components/financial/GeneralLedger"));
const EnhancedFinancialReports = lazy(() => import("@/components/financial/EnhancedFinancialReports"));
const BalanceSheetReport = lazy(() => import("@/components/financial/BalanceSheetReport"));
const ProfitLossReport = lazy(() => import("@/components/financial/ProfitLossReport"));

// Inventory components
const EnhancedInventoryDashboard = lazy(() => import("@/components/inventory/EnhancedInventoryDashboard"));
const StockMovementTracker = lazy(() => import("@/components/inventory/StockMovementTracker"));
const ProductList = lazy(() => import("@/components/inventory/ProductList"));
const InventoryDashboard = lazy(() => import("@/components/inventory/InventoryDashboard"));

// Logistics components
const Logistics = lazy(() => import("@/pages/Logistics"));

// Settings components
const SystemSettings = lazy(() => import('@/pages/SystemSettings'));
const UserManagement = lazy(() => import('@/components/settings/UserManagement'));

// Profile component
const Profile = lazy(() => import('@/pages/Profile'));

// Analytics components
const AnalyticsDashboard = lazy(() => import("@/components/analytics/AnalyticsDashboard"));
const ReportBuilder = lazy(() => import("@/components/analytics/ReportBuilder"));

// ERP components
const ERPDashboard = lazy(() => import("@/components/ERPDashboard"));
const OrderCreateForm = lazy(() => import("@/components/orders/OrderCreateForm"));
const OrdersManager = lazy(() => import("@/components/OrdersManager"));
const InventoryManager = lazy(() => import("@/components/InventoryManager"));

// Reports components
const DocumentReports = lazy(() => import("@/components/reports/DocumentReports"));
const SalesReports = lazy(() => import("@/components/reports/SalesReports"));
const PurchaseReports = lazy(() => import("@/components/reports/PurchaseReports"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PermissionProvider>
        <SettingsProvider>
          <ExportSettingsProvider>
            <SubscriptionProvider>
              <ERPProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </div>
              }>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Routes>
                    <Route path="/dashboard" element={<Index />} />
<Route path="/" element={<Index />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    {navItems.map(({ to, page }) => (
                      <Route key={to} path={to} element={page} />
                    ))}
                    
                    {/* Purchasing sub-routes */}
                    <Route path="/purchase-orders/vendors" element={<EnhancedSupplierList />} />
                    <Route path="/purchase-orders/requisitions" element={<EnhancedPurchaseOrderList />} />
                    
                    {/* Customer sub-routes */}
                    <Route path="/customers/groups" element={<EnhancedLeadList />} />
                    <Route path="/customers/credit" element={<CustomerList />} />
                    <Route path="/customers/history" element={<CustomerView />} />
                    
                    {/* Sales sub-routes */}
                    <Route path="/sales/orders" element={<SalesOrderList />} />
                    <Route path="/sales/quotations" element={<QuotationList />} />
                    <Route path="/sales/delivery-notes" element={<DeliveryNoteList />} />
                    
                    {/* Financial sub-routes */}
                    <Route path="/financial/expenses" element={<ExpensesManagement />} />
                    <Route path="/financial/commission" element={<CommissionManagement />} />
                    <Route path="/financial/ledger" element={<GeneralLedger />} />
                    <Route path="/financial/invoices" element={<InvoiceList />} />
                    <Route path="/financial/receipts" element={<BalanceSheetReport />} />
                    
                    {/* Inventory sub-routes */}
                    <Route path="/inventory/warehouses" element={<ProductList />} />
                    <Route path="/inventory/movements" element={<StockMovementTracker />} />
                    <Route path="/inventory/alerts" element={<EnhancedInventoryDashboard />} />
                    
                    {/* Analytics sub-routes */}
                    <Route path="/analytics/metrics" element={<AnalyticsDashboard />} />
                    <Route path="/analytics/visualization" element={<ReportBuilder />} />
                    <Route path="/analytics/predictive" element={<AnalyticsDashboard />} />
                    
                    {/* Reports sub-routes */}
                    <Route path="/reports/financial" element={<EnhancedFinancialReports />} />
                    <Route path="/reports/sales" element={<SalesReports />} />
                    <Route path="/reports/inventory" element={<PurchaseReports />} />
                    <Route path="/reports/custom" element={<DocumentReports />} />
                    
                    {/* System Settings routes */}
                    <Route path="/system-settings" element={<SystemSettings />} />
                    <Route path="/system-settings/users" element={<UserManagement />} />
                    
                    {/* ERP routes */}
                    <Route path="/erp-dashboard" element={<ERPDashboard />} />
                    <Route path="/orders-manager" element={<OrdersManager />} />
                    <Route path="/inventory-manager" element={<InventoryManager />} />
                    <Route path="/create-order" element={<OrderCreateForm />} />
                    
                    {/* Profile route */}
                    <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
            </BrowserRouter>
              </ERPProvider>
            </SubscriptionProvider>
          </ExportSettingsProvider>
        </SettingsProvider>
      </PermissionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
