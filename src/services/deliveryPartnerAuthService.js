import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

export const deliveryPartnerAuthService = {
  async login({ identifier, emailOrMobile, email, password }) {
    const loginIdentifier = (identifier || emailOrMobile || email || '').trim();

    console.log("Delivery Partner API URL:", API_BASE_URL);
    console.log("Login endpoint:", `${API_BASE_URL}/api/delivery-partners/login`);

    const response = await api.post('/delivery-partners/login', {
      email: loginIdentifier,
      identifier: loginIdentifier,
      password,
    });

    return response?.data?.data || response?.data;
  },
};

export default deliveryPartnerAuthService;

