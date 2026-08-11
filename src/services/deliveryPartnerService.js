import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const getDashboardSummary = async () => {
  const response = await api.get('/delivery-partner/dashboard/summary');
  return unwrap(response);
};

export const getCurrentDelivery = async () => {
  const response = await api.get('/delivery-partner/dashboard/current-delivery');
  return unwrap(response);
};

export const getUpcomingDeliveries = async (limit = 5) => {
  const response = await api.get('/delivery-partner/dashboard/upcoming-deliveries', {
    params: { limit },
  });
  return unwrap(response) || [];
};

export const getRecentDeliveries = async (limit = 6) => {
  const response = await api.get('/delivery-partner/dashboard/recent-deliveries', {
    params: { limit },
  });
  return unwrap(response) || [];
};

export const getEarningsSummary = async () => {
  const response = await api.get('/delivery-partner/dashboard/earnings');
  return unwrap(response) || [];
};

export const getRatings = async () => {
  const response = await api.get('/delivery-partner/dashboard/ratings');
  return unwrap(response);
};

export const updateOnlineStatus = async (status) => {
  const response = await api.patch('/delivery-partner/dashboard/online-status', { status });
  return unwrap(response);
};

export const updateDeliveryStatus = async (orderId, status) => {
  const response = await api.patch(`/delivery-partner/dashboard/deliveries/${orderId}/status`, {
    status,
  });
  return unwrap(response);
};

const deliveryPartnerService = {
  getDashboardSummary,
  getCurrentDelivery,
  getUpcomingDeliveries,
  getRecentDeliveries,
  getEarningsSummary,
  getRatings,
  updateOnlineStatus,
  updateDeliveryStatus,
};

export default deliveryPartnerService;
