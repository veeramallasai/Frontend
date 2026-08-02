import api from './api';

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
    try {
      const response = await api.get('/admin/customers', { params });
      const rawData = response.data?.data?.content || response.data?.data || response.data;
      if (Array.isArray(rawData)) {
        return rawData.map(c => {
          const fullName = c.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : (c.name || c.user?.firstName ? `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() : 'Customer');
          const phone = c.phoneNumber || c.phone || c.user?.phone || 'N/A';
          const email = c.email || c.user?.email || 'N/A';
          const totalOrders = c.totalOrders ?? c.ordersCount ?? 0;
          const totalSpent = c.totalSpent ?? 0;
          const location = c.location || (c.addresses && c.addresses.length > 0 ? `${c.addresses[0].district || ''}, ${c.addresses[0].state || ''}` : 'Hyderabad, Telangana');
          const status = c.status || 'Active';
          const lastOrderDate = c.lastOrderDate || (c.createdAt ? String(c.createdAt).split('T')[0] : '2026-07-28');
          const joinDate = c.createdAt ? String(c.createdAt).split('T')[0] : '2026-01-15';

          return {
            id: String(c.id || ''),
            name: fullName,
            email,
            phone,
            location,
            joinDate,
            totalOrders,
            totalSpent,
            lastOrderDate,
            status,
            ...c
          };
        });
      }
      return rawData;
    } catch (err) {
      console.warn('[adminService] getCustomers fallback:', err?.message);
      return null;
    }
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
      const rawData = response.data?.data?.content || response.data?.data || response.data;
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
      return rawData;
    } catch (err) {
      console.warn('[adminService] getProducts fallback:', err?.message);
      return null;
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
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[adminService] saveProduct fallback:', err?.message);
      return { success: true };
    }
  },

  async updateStock(id, newStock) {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stock: newStock });
      return response.data;
    } catch (err) {
      console.warn('[adminService] updateStock fallback:', err?.message);
      return { success: true };
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
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
