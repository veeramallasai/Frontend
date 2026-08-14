import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  BarChart2,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Users,
  Layers,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const CouponManagement = () => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('All');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [usageDetailsModalCoupon, setUsageDetailsModalCoupon] = useState(null);

  // 16-Field Add/Edit Coupon Form State
  const defaultFormState = {
    id: '',
    code: '',
    name: '',
    description: '',
    discountType: 'Percentage',
    percentageDiscount: 20,
    fixedAmountDiscount: 5.00,
    minOrderAmount: 20.00,
    maxDiscountAmount: 10.00,
    startDate: '2024-07-20',
    expiryDate: '2024-08-31',
    totalUsageLimit: 500,
    usageLimitPerCustomer: 2,
    applicableCategories: 'All Categories',
    applicableProducts: 'All Products',
    applicableCustomers: 'All Customers',
    status: 'Active',
  };

  const [formData, setFormData] = useState(defaultFormState);

  // Initial 13-Column Dataset with 16 Form Fields & 4 Statuses
  const initialCoupons = [
    {
      id: '#CPN-701',
      code: 'FRESH20',
      name: '20% OFF Fresh Farm Veggies',
      description: 'Get 20% instant discount on all organic vegetables above $20.',
      discountType: 'Percentage',
      percentageDiscount: 20,
      fixedAmountDiscount: 0,
      discountValue: '20% OFF',
      minOrderAmount: '$20.00',
      maxDiscountAmount: '$10.00',
      numericMinOrder: 20.00,
      numericMaxDiscount: 10.00,
      startDate: 'Jul 20, 2024',
      expiryDate: 'Aug 31, 2024',
      totalUsageLimit: 500,
      usageLimitPerCustomer: 2,
      usedCount: 142,
      applicableCategories: 'Vegetables, Leafy Greens',
      applicableProducts: 'All Vegetables',
      applicableCustomers: 'All Customers',
      status: 'Active',
      totalSavings: '$1,420.00',
      redemptionsLog: [
        { customer: 'Ramesh Kumar', orderId: '#ORD12345', discount: '$8.50', date: 'Jul 24, 2024' },
        { customer: 'Ananya Sharma', orderId: '#ORD12346', discount: '$10.00', date: 'Jul 24, 2024' },
      ]
    },
    {
      id: '#CPN-702',
      code: 'ORGANIC5',
      name: '$5 Flat OFF on Organic Ghee',
      description: 'Flat $5 savings on pure Vedic cow ghee & dairy products.',
      discountType: 'Fixed Amount',
      percentageDiscount: 0,
      fixedAmountDiscount: 5.00,
      discountValue: '$5.00 OFF',
      minOrderAmount: '$30.00',
      maxDiscountAmount: '$5.00',
      numericMinOrder: 30.00,
      numericMaxDiscount: 5.00,
      startDate: 'Jul 15, 2024',
      expiryDate: 'Aug 15, 2024',
      totalUsageLimit: 300,
      usageLimitPerCustomer: 1,
      usedCount: 88,
      applicableCategories: 'Dairy Products',
      applicableProducts: 'Pure Desi Ghee',
      applicableCustomers: 'All Customers',
      status: 'Active',
      totalSavings: '$440.00',
      redemptionsLog: [
        { customer: 'Vikram Singh', orderId: '#ORD12347', discount: '$5.00', date: 'Jul 23, 2024' },
      ]
    },
    {
      id: '#CPN-703',
      code: 'WELCOME100',
      name: 'First Order $10 Off',
      description: 'Welcome bonus discount for new customer registrations.',
      discountType: 'Fixed Amount',
      percentageDiscount: 0,
      fixedAmountDiscount: 10.00,
      discountValue: '$10.00 OFF',
      minOrderAmount: '$25.00',
      maxDiscountAmount: '$10.00',
      numericMinOrder: 25.00,
      numericMaxDiscount: 10.00,
      startDate: 'Jul 01, 2024',
      expiryDate: 'Dec 31, 2024',
      totalUsageLimit: 1000,
      usageLimitPerCustomer: 1,
      usedCount: 420,
      applicableCategories: 'All Categories',
      applicableProducts: 'All Products',
      applicableCustomers: 'New Customers Only',
      status: 'Active',
      totalSavings: '$4,200.00',
      redemptionsLog: [
        { customer: 'Siddharth Roy', orderId: '#ORD12200', discount: '$10.00', date: 'Jul 15, 2024' },
      ]
    },
    {
      id: '#CPN-704',
      code: 'FESTIVE30',
      name: 'Festive Season 30% Mega Sale',
      description: 'Special seasonal mega sale discount code.',
      discountType: 'Percentage',
      percentageDiscount: 30,
      fixedAmountDiscount: 0,
      discountValue: '30% OFF',
      minOrderAmount: '$50.00',
      maxDiscountAmount: '$25.00',
      numericMinOrder: 50.00,
      numericMaxDiscount: 25.00,
      startDate: 'Aug 15, 2024',
      expiryDate: 'Aug 20, 2024',
      totalUsageLimit: 200,
      usageLimitPerCustomer: 1,
      usedCount: 0,
      applicableCategories: 'All Categories',
      applicableProducts: 'All Products',
      applicableCustomers: 'All Customers',
      status: 'Scheduled',
      totalSavings: '$0.00',
      redemptionsLog: []
    },
    {
      id: '#CPN-705',
      code: 'SUMMER15',
      name: 'Summer Splash 15% OFF',
      description: 'Expired summer promotional discount code.',
      discountType: 'Percentage',
      percentageDiscount: 15,
      fixedAmountDiscount: 0,
      discountValue: '15% OFF',
      minOrderAmount: '$15.00',
      maxDiscountAmount: '$8.00',
      numericMinOrder: 15.00,
      numericMaxDiscount: 8.00,
      startDate: 'Jun 01, 2024',
      expiryDate: 'Jul 01, 2024',
      totalUsageLimit: 400,
      usageLimitPerCustomer: 3,
      usedCount: 400,
      applicableCategories: 'Fruits & Juices',
      applicableProducts: 'Seasonal Fruits',
      applicableCustomers: 'All Customers',
      status: 'Expired',
      totalSavings: '$2,800.00',
      redemptionsLog: []
    }
  ];

  const [coupons, setCoupons] = useState(initialCoupons);

  // Action 1: Open Add Coupon Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData(defaultFormState);
    setShowAddEditModal(true);
  };

  // Action 2: Open Edit Coupon Modal
  const handleOpenEditModal = (cpn) => {
    setIsEditing(true);
    setFormData({
      ...cpn,
      startDate: '2024-07-20',
      expiryDate: '2024-08-31',
    });
    setShowAddEditModal(true);
  };

  // Save Coupon (Submit Form)
  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Please enter Coupon Code and Name.');
      return;
    }

    const valueStr =
      formData.discountType === 'Percentage'
        ? `${formData.percentageDiscount}% OFF`
        : `$${Number(formData.fixedAmountDiscount).toFixed(2)} OFF`;

    if (isEditing) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === formData.id
            ? {
                ...c,
                code: formData.code.toUpperCase(),
                name: formData.name,
                description: formData.description,
                discountType: formData.discountType,
                percentageDiscount: Number(formData.percentageDiscount),
                fixedAmountDiscount: Number(formData.fixedAmountDiscount),
                discountValue: valueStr,
                minOrderAmount: `$${Number(formData.minOrderAmount).toFixed(2)}`,
                maxDiscountAmount: `$${Number(formData.maxDiscountAmount).toFixed(2)}`,
                totalUsageLimit: Number(formData.totalUsageLimit),
                usageLimitPerCustomer: Number(formData.usageLimitPerCustomer),
                applicableCategories: formData.applicableCategories,
                applicableProducts: formData.applicableProducts,
                applicableCustomers: formData.applicableCustomers,
                status: formData.status,
              }
            : c
        )
      );
      toast.success(`Coupon "${formData.code}" updated successfully.`);
    } else {
      const newCpn = {
        id: `#CPN-${Date.now().toString().slice(-3)}`,
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || 'Promotional promo code.',
        discountType: formData.discountType,
        percentageDiscount: Number(formData.percentageDiscount),
        fixedAmountDiscount: Number(formData.fixedAmountDiscount),
        discountValue: valueStr,
        minOrderAmount: `$${Number(formData.minOrderAmount).toFixed(2)}`,
        maxDiscountAmount: `$${Number(formData.maxDiscountAmount).toFixed(2)}`,
        startDate: 'Jul 24, 2024',
        expiryDate: 'Aug 31, 2024',
        totalUsageLimit: Number(formData.totalUsageLimit),
        usageLimitPerCustomer: Number(formData.usageLimitPerCustomer),
        usedCount: 0,
        applicableCategories: formData.applicableCategories,
        applicableProducts: formData.applicableProducts,
        applicableCustomers: formData.applicableCustomers,
        status: formData.status,
        totalSavings: '$0.00',
        redemptionsLog: [],
      };
      setCoupons([newCpn, ...coupons]);
      toast.success(`Coupon "${newCpn.code}" created successfully.`);
    }

    setShowAddEditModal(false);
  };

  // Action 4 & 5: Activate / Deactivate Coupon
  const handleToggleStatus = (id, code, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );
    if (nextStatus === 'Active') {
      toast.success(`Coupon "${code}" activated for store checkout.`);
    } else {
      toast.info(`Coupon "${code}" deactivated.`);
    }
  };

  // Action 3: Delete Coupon
  const handleDeleteCoupon = (id, code) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.error(`Coupon "${code}" deleted.`);
  };

  // Filter Logic
  const filteredCoupons = coupons.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.id.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesDiscount = discountTypeFilter === 'All' || c.discountType === discountTypeFilter;

    return matchesSearch && matchesStatus && matchesDiscount;
  });

  // Badge Style for 4 Coupon Statuses
  const getCouponStatusBadge = (status) => {
    switch (status) {
      case 'Active': return { bg: '#DCFCE7', color: '#15803D' };
      case 'Inactive': return { bg: '#F1F5F9', color: '#64748B' };
      case 'Expired': return { bg: '#FEE2E2', color: '#DC2626' };
      case 'Scheduled': return { bg: '#F3E8FF', color: '#9333EA' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Offers & Promo Coupons</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Create discount promo codes, set usage limits, track customer redemptions, and schedule promotional offers.
          </p>
        </div>

        {/* Action 1: Add Coupon Button */}
        <button
          onClick={handleOpenAddModal}
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
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
          }}
        >
          <Plus size={18} /> Create New Coupon
        </button>
      </div>

      {/* FILTERS BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search coupon code, ID, or promo name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Coupon Statuses (4)</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Expired">Expired</option>
        </select>

        {/* Discount Type Filter */}
        <select
          value={discountTypeFilter}
          onChange={(e) => setDiscountTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Discount Types</option>
          <option value="Percentage">Percentage (%)</option>
          <option value="Fixed Amount">Fixed Amount ($)</option>
        </select>

        <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto', fontWeight: 600 }}>
          Total Coupons: {filteredCoupons.length}
        </span>
      </div>

      {/* 13-COLUMN COUPONS TABLE */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredCoupons.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No promo coupons found matching your search.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Coupon ID</th>
                  <th>Coupon Code</th>
                  <th>Coupon Name</th>
                  <th>Discount Type</th>
                  <th>Discount Value</th>
                  <th>Min Order</th>
                  <th>Max Discount</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Limit</th>
                  <th>Used Count</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((cpn) => {
                  const badge = getCouponStatusBadge(cpn.status);
                  return (
                    <tr key={cpn.id}>
                      {/* 1. Coupon ID */}
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>{cpn.id}</td>

                      {/* 2. Coupon Code */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: '#16A34A',
                            backgroundColor: '#DCFCE7',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px border #BBF7D0',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {cpn.code}
                        </span>
                      </td>

                      {/* 3. Coupon Name */}
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{cpn.name}</td>

                      {/* 4. Discount Type */}
                      <td style={{ fontSize: '12px', color: '#475569' }}>{cpn.discountType}</td>

                      {/* 5. Discount Value */}
                      <td style={{ fontWeight: 800, color: '#EA580C' }}>{cpn.discountValue}</td>

                      {/* 6. Minimum Order Amount */}
                      <td style={{ fontWeight: 600 }}>{cpn.minOrderAmount}</td>

                      {/* 7. Maximum Discount */}
                      <td style={{ color: '#64748B' }}>{cpn.maxDiscountAmount}</td>

                      {/* 8. Start Date */}
                      <td style={{ fontSize: '11.5px', color: '#64748B' }}>{cpn.startDate}</td>

                      {/* 9. Expiry Date */}
                      <td style={{ fontSize: '11.5px', color: '#DC2626', fontWeight: 600 }}>{cpn.expiryDate}</td>

                      {/* 10. Usage Limit */}
                      <td style={{ fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>{cpn.totalUsageLimit}</td>

                      {/* 11. Used Count */}
                      <td style={{ fontWeight: 800, color: '#0284C7', textAlign: 'center' }}>
                        {cpn.usedCount} / {cpn.totalUsageLimit}
                      </td>

                      {/* 12. Status */}
                      <td>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                          {cpn.status}
                        </span>
                      </td>

                      {/* 13. Actions (6 Required Actions) */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          {/* Action 6: View Usage Details */}
                          <button
                            onClick={() => setUsageDetailsModalCoupon(cpn)}
                            title="View Usage & Redemption Log"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E0F2FE', color: '#0284C7', cursor: 'pointer' }}
                          >
                            <BarChart2 size={13} />
                          </button>

                          {/* Action 2: Edit Coupon */}
                          <button
                            onClick={() => handleOpenEditModal(cpn)}
                            title="Edit Coupon Details"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F0FDF4', color: '#16A34A', cursor: 'pointer' }}
                          >
                            <Edit size={13} />
                          </button>

                          {/* Action 4 & 5: Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(cpn.id, cpn.code, cpn.status)}
                            title={cpn.status === 'Active' ? 'Deactivate Coupon' : 'Activate Coupon'}
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: cpn.status === 'Active' ? '#FEF2F2' : '#DCFCE7', color: cpn.status === 'Active' ? '#DC2626' : '#15803D', cursor: 'pointer' }}
                          >
                            {cpn.status === 'Active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                          </button>

                          {/* Action 3: Delete Coupon */}
                          <button
                            onClick={() => handleDeleteCoupon(cpn.id, cpn.code)}
                            title="Delete Coupon"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: 16-FIELD ADD / EDIT COUPON FORM */}
      {showAddEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
              {isEditing ? `Edit Promo Coupon (${formData.code})` : 'Create New Coupon (16 Form Fields)'}
            </h3>

            <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Code, Name, Discount Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>1. Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="FRESH20"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>2. Coupon Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="20% OFF Fresh Veggies"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>4. Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>3. Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Offer details visible to customers..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              {/* Row 3: Percentage Discount, Fixed Amount Discount, Min Order Amount, Max Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>5. Percentage (%)</label>
                  <input
                    type="number"
                    disabled={formData.discountType !== 'Percentage'}
                    value={formData.percentageDiscount}
                    onChange={(e) => setFormData({ ...formData, percentageDiscount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>6. Fixed Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={formData.discountType !== 'Fixed Amount'}
                    value={formData.fixedAmountDiscount}
                    onChange={(e) => setFormData({ ...formData, fixedAmountDiscount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>7. Min Order ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>8. Max Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 4: Start Date, Expiry Date, Total Usage Limit, Limit per Customer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>9. Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>10. Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>11. Total Limit</label>
                  <input
                    type="number"
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>12. Per Customer</label>
                  <input
                    type="number"
                    value={formData.usageLimitPerCustomer}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerCustomer: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Row 5: Applicable Categories, Products, Customers, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>13. Categories</label>
                  <input
                    type="text"
                    value={formData.applicableCategories}
                    onChange={(e) => setFormData({ ...formData, applicableCategories: e.target.value })}
                    placeholder="All Categories"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>14. Products</label>
                  <input
                    type="text"
                    value={formData.applicableProducts}
                    onChange={(e) => setFormData({ ...formData, applicableProducts: e.target.value })}
                    placeholder="All Products"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>15. Customers</label>
                  <select
                    value={formData.applicableCustomers}
                    onChange={(e) => setFormData({ ...formData, applicableCustomers: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="New Customers Only">New Customers Only</option>
                    <option value="VIP Members">VIP Members</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>16. Coupon Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#22C55E', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isEditing ? 'Save Coupon Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW USAGE DETAILS & REDEMPTIONS LOG */}
      {usageDetailsModalCoupon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setUsageDetailsModalCoupon(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', marginBottom: '14px' }}>
              <BarChart2 size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>
                Coupon Usage & Savings Analytics
              </h3>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div><strong>Coupon Code:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#16A34A' }}>{usageDetailsModalCoupon.code}</span></div>
              <div><strong>Coupon Name:</strong> {usageDetailsModalCoupon.name}</div>
              <div><strong>Total Redemptions:</strong> {usageDetailsModalCoupon.usedCount} / {usageDetailsModalCoupon.totalUsageLimit} Uses</div>
              <div><strong>Total Customer Savings:</strong> <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '15px' }}>{usageDetailsModalCoupon.totalSavings}</span></div>
              <div><strong>Limit Per Customer:</strong> {usageDetailsModalCoupon.usageLimitPerCustomer} use(s)</div>
              <div><strong>Target Audience:</strong> {usageDetailsModalCoupon.applicableCustomers}</div>
            </div>

            {/* Redemptions Log */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Recent Redemptions Log</h4>
              {usageDetailsModalCoupon.redemptionsLog && usageDetailsModalCoupon.redemptionsLog.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {usageDetailsModalCoupon.redemptionsLog.map((log, idx) => (
                    <div key={idx} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>{log.customer} ({log.orderId})</strong>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{log.date}</div>
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#16A34A' }}>Saved {log.discount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12.5px', color: '#94A3B8', textAlign: 'center', padding: '12px' }}>No redemptions logged yet.</div>
              )}
            </div>

            <button
              onClick={() => setUsageDetailsModalCoupon(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
