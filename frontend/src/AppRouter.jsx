import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import UserLayout from "./pages/user/UserLayout.jsx";
import Overview from "./pages/user/Overview.jsx";
import Billing from "./pages/user/Billing.jsx";
import Support from "./pages/user/Support.jsx";
import Settings from "./pages/user/Settings.jsx";
import Services from "./pages/user/Services.jsx";
import ServiceDetail from "./pages/user/ServiceDetail.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminClients from "./pages/admin/AdminClients.jsx";
import AdminBilling from "./pages/admin/AdminBilling.jsx";
import AdminFinance from "./pages/admin/AdminFinance.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminNodes from "./pages/admin/AdminNodes.jsx";
import AdminSecurity from "./pages/admin/AdminSecurity.jsx";
import AdminProvisioning from "./pages/admin/AdminProvisioning.jsx";
import AdminDomains from "./pages/admin/AdminDomains.jsx";
import AdminSupport from "./pages/admin/AdminSupport.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import { RequireAuth, RequireRole } from "./routes/guards.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <UserLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="services" element={<Services />} />
        <Route path="billing" element={<Billing />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
        <Route path="service/:id" element={<ServiceDetail />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole roles={["superadmin"]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="provisioning" element={<AdminProvisioning />} />
        <Route path="domains" element={<AdminDomains />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="nodes" element={<AdminNodes />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
