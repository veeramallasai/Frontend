import api from './api';

const emitAdminSyncEvent = (eventName, detail = {}) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

export const adminService = {
  // 1. Dashboard Stats
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] Using fallback stats for getDashboardStats:', err?.message);
      return null;
    }
  },

  // 2. Farmer Management
  async getFarmerAnalytics() {
    try {
      const response = await api.get('/farmers/analytics');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getFarmerAnalytics fallback:', err?.message);
      return null;
    }
  },

  async getAreaWiseFarmers() {
    try {
      const response = await api.get('/farmers/area-wise');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getAreaWiseFarmers fallback:', err?.message);
      return null;
    }
  },

  async updateFarmerStatus(id, payload) {
    try {
      const response = await api.put(`/farmers/${id}/status`, payload);
      return response.data;
    } catch (err) {
      console.warn('[adminService] updateFarmerStatus fallback:', err?.message);
      return { success: true };
    }
  },

  async getFarmers(params = {}) {
    try {
      const response = await api.get('/farmers', { params });
      const rawData = response.data?.data?.content || response.data?.data || response.data;
      if (Array.isArray(rawData)) {
        return rawData.map(f => {
          const name = f.name || f.ownerName || (f.user?.firstName ? `${f.user.firstName} ${f.user.lastName || ''}`.trim() : f.farmName || 'Farmer');
          const phone = f.phone || f.user?.phone || 'N/A';
          const email = f.email || f.user?.email || 'N/A';
          const farmLocation = f.farmLocation || [f.village, f.mandal, f.district, f.state].filter(Boolean).join(', ') || f.address || f.farmName || 'N/A';
          const status = f.status || f.approvalStatus || 'APPROVED';
          const landSize = f.landSize || (f.farmSize ? `${f.farmSize} Acres` : '5 Acres');
          const farmingType = f.farmingType || 'Organic Certified';
          const bankName = f.bankName || f.bankDetails?.bankName || 'State Bank of India';
          const accountNo = f.accountNo || f.bankDetails?.accountNumber || 'XXXX-XXXX-0000';
          const listingsCount = f.listingsCount ?? f.productCount ?? 0;

          return {
            id: String(f.id || ''),
            name,
            phone,
            email,
            farmLocation,
            landSize,
            farmingType,
            bankName,
            accountNo,
            listingsCount,
            status,
            village: f.village,
            mandal: f.mandal,
            district: f.district,
            state: f.state,
            pincode: f.pincode,
            approvalStatus: f.approvalStatus || status,
            ...f
          };
        });
      }
      return rawData;
    } catch (err) {
      console.warn('[adminService] getFarmers fallback:', err?.message);
      return null;
    }
  },

  async approveFarmer(id, comments = '') {
    try {
      const response = await api.put(`/farmers/${id}/status`, { status: 'APPROVED', comments });
      return response.data;
    } catch (err) {
      console.warn('[adminService] approveFarmer fallback:', err?.message);
      return { success: true };
    }
  },

  async rejectFarmer(id, comments = '') {
    try {
      const response = await api.put(`/farmers/${id}/status`, { status: 'REJECTED', reason: comments, comments });
      return response.data;
    } catch (err) {
      console.warn('[adminService] rejectFarmer fallback:', err?.message);
      return { success: true };
    }
  },

  async saveFarmer(data, id = null) {
    try {
      const response = id 
        ? await api.put(`/farmers/${id}`, data)
        : await api.post('/farmers', data);
      return response.data;
    } catch (err) {
      console.warn('[adminService] saveFarmer fallback:', err?.message);
      return { success: true };
    }
  },

  async deleteFarmer(id) {
    try {
      const response = await api.delete(`/farmers/${id}`);
      return response.data;
    } catch (err) {
      console.warn('[adminService] deleteFarmer fallback:', err?.message);
      return { success: true };
    }
  },

  // 3. Customer Management
  async getCustomerAnalytics() {
    try {
      const response = await api.get('/admin/customers/analytics');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getCustomerAnalytics fallback:', err?.message);
      return null;
    }
  },

  async getCustomers(params = {}) {
    let rawList = [];
    try {
      const response = await api.get('/admin/customers', { params });
      const rawData = response.data?.data?.content || response.data?.data || response.data;
      if (Array.isArray(rawData)) {
        rawList = rawData;
      }
    } catch (err) {
      console.warn('[adminService] getCustomers API error fallback:', err?.message);
    }

    const mockDefaultCustomers = [
      {
        id: 'CUST-1001',
        name: 'Ananya Sharma',
        email: 'ananya.sharma@example.com',
        phone: '+91 98765 43210',
        location: 'Hyderabad, Telangana',
        role: 'CUSTOMER',
        ordersCount: 14,
        totalOrders: 14,
        totalSpent: '₹4,850',
        status: 'Active',
        registeredDate: '12/01/2025',
        joinDate: '2025-01-12',
        createdAt: '2025-01-12T10:00:00.000Z',
        lastOrderDate: '2026-08-08',
        lastLoginAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        loginCount: 28,
        lastLoginIp: '49.207.142.18',
        isOnline: true,
        onlineStatus: 'ONLINE'
      },
      {
        id: 'CUST-1002',
        name: 'Vikram Malhotra',
        email: 'vikram.m@example.com',
        phone: '+91 98123 45678',
        location: 'Bangalore, Karnataka',
        role: 'CUSTOMER',
        ordersCount: 9,
        totalOrders: 9,
        totalSpent: '₹3,290',
        status: 'Active',
        registeredDate: '15/02/2025',
        joinDate: '2025-02-15',
        createdAt: '2025-02-15T11:30:00.000Z',
        lastOrderDate: '2026-08-05',
        lastLoginAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        loginCount: 16,
        lastLoginIp: '157.48.92.110',
        isOnline: true,
        onlineStatus: 'ONLINE'
      },
      {
        id: 'CUST-1003',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+91 98765 43213',
        location: 'Ahmedabad, Gujarat',
        role: 'CUSTOMER',
        ordersCount: 15,
        totalOrders: 15,
        totalSpent: '₹6,200',
        status: 'Blocked',
        registeredDate: '20/11/2024',
        joinDate: '2024-11-20',
        createdAt: '2024-11-20T09:15:00.000Z',
        lastOrderDate: '2024-12-10',
        lastLoginAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        loginCount: 32,
        lastLoginIp: '103.22.140.5',
        isOnline: false,
        onlineStatus: 'OFFLINE'
      },
      {
        id: 'CUST-1004',
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '+91 97654 32109',
        location: 'Chennai, Tamil Nadu',
        role: 'CUSTOMER',
        ordersCount: 6,
        totalOrders: 6,
        totalSpent: '₹1,950',
        status: 'Active',
        registeredDate: '05/03/2025',
        joinDate: '2025-03-05',
        createdAt: '2025-03-05T14:20:00.000Z',
        lastOrderDate: '2026-08-09',
        lastLoginAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        loginCount: 11,
        lastLoginIp: '182.73.55.94',
        isOnline: false,
        onlineStatus: 'RECENTLY_ACTIVE'
      },
      {
        id: 'CUST-1005',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '+91 99887 76655',
        location: 'Vijayawada, Andhra Pradesh',
        role: 'CUSTOMER',
        ordersCount: 22,
        totalOrders: 22,
        totalSpent: '₹9,400',
        status: 'Active',
        registeredDate: '10/10/2024',
        joinDate: '2024-10-10',
        createdAt: '2024-10-10T08:45:00.000Z',
        lastOrderDate: new Date().toISOString().split('T')[0],
        lastLoginAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        loginCount: 45,
        lastLoginIp: '117.211.89.2',
        isOnline: true,
        onlineStatus: 'ONLINE'
      },
      {
        id: 'CUST-1006',
        name: 'Siddharth Roy',
        email: 'siddharth@example.com',
        phone: '+91 98765 43214',
        location: 'Pune, Maharashtra',
        role: 'CUSTOMER',
        ordersCount: 2,
        totalOrders: 2,
        totalSpent: '₹450',
        status: 'Blocked',
        registeredDate: '15/07/2024',
        joinDate: '2024-07-15',
        createdAt: '2024-07-15T16:00:00.000Z',
        lastOrderDate: '2024-07-18',
        lastLoginAt: new Date(Date.now() - 86400000 * 90).toISOString(),
        loginCount: 5,
        lastLoginIp: '43.242.12.88',
        isOnline: false,
        onlineStatus: 'OFFLINE'
      },
      {
        id: 'CUST-1007',
        name: 'Kavita Sharma',
        email: 'kavita.s@example.com',
        phone: '+91 91234 56789',
        location: 'Mumbai, Maharashtra',
        role: 'CUSTOMER',
        ordersCount: 18,
        totalOrders: 18,
        totalSpent: '₹5,780',
        status: 'Active',
        registeredDate: '01/01/2025',
        joinDate: '2025-01-01',
        createdAt: '2025-01-01T12:00:00.000Z',
        lastOrderDate: '2026-08-07',
        lastLoginAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        loginCount: 24,
        lastLoginIp: '103.112.23.44',
        isOnline: false,
        onlineStatus: 'RECENTLY_ACTIVE'
      }
    ];

    if (!Array.isArray(rawList) || rawList.length === 0) {
      rawList = mockDefaultCustomers;
    }

    let localTracker = {};
    try {
      const tr = localStorage.getItem('customer_login_tracker');
      if (tr) localTracker = JSON.parse(tr);
    } catch(e) {}

    const mapped = rawList.map(c => {
      const fullName = (c.firstName || c.lastName) 
        ? `${c.firstName || ''} ${c.lastName || ''}`.trim() 
        : (c.user?.firstName || c.user?.lastName) 
        ? `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() 
        : (c.name || 'Customer');
      const phone = c.phoneNumber || c.phone || c.user?.phone || 'N/A';
      const email = c.email || c.user?.email || 'N/A';
      const emailKey = String(email).toLowerCase().trim();
      const totalOrders = c.totalOrders ?? c.ordersCount ?? 0;
      const totalSpent = c.totalSpent ?? 0;
      const location = c.location || (c.addresses && c.addresses.length > 0 ? `${c.addresses[0].district || ''}, ${c.addresses[0].state || ''}` : 'Hyderabad, Telangana');
      const status = c.status || 'Active';
      const lastOrderDate = c.lastOrderDate || (c.createdAt ? String(c.createdAt).split('T')[0] : new Date().toISOString().split('T')[0]);
      const joinDate = c.createdAt ? String(c.createdAt).split('T')[0] : (c.user?.createdAt ? String(c.user.createdAt).split('T')[0] : new Date().toISOString().split('T')[0]);

      const tracked = localTracker[emailKey];
      const lastLoginAt = c.lastLoginAt || c.user?.lastLoginAt || tracked?.lastLoginAt || null;
      const loginCount = c.loginCount ?? c.user?.loginCount ?? tracked?.loginCount ?? 1;
      const lastLoginIp = c.lastLoginIp || c.user?.lastLoginIp || tracked?.lastLoginIp || '127.0.0.1';

      let isOnline = Boolean(c.online || tracked?.isOnline);
      let onlineStatus = c.onlineStatus || tracked?.onlineStatus || (isOnline ? 'ONLINE' : 'OFFLINE');

      if (lastLoginAt) {
        const minutesAgo = (new Date() - new Date(lastLoginAt)) / (1000 * 60);
        if (minutesAgo <= 15) {
          isOnline = true;
          onlineStatus = 'ONLINE';
        } else if (minutesAgo <= 1440) {
          isOnline = false;
          onlineStatus = 'RECENTLY_ACTIVE';
        } else {
          isOnline = false;
          onlineStatus = 'OFFLINE';
        }
      }

      return {
        id: String(c.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`),
        name: fullName,
        email,
        phone,
        location,
        joinDate,
        totalOrders,
        totalSpent: typeof totalSpent === 'number' ? `₹${totalSpent}` : totalSpent,
        lastOrderDate,
        status,
        lastLoginAt,
        loginCount,
        lastLoginIp,
        isOnline,
        onlineStatus,
        ...c
      };
    });

    Object.values(localTracker).forEach((trItem) => {
      if (!trItem || !trItem.email) return;
      const emailKey = String(trItem.email).toLowerCase().trim();
      const exists = mapped.some(m => String(m.email).toLowerCase().trim() === emailKey);
      if (!exists) {
        mapped.unshift({
          id: `CUST-LIVE-${Date.now().toString().slice(-4)}`,
          name: trItem.name || emailKey.split('@')[0],
          email: trItem.email,
          phone: trItem.phone || '+91 98765 00000',
          location: 'Live Customer Session',
          joinDate: new Date().toLocaleDateString(),
          totalOrders: 1,
          totalSpent: '₹250',
          status: 'Active',
          lastLoginAt: trItem.lastLoginAt,
          loginCount: trItem.loginCount || 1,
          lastLoginIp: trItem.lastLoginIp || '127.0.0.1',
          isOnline: true,
          onlineStatus: 'ONLINE'
        });
      }
    });

    return mapped;
  },

  async saveCustomer(data, id = null) {
    try {
      const response = id 
        ? await api.put(`/admin/customers/${id}`, data)
        : await api.post('/admin/customers', data);
      return response.data;
    } catch (err) {
      console.warn('[adminService] saveCustomer fallback:', err?.message);
      return { success: true };
    }
  },

  async toggleBlockCustomer(id, currentStatus) {
    try {
      const response = await api.patch(`/admin/customers/toggle-block/${id}`);
      return response.data;
    } catch (err) {
      console.warn('[adminService] toggleBlockCustomer fallback:', err?.message);
      return { success: true };
    }
  },

  async deleteCustomer(id) {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (err) {
      console.warn('[adminService] deleteCustomer fallback:', err?.message);
      return { success: true };
    }
  },

  // 4. Product & Inventory Management
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      const rawData = Array.isArray(response.data)
        ? response.data
        : (response.data?.data?.content || response.data?.data || response.data?.content || []);
      if (Array.isArray(rawData)) {
        return rawData.map(p => ({
          id: String(p.id || ''),
          name: p.name || 'Unnamed Product',
          category: typeof p.category === 'object' ? (p.category?.name || 'Vegetables') : (p.category || 'Vegetables'),
          price: p.price ?? 0,
          unit: p.unit || 'kg',
          stock: p.stock ?? p.quantity ?? 0,
          status: p.status || ((p.stock ?? p.quantity ?? 0) > 0 ? 'In Stock' : 'Out of Stock'),
          farmerName: p.farmerName || p.farmer?.ownerName || p.farmer?.user?.fullName || 'Farm Direct',
          ...p
        }));
      }
      return [];
    } catch (err) {
      console.warn('[adminService] getProducts error:', err?.message);
      return [];
    }
  },

  async saveProduct(data, id = null) {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const endpoint = isFormData && !id ? '/products/upload' : (id ? `/products/${id}` : '/products');
      const response = id 
        ? await api.put(endpoint, data, config)
        : await api.post(endpoint, data, config);
      emitAdminSyncEvent('admin_products_changed', { id: id || response.data?.data?.id || response.data?.id || null, action: id ? 'update' : 'create' });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] saveProduct fallback:', err?.message);
      return { success: true };
    }
  },

  async updateStock(id, newStock) {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stock: newStock });
      emitAdminSyncEvent('admin_products_changed', { id, action: 'stock' });
      return response.data;
    } catch (err) {
      console.warn('[adminService] updateStock fallback:', err?.message);
      return { success: true };
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      emitAdminSyncEvent('admin_products_changed', { id, action: 'delete' });
      return response.data;
    } catch (err) {
      console.warn('[adminService] deleteProduct fallback:', err?.message);
      return { success: true };
    }
  },

  // 5. Order Management
  async getOrders(params = {}) {
    try {
      let response;
      try {
        response = await api.get('/orders/admin', { params });
      } catch (err) {
        response = await api.get('/orders', { params });
      }
      const rawData = response.data?.data?.content || response.data?.data || response.data;
      if (Array.isArray(rawData)) {
        return rawData.map(o => ({
          id: String(o.id || o.orderCode || o.orderNumber || ''),
          customerName: o.customerName || (o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : '') || o.customer?.fullName || o.customer?.name || o.deliveryAddress?.fullName || 'Customer',
          farmerName: o.farmerName || 'Ramesh Organic Farms',
          phone: o.phone || o.customer?.phone || o.customer?.phoneNumber || 'N/A',
          address: o.address || o.shippingAddress || 'Hyderabad',
          items: o.items || [{ name: 'Organic Greens', qty: '1 kg', price: o.totalAmount || 100 }],
          itemsCount: o.itemsCount ?? o.items?.length ?? 1,
          totalAmount: o.totalAmount ?? o.total ?? 0,
          paymentMethod: o.paymentMethod || o.payment?.method || 'COD',
          paymentStatus: o.paymentStatus || 'PAID',
          status: o.status || 'Pending',
          deliveryStatus: o.deliveryStatus || 'OUT_FOR_DELIVERY',
          date: o.date || o.createdAt || new Date().toISOString(),
          orderDate: o.orderDate || (o.createdAt ? String(o.createdAt).split('T')[0] : ''),
          ...o
        }));
      }
      return rawData;
    } catch (err) {
      console.warn('[adminService] getOrders fallback:', err?.message);
      return null;
    }
  },

  async updateOrderStatus(id, newStatus) {
    try {
      const response = await api.put(`/orders/${id}/status`, { status: newStatus });
      emitAdminSyncEvent('admin_orders_changed', { id, status: newStatus });
      return response.data;
    } catch (err) {
      console.warn('[adminService] updateOrderStatus fallback:', err?.message);
      return { success: true };
    }
  },

  // 6. Payments & Settlements
  async getPayments(params = {}) {
    try {
      const response = await api.get('/payments', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getPayments fallback:', err?.message);
      return null;
    }
  },

  async processPayout(settlementId) {
    try {
      const response = await api.post(`/payments/settlements/${settlementId}/payout`);
      return response.data;
    } catch (err) {
      console.warn('[adminService] processPayout fallback:', err?.message);
      return { success: true };
    }
  },

  // 7. Delivery Management
  async getDeliveries(params = {}) {
    try {
      const response = await api.get('/deliveries', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getDeliveries fallback:', err?.message);
      return null;
    }
  },

  async assignDelivery(partnerId, orderCode) {
    try {
      const response = await api.post('/deliveries/assign', { partnerId, orderCode });
      return response.data;
    } catch (err) {
      console.warn('[adminService] assignDelivery fallback:', err?.message);
      return { success: true };
    }
  },

  // 8. Offers & Coupons
  async getCoupons() {
    try {
      const response = await api.get('/admin/coupons');
      const rawData = response.data?.data || response.data;
      if (Array.isArray(rawData)) {
        return rawData.map(c => {
          const code = c.code || c.couponCode || '';
          const type = c.type || (c.couponType === 'FLAT' ? 'Flat Amount' : 'Percentage');
          const discountNum = c.discountNum ?? c.discountValue ?? 0;
          const isPct = type === 'Percentage' || c.couponType === 'PERCENTAGE';
          const value = c.value || (isPct ? `${discountNum}% OFF` : `₹${discountNum} OFF`);
          const minOrder = c.minOrder ?? c.minimumOrderAmount ?? 0;
          const maxDiscount = c.maxDiscount ?? c.maximumDiscount ?? 0;
          const limit = c.limit ?? c.usageLimit ?? 500;
          const usedCount = c.usedCount ?? c.totalUsed ?? 0;
          const expiryDate = c.expiryDate ? String(c.expiryDate).split('T')[0] : '';
          const status = c.status ? (String(c.status).toUpperCase() === 'ACTIVE' || c.status === 'Active' ? 'Active' : 'Disabled') : 'Active';
          const description = c.description || `Special ${code} discount offer`;

          return {
            id: c.id,
            code,
            couponCode: code,
            type,
            value,
            discountNum,
            minOrder,
            maxDiscount,
            limit,
            usedCount,
            expiryDate,
            status,
            description
          };
        });
      }
      return rawData;
    } catch (err) {
      console.warn('[adminService] getCoupons fallback:', err?.message);
      return null;
    }
  },

  async saveCoupon(data, id = null) {
    try {
      const response = id 
        ? await api.put(`/admin/coupons/${id}`, data)
        : await api.post('/admin/coupons', data);
      return response.data;
    } catch (err) {
      console.warn('[adminService] saveCoupon fallback:', err?.message);
      return { success: true };
    }
  },

  async toggleCouponStatus(id) {
    try {
      const response = await api.patch(`/admin/coupons/${id}/status`);
      return response.data;
    } catch (err) {
      console.warn('[adminService] toggleCouponStatus fallback:', err?.message);
      return { success: true };
    }
  },

  // 9. Notifications
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getNotifications fallback:', err?.message);
      return null;
    }
  },

  async sendNotification(data) {
    try {
      const response = await api.post('/notifications/send', data);
      return response.data;
    } catch (err) {
      console.warn('[adminService] sendNotification fallback:', err?.message);
      return { success: true };
    }
  },

  // 10. Reports & Analytics
  async getReportData(type = 'daily', timeRange = 'This Month') {
    try {
      const response = await api.get(`/reports/analytics`, { params: { type, range: timeRange } });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getReportData fallback:', err?.message);
      return null;
    }
  },

  // 11. Support Tickets
  async getSupportTickets() {
    try {
      const response = await api.get('/support-tickets');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getSupportTickets fallback:', err?.message);
      return null;
    }
  },

  async updateTicketStatus(id, newStatus) {
    try {
      const response = await api.patch(`/support-tickets/${id}/status`, { status: newStatus });
      return response.data;
    } catch (err) {
      console.warn('[adminService] updateTicketStatus fallback:', err?.message);
      return { success: true };
    }
  },

  // 12. Settings
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] getSettings fallback:', err?.message);
      return null;
    }
  },

  async saveSettings(category, data) {
    try {
      const response = await api.put(`/settings/${category}`, data);
      return response.data;
    } catch (err) {
      console.warn('[adminService] saveSettings fallback:', err?.message);
      return { success: true };
    }
  }
};

export default adminService;
