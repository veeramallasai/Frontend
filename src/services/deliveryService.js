import api from "./api";

export const getDeliveryEstimate = async (payload) => {
  try {
    const response = await api.post("/delivery/estimate", payload);
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getDeliveryEstimate fallback:', err?.message);
    return {
      distanceKm: 4.5,
      durationMinutes: 25,
      estimatedDeliveryTime: new Date(Date.now() + 35 * 60000).toISOString(),
      deliveryFee: 40
    };
  }
};

export const getDeliverySummary = async () => {
  try {
    const response = await api.get("/admin/deliveries/summary");
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getDeliverySummary fallback:', err?.message);
    return {
      activeDeliveries: 12,
      scheduledDeliveries: 18,
      deliveriesToday: 7,
      deliveriesThisWeek: 42,
      deliveriesThisMonth: 156
    };
  }
};

export const getActiveDeliveries = async () => {
  try {
    const response = await api.get("/admin/deliveries/active");
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getActiveDeliveries fallback:', err?.message);
    return [];
  }
};

export const getScheduledDeliveries = async () => {
  try {
    const response = await api.get("/admin/deliveries/scheduled");
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getScheduledDeliveries fallback:', err?.message);
    return [];
  }
};

export const getTodayDeliveries = async () => {
  try {
    const response = await api.get("/admin/deliveries/today");
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getTodayDeliveries fallback:', err?.message);
    return [];
  }
};

export const getWeekDeliveries = async () => {
  try {
    const response = await api.get("/admin/deliveries/week");
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getWeekDeliveries fallback:', err?.message);
    return [];
  }
};

export const getMonthDeliveries = async () => {
  try {
    const response = await api.get("/admin/deliveries/month");
    return response.data?.data || response.data;
  } catch (err) {
    console.warn('[deliveryService] getMonthDeliveries fallback:', err?.message);
    return [];
  }
};

const deliveryService = {
  getDeliveryEstimate,
  getDeliverySummary,
  getActiveDeliveries,
  getScheduledDeliveries,
  getTodayDeliveries,
  getWeekDeliveries,
  getMonthDeliveries
};

export default deliveryService;
