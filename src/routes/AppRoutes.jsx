import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from '../components/common/Loader';
import { getHomePathForRole, hasRole, normalizeRole, ROLES } from '../utils/roleUtils';

import AppErrorBoundary from '../components/common/AppErrorBoundary';

// Layouts
import DefaultLayout from '../layouts/DefaultLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOtp from '../pages/auth/VerifyOtp';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Farmer Pages
import FarmerDashboard from '../pages/dashboard/FarmerDashboard';
import FarmerProfile from '../pages/dashboard/FarmerProfile';
import FarmerBankDetails from '../pages/dashboard/FarmerBankDetails';
import FarmerSettings from '../pages/dashboard/FarmerSettings';
import FarmerRegistration from '../pages/dashboard/FarmerRegistration';
import ProjectsDashboard from '../pages/dashboard/ProjectsDashboard';
import FarmerCoupons from '../pages/farmer/FarmerCoupons';

// Admin Pages
import CustomerShop from '../pages/customer/CustomerShop';
import CustomerPortal from '../pages/customer/CustomerPortal';
import Cart from '../pages/customer/Cart';
import SelectDeliveryAddress from '../pages/customer/SelectDeliveryAddress';
import MyOrders from '../pages/customer/MyOrders';
import Checkout from '../pages/customer/Checkout';
import OrderSuccess from '../pages/customer/OrderSuccess';
import Product from '../pages/catalog/Product';
import ProductDetails from '../pages/catalog/ProductDetails';
import LeafyVegetablesPage from '../pages/LeafyVegetablesPage';
import LeafyVegetableDetailsPage from '../pages/LeafyVegetableDetailsPage';

// 404 & Protected Route Guards
import NotFound from '../pages/NotFound';
import CustomerProtectedRoute from '../components/auth/CustomerProtectedRoute';
import FarmerProtectedRoute from '../components/auth/FarmerProtectedRoute';

// Delivery Partner Module Imports
import DeliveryPartnerLogin from '../pages/deliveryPartner/DeliveryPartnerLogin';
import DeliveryPartnerRegister from '../pages/deliveryPartner/DeliveryPartnerRegister';
import VerificationMethod from '../pages/deliveryPartner/VerificationMethod';
import FaceRegistration from '../pages/deliveryPartner/FaceRegistration';
import DeliveryPartnerFaceVerification from '../pages/deliveryPartner/DeliveryPartnerFaceVerification';
import FaceVerificationProcessing from '../pages/deliveryPartner/FaceVerificationProcessing';
import FaceVerificationSuccess from '../pages/deliveryPartner/FaceVerificationSuccess';
import FaceVerificationFailed from '../pages/deliveryPartner/FaceVerificationFailed';
import FaceEnrollment from '../pages/deliveryPartner/FaceEnrollment';
import DeliveryPartnerDashboard from '../pages/deliveryPartner/DeliveryPartnerDashboard';
import DeliveryPartnerForgotPassword from '../pages/deliveryPartner/DeliveryPartnerForgotPassword';
import DeliveryPartnerScheduledDeliveries from '../pages/deliveryPartner/DeliveryPartnerScheduledDeliveries';
import DeliveryPartnerEarnings from '../pages/deliveryPartner/DeliveryPartnerEarnings';
import DeliveryPartnerHistory from '../pages/deliveryPartner/DeliveryPartnerHistory';
import DeliveryPartnerProtectedRoute from './DeliveryPartnerProtectedRoute';

// Dedicated Admin Panel Imports
import DedicatedAdminLayout from '../admin/components/AdminLayout';
import AdminProtectedRoute from '../admin/components/AdminProtectedRoute';
import DedicatedAdminLogin from '../admin/pages/AdminLogin';
import DedicatedAdminDashboard from '../admin/pages/AdminDashboard';
import DedicatedFarmerManagement from '../admin/pages/FarmerManagement';
import DedicatedCustomerManagement from '../admin/pages/CustomerManagement';
import DedicatedProductManagement from '../admin/pages/ProductManagement';
import DedicatedCategoryManagement from '../admin/pages/CategoryManagement';
import DedicatedOrderManagement from '../admin/pages/OrderManagement';
import DedicatedDeliveryManagement from '../admin/pages/DeliveryManagement';
import DedicatedPaymentManagement from '../admin/pages/PaymentManagement';
import DedicatedReports from '../admin/pages/Reports';
import DedicatedNotifications from '../admin/pages/Notifications';
import DedicatedReviewManagement from '../admin/pages/ReviewManagement';
import DedicatedCouponManagement from '../admin/pages/CouponManagement';
import DedicatedAdminSettings from '../admin/pages/AdminSettings';
import SecurityLogs from '../admin/pages/SecurityLogs';
import DedicatedBlockedUsers from '../admin/pages/BlockedUsers';
import DedicatedPreOrderList from '../admin/pages/PreOrderList';
import DeliveryPartnerApproval from '../admin/pages/DeliveryPartnerApproval';

// General Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullScreenLoader text="Loading your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(user?.role, allowedRoles)) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }

  return children;
};

// Public Only Route Guard (prevents logged in users from visiting login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullScreenLoader text="Preparing portal..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }

  return children;
};

// Role-Aware Route Fallback
const RoleBasedFallback = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullScreenLoader text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }

  return <Navigate to="/customer/login" replace />;
};

// Role-Aware Redirect for delivery routes: ALWAYS opens Delivery Partner module when unauthenticated
const RoleAwareDeliveryRedirect = () => {
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    user = null;
  }
  const role = normalizeRole(user?.role);
  const faceVerified =
    sessionStorage.getItem('deliveryPartnerFaceVerified') === 'true' ||
    localStorage.getItem('deliveryPartnerFaceVerified') === 'true';

  if (role === ROLES.DELIVERY_PARTNER) {
    if (faceVerified) {
      return <Navigate to="/delivery-partner/dashboard" replace />;
    }
    return <Navigate to="/delivery-partner/verify-method" replace />;
  }
  if (role === ROLES.ADMIN) {
    return <Navigate to="/admin/deliveries" replace />;
  }
  if (role === ROLES.FARMER) {
    return <Navigate to="/dashboard/delivery" replace />;
  }
  
  // Default unauthenticated / standard fallback: open Delivery Partner Login
  return <Navigate to="/delivery-partner/login" replace />;
};

import MarketplaceApp from '../pages/MarketplaceApp';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/marketplace" element={<MarketplaceApp />} />
      {/* MODULE 1: CUSTOMER MODULE */}
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/customer" element={<CustomerProtectedRoute><AppErrorBoundary><CustomerShop /></AppErrorBoundary></CustomerProtectedRoute>} />
        <Route path="/customer/shop" element={<CustomerProtectedRoute><AppErrorBoundary><CustomerShop /></AppErrorBoundary></CustomerProtectedRoute>} />
        <Route path="/customer/profile" element={<CustomerProtectedRoute><CustomerPortal /></CustomerProtectedRoute>} />
        <Route path="/catalog" element={<Product />} />
        <Route path="/catalog/:id" element={<ProductDetails />} />
        <Route path="/leafy-vegetables" element={<LeafyVegetablesPage />} />
        <Route path="/leafy-vegetables/:id" element={<LeafyVegetableDetailsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/orders" element={<CustomerProtectedRoute><MyOrders /></CustomerProtectedRoute>} />
        <Route path="/customer/orders" element={<CustomerProtectedRoute><MyOrders /></CustomerProtectedRoute>} />
        <Route path="/select-address" element={<CustomerProtectedRoute><SelectDeliveryAddress /></CustomerProtectedRoute>} />
        <Route path="/checkout/address" element={<CustomerProtectedRoute><SelectDeliveryAddress /></CustomerProtectedRoute>} />
        <Route path="/checkout" element={<CustomerProtectedRoute><Checkout /></CustomerProtectedRoute>} />
        <Route path="/order-success" element={<CustomerProtectedRoute><OrderSuccess /></CustomerProtectedRoute>} />
        <Route path="/orders/:orderId" element={<CustomerProtectedRoute><OrderSuccess /></CustomerProtectedRoute>} />
      </Route>

      {/* Customer Auth */}
      <Route path="/customer/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/customer/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/customer/verify-otp" element={<VerifyOtp />} />

      {/* Global Customer Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* MODULE 2: FARMER MODULE */}
      <Route path="/farmer/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route 
        path="/farmer-registration" 
        element={
          <FarmerProtectedRoute>
            <FarmerRegistration />
          </FarmerProtectedRoute>
        } 
      />

      <Route
        path="/dashboard"
        element={
          <FarmerProtectedRoute>
            <DashboardLayout />
          </FarmerProtectedRoute>
        }
      >
        <Route index element={<FarmerDashboard />} />
        <Route path="farmer-home" element={<FarmerDashboard />} />
        <Route path="profile" element={<FarmerProfile />} />
        <Route path="bank-details" element={<FarmerBankDetails />} />
        <Route path="settings" element={<FarmerSettings />} />
        <Route path="leafy-vegetables" element={<FarmerDashboard />} />
        <Route path="products" element={<FarmerDashboard />} />
        <Route path="products/new" element={<FarmerDashboard />} />
        <Route path="categories" element={<FarmerDashboard />} />
        <Route path="manage-categories" element={<FarmerDashboard />} />
        <Route path="orders" element={<FarmerDashboard />} />
        <Route path="payments" element={<FarmerBankDetails />} />
        <Route path="delivery" element={<FarmerDashboard />} />
        <Route path="customers" element={<FarmerDashboard />} />
        <Route path="farmers" element={<FarmerDashboard />} />
        <Route path="inventory" element={<FarmerDashboard />} />
        <Route path="offers" element={<FarmerCoupons />} />
        <Route path="coupons" element={<FarmerCoupons />} />
        <Route path="notifications" element={<FarmerDashboard />} />
        <Route path="banners" element={<FarmerDashboard />} />
        <Route path="reviews" element={<FarmerDashboard />} />
        <Route path="reports" element={<FarmerDashboard />} />
        <Route path="support" element={<FarmerSettings />} />
        <Route path="settings" element={<FarmerSettings />} />
      </Route>

      {/* MODULE 3: DELIVERY PARTNER MODULE */}
      <Route path="/delivery-partner" element={<RoleAwareDeliveryRedirect />} />
      <Route path="/delivery" element={<RoleAwareDeliveryRedirect />} />
      <Route path="/delivery-partner/login" element={<DeliveryPartnerLogin />} />
      <Route path="/delivery-partner/register" element={<DeliveryPartnerRegister />} />
      <Route path="/delivery-partner/forgot-password" element={<DeliveryPartnerForgotPassword />} />
      <Route path="/delivery-partner/verify-method" element={<VerificationMethod />} />
      <Route path="/delivery-partner/verification-method" element={<VerificationMethod />} />
      <Route path="/delivery-partner/face-registration" element={<FaceRegistration />} />
      <Route path="/delivery-partner/face-verification" element={<DeliveryPartnerFaceVerification />} />
      <Route path="/delivery-partner/face-verification/processing" element={<FaceVerificationProcessing />} />
      <Route path="/delivery-partner/face-verification/success" element={<FaceVerificationSuccess />} />
      <Route path="/delivery-partner/face-verification/failed" element={<FaceVerificationFailed />} />
      <Route path="/delivery-partner/face-enrollment" element={<FaceRegistration />} />
      <Route
        path="/delivery-partner/dashboard"
        element={
          <DeliveryPartnerProtectedRoute>
            <DeliveryPartnerDashboard />
          </DeliveryPartnerProtectedRoute>
        }
      />
      <Route
        path="/delivery-partner/scheduled-deliveries"
        element={
          <DeliveryPartnerProtectedRoute>
            <DeliveryPartnerScheduledDeliveries />
          </DeliveryPartnerProtectedRoute>
        }
      />
      <Route
        path="/delivery-partner/earnings"
        element={
          <DeliveryPartnerProtectedRoute>
            <DeliveryPartnerEarnings />
          </DeliveryPartnerProtectedRoute>
        }
      />
      <Route
        path="/delivery-partner/delivery-history"
        element={
          <DeliveryPartnerProtectedRoute>
            <DeliveryPartnerHistory />
          </DeliveryPartnerProtectedRoute>
        }
      />

      {/* MODULE 4: ADMIN MODULE */}
      <Route path="/admin/login" element={<DedicatedAdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <DedicatedAdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DedicatedAdminDashboard />} />
        <Route path="farmers" element={<DedicatedFarmerManagement />} />
        <Route path="customers" element={<DedicatedCustomerManagement />} />
        <Route path="products" element={<DedicatedProductManagement />} />
        <Route path="categories" element={<DedicatedCategoryManagement />} />
        <Route path="orders" element={<DedicatedOrderManagement />} />
        <Route path="deliveries" element={<DedicatedDeliveryManagement />} />
        <Route path="delivery-partners" element={<DedicatedDeliveryManagement />} />
        <Route path="delivery-partner-approvals" element={<DeliveryPartnerApproval />} />
        <Route path="payments" element={<DedicatedPaymentManagement />} />
        <Route path="reports" element={<DedicatedReports />} />
        <Route path="notifications" element={<DedicatedNotifications />} />
        <Route path="reviews" element={<DedicatedReviewManagement />} />
        <Route path="coupons" element={<DedicatedCouponManagement />} />
        <Route path="offers" element={<DedicatedCouponManagement />} />
        <Route path="blocked-users" element={<DedicatedBlockedUsers />} />
        <Route path="pre-order-list" element={<DedicatedPreOrderList />} />
        <Route path="security-logs" element={<SecurityLogs />} />
        <Route path="settings" element={<DedicatedAdminSettings />} />
      </Route>

      {/* Standalone UI Demo */}
      <Route path="/projects-dashboard" element={<ProjectsDashboard />} />

      {/* Error & Fallbacks — role-aware redirect for unknown paths */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<RoleBasedFallback />} />
    </Routes>
  );
};

export default AppRoutes;
