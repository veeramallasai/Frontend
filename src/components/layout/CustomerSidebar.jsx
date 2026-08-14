import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid3X3,
  Apple,
  Leaf,
  Sparkles,
  Package,
  Gift,
  Heart,
  ShoppingCart,
  MapPin,
  Bell,
  LifeBuoy,
  Settings,
  X,
} from 'lucide-react';
import { aiDeliveryScooter } from '../../assets/images/aiImageAssets';
import './CustomerSidebar.css';

export const customerMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/customer/dashboard', action: 'dashboard' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, route: '/customer/shop', action: 'reset' },
  { id: 'categories', label: 'Categories', icon: Grid3X3, route: '/customer/shop#categories', action: 'scroll-categories' },
  { id: 'fruits', label: 'Fruits', icon: Apple, route: '/customer/shop?category=Fruit', action: 'category', value: 'Fruit' },
  { id: 'vegetables', label: 'Vegetables', icon: Leaf, route: '/customer/shop?category=Vegetables', action: 'category', value: 'Vegetables' },
  { id: 'leafy', label: 'Leafy Vegetables', icon: Leaf, route: '/customer/shop?category=Leafy Vegetables', action: 'category', value: 'Leafy Vegetables' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: Sparkles, route: '/customer/shop?category=Dairy Products', action: 'category', value: 'Dairy Products' },
  { id: 'groceries', label: 'Groceries', icon: Package, route: '/customer/shop?category=Groceries', action: 'category', value: 'Groceries' },
  { id: 'offers', label: 'Offers & Coupons', icon: Gift, route: '/customer/shop?offers=true', action: 'discount' },
  { id: 'orders', label: 'My Orders', icon: Package, route: '/customer/orders', action: 'orders' },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart, route: '/customer/wishlist', action: 'wishlist' },
  { id: 'cart', label: 'My Cart', icon: ShoppingCart, badge: 3, badgeColor: 'green', route: '/customer/cart', action: 'cart' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, route: '/customer/addresses', action: 'addresses' },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5, badgeColor: 'red', route: '/customer/notifications', action: 'notifications' },
  { id: 'support', label: 'Support', icon: LifeBuoy, route: '/customer/support', action: 'support' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/customer/settings', action: 'settings' },
];

const CustomerSidebar = ({
  activeItem = 'shop',
  onItemClick,
  isOpen = false,
  onClose,
  className = '',
}) => {
  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Dark Mobile Overlay / Backdrop */}
      <div
        className={`sidebar-mobile-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Customer Left Sidebar */}
      <aside
        className={`customer-sidebar ${isOpen ? 'mobile-open' : ''} ${className}`}
        aria-label="Customer Navigation Sidebar"
      >
        {/* Brand Header & Logo */}
        <div className="sidebar-logo-wrap flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="sidebar-logo-icon-bg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="sidebar-logo-title">Farm2Home</h2>
              <p className="sidebar-logo-slogan">Freshness you can trust</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sidebar"
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <nav className="sidebar-nav-container">
          {customerMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item-active' : ''}`}
              >
                <Icon className="sidebar-menu-icon" />
                <span>{item.label}</span>

                {/* Badge (Cart/Notification) */}
                {item.badge ? (
                  <span
                    className={`sidebar-badge ${
                      item.badgeColor === 'red' ? 'sidebar-badge-red' : 'sidebar-badge-green'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom Banner Card (Free Delivery) */}
        <div className="sidebar-delivery-card">
          <div className="sidebar-delivery-info">
            <h4>Free Delivery</h4>
            <p>On orders above ₹499</p>
          </div>
          <img
            src={aiDeliveryScooter}
            alt="Express Delivery Scooter"
            className="sidebar-delivery-img"
          />
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
