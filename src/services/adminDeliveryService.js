import api from './api';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const adminDeliveryService = {
  async getAllDeliveryPartners() {
    const response = await api.get('/api/v1/admin/delivery-partners');
    return unwrap(response);
  },

  async getPendingDeliveryPartners() {
    const response = await api.get('/api/v1/admin/delivery-partners/pending');
    return unwrap(response);
  },

  async assignDeliveryRole(userId) {
    const response = await api.post(`/api/v1/admin/users/${userId}/assign-delivery-role`);
    return unwrap(response);
  },

  async approvePartner(id) {
    const response = await api.post(`/api/v1/admin/delivery-partners/${id}/approve`);
    return unwrap(response);
  },

  async rejectPartner(id) {
    const response = await api.post(`/api/v1/admin/delivery-partners/${id}/reject`);
    return unwrap(response);
  },

  async activatePartner(id) {
    const response = await api.post(`/api/v1/admin/delivery-partners/${id}/activate`);
    return unwrap(response);
  },

  async deactivatePartner(id) {
    const response = await api.post(`/api/v1/admin/delivery-partners/${id}/deactivate`);
    return unwrap(response);
  },

  async blockPartner(id) {
    const response = await api.post(`/api/v1/admin/delivery-partners/${id}/block`);
    return unwrap(response);
  },

  async unblockPartner(id) {
    const response = await api.post(`/api/v1/admin/delivery-partners/${id}/unblock`);
    return unwrap(response);
  },

  async assignOrder(orderCode, deliveryPartnerId, pickupLocation, deliveryLocation, orderAmount) {
    const response = await api.post('/api/v1/admin/orders/assign', {
      orderCode,
      deliveryPartnerId,
      pickupLocation,
      deliveryLocation,
      orderAmount: orderAmount ? parseFloat(orderAmount) : 450,
    });
    return unwrap(response);
  },
};

export default adminDeliveryService;
