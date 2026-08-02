import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from '../components/common/Loader';
import { getHomePathForRole, hasRole } from '../utils/roleUtils';

// Layouts
import DefaultLayout from '../layouts/DefaultLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages (to be created)
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

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminFarmers from '../pages/admin/AdminFarmers';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminPending from '../pages/admin/AdminPending';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminLeafyVegetables from '../pages/admin/AdminLeafyVegetables';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminCategoryManagement from '../pages/admin/AdminCategoryManagement';
import AdminOrderManagement from '../pages/admin/AdminOrderManagement';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminDeliveryManagement from '../pages/admin/AdminDeliveryManagement';
import AdminOffersCoupons from '../pages/admin/AdminOffersCoupons';
import AdminNotifications from '../pages/admin/AdminNotifications';
import DeliveryOverview from '../pages/admin/deliveries/DeliveryOverview';
import DeliveryList from '../pages/admin/deliveries/DeliveryList';
import AdminReportsAnalytics from '../pages/admin/AdminReportsAnalytics';
import AdminSupport from '../pages/admin/AdminSupport';
import AdminSettings from '../pages/admin/AdminSettings';
import CustomerShop from '../pages/customer/CustomerShop';
import CustomerPortal from '../pages/customer/CustomerPortal';
import Cart from '../pages/customer/Cart';
import CheckoutAddressSlot from '../pages/customer/CheckoutAddressSlot';
import Checkout from '../pages/customer/Checkout';
import OrderSuccess from '../pages/customer/OrderSuccess';
import ChooseAddress from '../pages/ChooseAddress';
import AddAddressDetails from '../pages/AddAddressDetails';
import Product from '../pages/catalog/Product';
import ProductDetails from '../pages/catalog/ProductDetails';
import LeafyVegetablesPage from '../pages/LeafyVegetablesPage';
import LeafyVegetableDetailsPage from '../pages/LeafyVegetableDetailsPage';


// 404 Page
import NotFound from '../pages/NotFound';

// Protected Route Guard
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

// Sends authenticated users to their role home; guests go to customer shop
const RoleBasedFallback = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <FullScreenLoader text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }

  return <Navigate to="/customer" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with Default Layout */}
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/customer" element={<CustomerShop />} />
        <Route path="/customer/profile" element={<CustomerPortal />} />
        <Route path="/catalog" element={<Product />} />
        <Route path="/catalog/:id" element={<ProductDetails />} />
        <Route path="/leafy-vegetables" element={<LeafyVegetablesPage />} />
        <Route path="/leafy-vegetables/:id" element={<LeafyVegetableDetailsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/choose-address" element={<ProtectedRoute><ChooseAddress /></ProtectedRoute>} />
        <Route path="/add-address-details" element={<ProtectedRoute><AddAddressDetails /></ProtectedRoute>} />
        <Route path="/checkout/address" element={<ProtectedRoute><CheckoutAddressSlot /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      </Route>

      {/* Auth Pages — redirect to role home if already signed in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Farmer Onboarding / Registration — farmers only */}
      <Route 
        path="/farmer-registration" 
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerRegistration />
          </ProtectedRoute>
        } 
      />

      {/* Farmer Dashboard Portal — farmers only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FarmerDashboard />} />
        <Route path="farmer-home" element={<FarmerDashboard />} />
        <Route path="profile" element={<FarmerProfile />} />
        <Route path="bank-details" element={<FarmerBankDetails />} />
        <Route path="settings" element={<FarmerSettings />} />
        <Route path="leafy-vegetables" element={<AdminLeafyVegetables />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategoryManagement />} />
        <Route path="manage-categories" element={<AdminCategoryManagement />} />
        <Route path="orders" element={<AdminOrderManagement />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="delivery" element={<AdminDeliveryManagement />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="farmers" element={<AdminFarmers />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="offers" element={<AdminOffersCoupons />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="banners" element={<AdminLeafyVegetables />} />
        <Route path="reviews" element={<AdminLeafyVegetables />} />
        <Route path="reports" element={<AdminReportsAnalytics />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="farmers" element={<AdminFarmers />} />
        <Route path="pending" element={<AdminPending />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategoryManagement />} />
        <Route path="manage-categories" element={<AdminCategoryManagement />} />
        <Route path="leafy-vegetables" element={<AdminLeafyVegetables />} />
        <Route path="orders" element={<AdminOrderManagement />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="delivery" element={<AdminDeliveryManagement />} />
        <Route path="deliveries" element={<DeliveryOverview />} />
        <Route path="deliveries/active" element={<DeliveryList filter="active" title="Active Deliveries" />} />
        <Route path="deliveries/scheduled" element={<DeliveryList filter="scheduled" title="Scheduled Deliveries" />} />
        <Route path="deliveries/today" element={<DeliveryList filter="today" title="Deliveries Today" />} />
        <Route path="deliveries/week" element={<DeliveryList filter="week" title="Deliveries This Week" />} />
        <Route path="deliveries/month" element={<DeliveryList filter="month" title="Deliveries This Month" />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="farmers" element={<AdminFarmers />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="offers" element={<AdminOffersCoupons />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="banners" element={<AdminLeafyVegetables />} />
        <Route path="reviews" element={<AdminLeafyVegetables />} />
        <Route path="reports" element={<AdminReportsAnalytics />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>


      {/* Standalone Route Aliases */}
      <Route path="/products" element={<Navigate to="/dashboard/leafy-vegetables" replace />} />
      <Route path="/orders" element={<Navigate to="/dashboard/orders" replace />} />
      <Route path="/payments" element={<Navigate to="/dashboard/payments" replace />} />
      <Route path="/delivery" element={<Navigate to="/dashboard/delivery" replace />} />
      <Route path="/farmers" element={<Navigate to="/dashboard/farmers" replace />} />
      <Route path="/customers" element={<Navigate to="/dashboard/customers" replace />} />
      <Route path="/categories" element={<Navigate to="/dashboard/categories" replace />} />
      <Route path="/inventory" element={<Navigate to="/dashboard/inventory" replace />} />
      <Route path="/offers" element={<Navigate to="/dashboard/offers" replace />} />
      <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />
      <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
      <Route path="/support" element={<Navigate to="/dashboard/support" replace />} />
      <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

      {/* Projects Dashboard (Standalone UI Demo) */}
      <Route path="/projects-dashboard" element={<ProjectsDashboard />} />

      {/* Error & Fallbacks — role-aware redirect for unknown paths */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<RoleBasedFallback />} />
    </Routes>
  );
};

export default AppRoutes;
