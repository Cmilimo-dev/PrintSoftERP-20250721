
import { HomeIcon, Users, Package, FileText, ShoppingCart, DollarSign, Truck, Settings as SettingsIcon, UserCog, Mail } from "lucide-react";
import { lazy } from "react";

// Lazy load all page components for better code splitting
const Index = lazy(() => import("@/pages/Index"));
const EnhancedPurchaseOrders = lazy(() => import("@/pages/EnhancedPurchaseOrders"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Logistics = lazy(() => import("@/pages/Logistics"));
const Customers = lazy(() => import("@/pages/Customers"));
const Sales = lazy(() => import("@/pages/Sales"));
const Financial = lazy(() => import("@/pages/Financial"));
const SystemSettings = lazy(() => import("@/pages/SystemSettings"));
const HR = lazy(() => import("@/pages/HR"));
const Mailbox = lazy(() => import("@/pages/Mailbox"));

export const navItems = [
  {
    title: "Financial",
    to: "/financial",
    icon: <DollarSign className="h-4 w-4" />,
    page: <Financial />
  },
  {
    title: "Customers",
    to: "/customers",
    icon: <Users className="h-4 w-4" />,
    page: <Customers />
  },
  {
    title: "Sales",
    to: "/sales",
    icon: <ShoppingCart className="h-4 w-4" />,
    page: <Sales />
  },
  {
    title: "Purchasing",
    to: "/purchase-orders",
    icon: <FileText className="h-4 w-4" />,
    page: <EnhancedPurchaseOrders />
  },
  {
    title: "Inventory",
    to: "/inventory",
    icon: <Package className="h-4 w-4" />,
    page: <Inventory />
  },
  {
    title: "Logistics",
    to: "/logistics",
    icon: <Truck className="h-4 w-4" />,
    page: <Logistics />
  },
  {
    title: "HR Management",
    to: "/hr",
    icon: <UserCog className="h-4 w-4" />,
    page: <HR />
  },
  {
    title: "Mailbox",
    to: "/mailbox",
    icon: <Mail className="h-4 w-4" />,
    page: <Mailbox />
  },
];
