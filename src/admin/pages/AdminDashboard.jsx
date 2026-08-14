import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApiService } from '../services/adminApiService';
import {
  ShoppingBag,
  Mail,
  Users,
  UserCheck,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  UserPlus,
  Bell,
  FileText,
  TrendingUp,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';

import tomatoImg from '../../assets/images/tomato.png';
import potatoImg from '../../assets/images/potato.png';
import onionImg from '../../assets/images/onion.png';
import spinachImg from '../../assets/images/leafy-vegetables/spinach.png';
import appleImg from '../../assets/images/apple.svg';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Active chart tab selector
  const [activeChart, setActiveChart] = useState('dailyOrders');
  const [activeSectionTab, setActiveSectionTab] = useState('all');

  // 1. Quick Action Buttons (6 actions requested)
  const quickActions = [
    { label: 'Add Product', icon: Plus, path: '/admin/products', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Add Farmer', icon: UserPlus, path: '/admin/farmers', color: '#0284C7', bg: '#E0F2FE' },
    { label: 'View Orders', icon: ShoppingBag, path: '/admin/orders', color: '#EA580C', bg: '#FFEDD5' },
    { label: 'Approve Farmers', icon: CheckCircle2, path: '/admin/farmers', color: '#9333EA', bg: '#F3E8FF' },
    { label: 'Send Notification', icon: Bell, path: '/admin/notifications', color: '#0D9488', bg: '#CCFBF1' },
    { label: 'Generate Report', icon: FileText, path: '/admin/reports', color: '#4F46E5', bg: '#EEF2FF' },
  ];

  // 2. 10 Summary Cards Grid (10 cards requested)
  const summaryCards = [
    { id: 'orders', title: 'Total Orders', value: '1,248', trend: '↑ 12.5%', subtext: 'from last month', icon: ShoppingBag, bg: '#DCFCE7', color: '#16A34A' },
    { id: 'sales', title: 'Total Sales', value: '$24,580', trend: '↑ 8.3%', subtext: 'from last month', icon: Mail, bg: '#E0F2FE', color: '#0284C7' },
    { id: 'customers', title: 'Total Customers', value: '856', trend: '↑ 15.7%', subtext: 'from last month', icon: Users, bg: '#FFEDD5', color: '#EA580C' },
    { id: 'farmers', title: 'Total Farmers', value: '128', trend: '↑ 10.2%', subtext: 'from last month', icon: UserCheck, bg: '#F3E8FF', color: '#9333EA' },
    { id: 'products', title: 'Total Products', value: '342', trend: '↑ 5.4%', subtext: 'from last month', icon: Package, bg: '#E0E7FF', color: '#4338CA' },
    { id: 'deliveries', title: 'Active Deliveries', value: '42', trend: 'Live', subtext: 'in-transit now', icon: Truck, bg: '#CCFBF1', color: '#0D9488' },
    { id: 'pending', title: 'Pending Orders', value: '18', trend: 'Requires action', subtext: 'awaiting dispatch', icon: Clock, bg: '#FEF3C7', color: '#D97706' },
    { id: 'delivered', title: 'Delivered Orders', value: '1,150', trend: '92% rate', subtext: 'fulfilled successfully', icon: CheckCircle2, bg: '#D1FAE5', color: '#059669' },
    { id: 'cancelled', title: 'Cancelled Orders', value: '38', trend: '3.0%', subtext: 'refunded orders', icon: XCircle, bg: '#FFE4E6', color: '#E11D48' },
    { id: 'stockout', title: 'Out-of-Stock Products', value: '12', trend: 'Action needed', subtext: 'low/zero stock', icon: AlertTriangle, bg: '#FEE2E2', color: '#DC2626' },
  ];

  // 3. 5 Analytical Charts Data
  const chartsData = {
    dailyOrders: {
      title: 'Daily Orders Chart',
      subtitle: 'Order count over the past 7 days',
      points: [
        { label: 'Mon', val: 140 },
        { label: 'Tue', val: 185 },
        { label: 'Wed', val: 160 },
        { label: 'Thu', val: 210 },
        { label: 'Fri', val: 245 },
        { label: 'Sat', val: 290 },
        { label: 'Sun', val: 310 },
      ],
      pathD: 'M 40,150 L 105,120 L 170,135 L 235,100 L 300,75 L 365,45 L 430,30',
      color: '#22C55E',
      type: 'line'
    },
    monthlySales: {
      title: 'Monthly Sales Chart',
      subtitle: 'Revenue ($) generated per month',
      points: [
        { label: 'Jan', val: 18500 },
        { label: 'Feb', val: 21200 },
        { label: 'Mar', val: 19800 },
        { label: 'Apr', val: 22400 },
        { label: 'May', val: 23600 },
        { label: 'Jun', val: 24100 },
        { label: 'Jul', val: 24580 },
      ],
      bars: [
        { label: 'Jan', val: 18.5, height: 110, y: 110, x: 50 },
        { label: 'Feb', val: 21.2, height: 130, y: 90, x: 115 },
        { label: 'Mar', val: 19.8, height: 120, y: 100, x: 180 },
        { label: 'Apr', val: 22.4, height: 140, y: 80, x: 245 },
        { label: 'May', val: 23.6, height: 150, y: 70, x: 310 },
        { label: 'Jun', val: 24.1, height: 155, y: 65, x: 375 },
        { label: 'Jul', val: 24.5, height: 160, y: 60, x: 440 },
      ],
      color: '#0284C7',
      type: 'bar'
    },
    revenue: {
      title: 'Revenue Growth Chart',
      subtitle: 'Cumulative platform revenue progression ($)',
      points: [
        { label: 'Jan', val: 18500 },
        { label: 'Feb', val: 39700 },
        { label: 'Mar', val: 59500 },
        { label: 'Apr', val: 81900 },
        { label: 'May', val: 105500 },
        { label: 'Jun', val: 129600 },
        { label: 'Jul', val: 154180 },
      ],
      pathD: 'M 40,180 C 100,160 160,130 220,105 C 280,80 340,50 430,25',
      color: '#16A34A',
      type: 'area'
    },
    customerGrowth: {
      title: 'Customer Growth Chart',
      subtitle: 'New customer user signups per month',
      points: [
        { label: 'Jan', val: 420 },
        { label: 'Feb', val: 510 },
        { label: 'Mar', val: 610 },
        { label: 'Apr', val: 690 },
        { label: 'May', val: 750 },
        { label: 'Jun', val: 805 },
        { label: 'Jul', val: 856 },
      ],
      pathD: 'M 40,165 C 100,145 160,120 220,100 C 280,85 340,65 430,45',
      color: '#EA580C',
      type: 'line'
    },
    farmerGrowth: {
      title: 'Farmer Growth Chart',
      subtitle: 'Onboarded verified farmers count',
      points: [
        { label: 'Jan', val: 45 },
        { label: 'Feb', val: 62 },
        { label: 'Mar', val: 78 },
        { label: 'Apr', val: 92 },
        { label: 'May', val: 105 },
        { label: 'Jun', val: 118 },
        { label: 'Jul', val: 128 },
      ],
      bars: [
        { label: 'Jan', val: 45, height: 60, y: 160, x: 50 },
        { label: 'Feb', val: 62, height: 80, y: 140, x: 115 },
        { label: 'Mar', val: 78, height: 100, y: 120, x: 180 },
        { label: 'Apr', val: 92, height: 120, y: 100, x: 245 },
        { label: 'May', val: 105, height: 135, y: 85, x: 310 },
        { label: 'Jun', val: 118, height: 150, y: 70, x: 375 },
        { label: 'Jul', val: 128, height: 165, y: 55, x: 440 },
      ],
      color: '#9333EA',
      type: 'bar'
    }
  };

  // 4. Section 1: Recent Orders
  const recentOrders = [
    { id: '#ORD12345', customer: 'John Smith', total: '$45.00', status: 'Delivered', date: 'Jul 24, 2024' },
    { id: '#ORD12346', customer: 'Sarah Johnson', total: '$67.50', status: 'Processing', date: 'Jul 24, 2024' },
    { id: '#ORD12347', customer: 'Michael Brown', total: '$32.00', status: 'Shipped', date: 'Jul 23, 2024' },
    { id: '#ORD12348', customer: 'Emily Davis', total: '$89.00', status: 'Delivered', date: 'Jul 23, 2024' },
    { id: '#ORD12349', customer: 'David Wilson', total: '$54.00', status: 'Processing', date: 'Jul 22, 2024' },
  ];

  // 5. Section 2: Top-Selling Products
  const topProducts = [
    { id: 1, name: 'Fresh Tomatoes', quantity: '250 kg', price: '$350.00', image: tomatoImg },
    { id: 2, name: 'Organic Potatoes', quantity: '180 kg', price: '$270.00', image: potatoImg },
    { id: 3, name: 'Red Onions', quantity: '150 kg', price: '$200.00', image: onionImg },
    { id: 4, name: 'Fresh Spinach', quantity: '120 kg', price: '$153.00', image: spinachImg },
    { id: 5, name: 'Green Apples', quantity: '100 kg', price: '$130.00', image: appleImg },
  ];

  // 6. Section 3: Low-Stock Products
  const lowStockProducts = [
    { id: 101, name: 'Fresh Mint Leaves', category: 'Leafy Veg', stock: '4 kg', status: 'Critical', unitPrice: '$1.20/kg' },
    { id: 102, name: 'Green Chilli', category: 'Vegetables', stock: '8 kg', status: 'Low Stock', unitPrice: '$2.50/kg' },
    { id: 103, name: 'Okra (Bhindi)', category: 'Vegetables', stock: '12 kg', status: 'Low Stock', unitPrice: '$1.80/kg' },
    { id: 104, name: 'Cauliflower', category: 'Vegetables', stock: '5 pcs', status: 'Critical', unitPrice: '$2.00/pc' },
  ];

  const [liveCustomers, setLiveCustomers] = useState([]);

  useEffect(() => {
    adminApiService.getCustomers().then(data => {
      if (Array.isArray(data)) {
        setLiveCustomers(data);
      }
    }).catch(() => {});
  }, []);

  // 7. Section 4: Recent Customers
  const recentCustomers = liveCustomers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    orders: c.ordersCount || 0,
    joined: c.registeredDate || 'Recent',
    avatar: (c.name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    isOnline: Boolean(c.isOnline || c.onlineStatus === 'ONLINE'),
    lastLoginAt: c.lastLoginAt
  }));

  // 8. Section 5: Recent Farmers
  const recentFarmers = [
    { id: 'FARM-128', name: 'Suresh Patil', location: 'Nashik, MH', crop: 'Organic Tomatoes & Spinach', status: 'Approved', joined: 'Jul 24, 2024' },
    { id: 'FARM-127', name: 'Rajesh Verma', location: 'Pune, MH', crop: 'Potatoes & Onions', status: 'Approved', joined: 'Jul 23, 2024' },
    { id: 'FARM-126', name: 'Mohan Das', location: 'Satara, MH', crop: 'Fresh Leafy Greens', status: 'Pending', joined: 'Jul 22, 2024' },
    { id: 'FARM-125', name: 'Baldev Singh', location: 'Ludhiana, PB', crop: 'Wheat & Mustard', status: 'Pending', joined: 'Jul 21, 2024' },
  ];

  // 9. Section 6: Delivery Status
  const deliveryStatus = [
    { status: 'Out for Delivery', count: 18, percentage: 42, color: '#0284C7' },
    { status: 'Assigned to Agent', count: 14, percentage: 33, color: '#8B5CF6' },
    { status: 'In-Transit to Hub', count: 10, percentage: 25, color: '#F59E0B' },
  ];

  // 10. Section 7: Payment Summary
  const paymentSummary = [
    { method: 'Razorpay / Online UPI', count: '942 Orders', amount: '$18,420.00', percentage: '75%' },
    { method: 'Cash on Delivery (COD)', count: '306 Orders', amount: '$6,160.00', percentage: '25%' },
    { method: 'Farmer Payouts Pending', count: '14 Farmers', amount: '$3,450.00', percentage: 'Pending' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Approved':
        return { bg: '#DCFCE7', color: '#15803D' };
      case 'Processing':
      case 'Pending':
      case 'Low Stock':
        return { bg: '#FFEDD5', color: '#C2410C' };
      case 'Shipped':
        return { bg: '#E0F2FE', color: '#0369A1' };
      case 'Critical':
        return { bg: '#FEE2E2', color: '#DC2626' };
      default:
        return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  const selectedChartData = chartsData[activeChart];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Welcome back! Here is your complete Farm to Home operations overview.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            backgroundColor: '#22C55E',
            color: '#FFFFFF',
            borderRadius: '10px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
          }}
        >
          <FileText size={16} /> Export Live Analytics
        </button>
      </div>

      {/* QUICK ACTIONS BAR (6 Quick Action Buttons requested) */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: action.bg,
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 10 SUMMARY CARDS GRID (All 10 requested metrics) */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Key Performance Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '18px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>{card.title}</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px', marginBottom: '6px' }}>
                    {card.value}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: card.color, fontWeight: 700 }}>{card.trend}</span>
                    <span style={{ color: '#94A3B8' }}>{card.subtext}</span>
                  </div>
                </div>

                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={19} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 ANALYTICAL CHARTS SECTION (All 5 requested charts) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {selectedChartData.title}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              {selectedChartData.subtitle}
            </p>
          </div>

          {/* Interactive Chart Selectors */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
            {[
              { id: 'dailyOrders', name: 'Daily Orders' },
              { id: 'monthlySales', name: 'Monthly Sales' },
              { id: 'revenue', name: 'Revenue Trend' },
              { id: 'customerGrowth', name: 'Customer Growth' },
              { id: 'farmerGrowth', name: 'Farmer Growth' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: activeChart === tab.id ? '#22C55E' : 'transparent',
                  color: activeChart === tab.id ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Render for Line / Bar / Area Chart */}
        <div style={{ width: '100%', height: '260px', position: 'relative' }}>
          <svg viewBox="0 0 500 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Horizontal Grid lines */}
            {[20, 60, 100, 140, 180].map((y, idx) => (
              <line key={idx} x1="30" y1={y} x2="490" y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
            ))}

            {selectedChartData.type === 'bar' && selectedChartData.bars ? (
              selectedChartData.bars.map((bar, idx) => (
                <g key={idx}>
                  <rect
                    x={bar.x - 12}
                    y={bar.y}
                    width="24"
                    height={bar.height}
                    fill={selectedChartData.color}
                    rx="4"
                  />
                  <text x={bar.x} y="210" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="500">
                    {bar.label}
                  </text>
                </g>
              ))
            ) : (
              <g>
                {selectedChartData.type === 'area' && (
                  <path
                    d={`${selectedChartData.pathD} L 430,180 L 40,180 Z`}
                    fill={selectedChartData.color}
                    fillOpacity="0.12"
                  />
                )}
                <path
                  d={selectedChartData.pathD}
                  fill="none"
                  stroke={selectedChartData.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {selectedChartData.points.map((pt, idx) => {
                  const x = 40 + idx * 65;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={60 + (idx % 2 === 0 ? 30 : 15)} r="4" fill={selectedChartData.color} stroke="#FFFFFF" strokeWidth="2" />
                      <text x={x} y="210" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="500">
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* DASHBOARD SECTIONS GRID: Recent Orders & Top Selling Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Section 1: Recent Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              View all →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentOrders.map((ord) => {
              const badge = getStatusBadge(ord.status);
              return (
                <div key={ord.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>{ord.id}</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E293B' }}>{ord.customer}</div>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{ord.total}</span>
                  <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                    {ord.status}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>{ord.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Top-Selling Products */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Top-Selling Products</h3>
            <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              View all →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topProducts.map((prod) => (
              <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                    <img src={prod.image} alt={prod.name} style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E293B' }}>{prod.name}</span>
                </div>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>{prod.quantity}</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{prod.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD SECTIONS GRID: Low-Stock Products & Recent Customers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Section 3: Low-Stock Products */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#DC2626', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={18} /> Low-Stock Products
            </h3>
            <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Restock All →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockProducts.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E293B' }}>{item.name}</div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>{item.category} • {item.unitPrice}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626' }}>{item.stock}</span>
                  <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Recent Customers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Customers</h3>
            <button onClick={() => navigate('/admin/customers')} style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              View Directory →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentCustomers.map((cust) => (
              <div key={cust.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cust.avatar}
                    </div>
                    {cust.isOnline && (
                      <span title="Online Now" style={{ position: 'absolute', bottom: '0', right: '0', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid #FFFFFF', boxShadow: '0 0 6px #22C55E' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cust.name}
                      {cust.isOnline && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803D', backgroundColor: '#DCFCE7', padding: '1px 6px', borderRadius: '8px' }}>ONLINE</span>
                      )}
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>{cust.email}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', display: 'block' }}>{cust.orders} Orders</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{cust.isOnline ? 'Active Session 🟢' : `Joined ${cust.joined}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD SECTIONS GRID: Recent Farmers, Delivery Status & Payment Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Section 5: Recent Farmers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Farmers</h3>
            <button onClick={() => navigate('/admin/farmers')} style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentFarmers.map((farmer) => {
              const badge = getStatusBadge(farmer.status);
              return (
                <div key={farmer.id} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>{farmer.name}</strong>
                    <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                      {farmer.status}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#64748B' }}>📍 {farmer.location}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: Delivery Status */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Delivery Status</h3>
            <button onClick={() => navigate('/admin/deliveries')} style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Logistics
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            {deliveryStatus.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{item.status}</span>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.count} orders</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage}%`, height: '100%', backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Payment Summary */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Payment Summary</h3>
            <button onClick={() => navigate('/admin/payments')} style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Payouts
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paymentSummary.map((pay, idx) => (
              <div key={idx} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{pay.method}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{pay.amount}</span>
                  <span style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 700 }}>{pay.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
