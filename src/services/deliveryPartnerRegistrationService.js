import api from './api';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const deliveryPartnerRegistrationService = {
  sendOtp: async (email) => {
    const response = await api.post('/delivery-partner/auth/send-otp', {
      email: normalizeEmail(email),
    });
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await api.post('/delivery-partner/auth/resend-otp', {
      email: normalizeEmail(email),
    });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/delivery-partner/auth/verify-otp', {
      email: normalizeEmail(email),
      otp: String(otp || '').trim(),
    });
    return response.data;
  },

  register: async (payload, documentFiles) => {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('mobileNumber', payload.mobileNumber);
    formData.append('email', normalizeEmail(payload.email));
    formData.append('password', payload.password);
    formData.append('dateOfBirth', payload.dateOfBirth);
    formData.append('gender', payload.gender);
    formData.append('aadhaarNumber', payload.aadhaarNumber);
    formData.append('drivingLicenseNumber', payload.drivingLicenseNumber);
    formData.append('vehicleType', payload.vehicleType);
    formData.append('vehicleNumber', payload.vehicleNumber);
    formData.append('address', payload.address);
    formData.append('city', payload.city);
    formData.append('state', payload.state);
    formData.append('pincode', payload.pincode);
    formData.append('emergencyContactNumber', payload.emergencyContactNumber);

    Object.entries(documentFiles || {}).forEach(([key, documentInfo]) => {
      if (documentInfo?.file) {
        formData.append(key, documentInfo.file);
      }
    });

    const response = await api.post('/delivery-partner/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default deliveryPartnerRegistrationService;
