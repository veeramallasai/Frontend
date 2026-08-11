import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const faceVerificationService = {
  async getStatus() {
    try {
      const response = await api.get('/api/delivery-partners/me/face-status');
      return unwrap(response);
    } catch (err) {
      try {
        const fallback = await api.get('/api/v1/delivery-partner/face/status');
        return unwrap(fallback);
      } catch (fallbackErr) {
        throw err;
      }
    }
  },

  async registerFace(imageBlobOrBase64) {
    if (imageBlobOrBase64 instanceof Blob || imageBlobOrBase64 instanceof File) {
      const formData = new FormData();
      formData.append('faceImage', imageBlobOrBase64, 'face.jpg');

      const response = await api.post('/api/delivery-partners/me/face/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return unwrap(response);
    } else {
      // Fallback for base64 payload
      const response = await api.post('/api/v1/delivery-partner/face/enroll', { imageBase64: imageBlobOrBase64 });
      return unwrap(response);
    }
  },

  async verifyFace(imageBlobOrBase64, extra = {}) {
    if (imageBlobOrBase64 instanceof Blob || imageBlobOrBase64 instanceof File) {
      const formData = new FormData();
      formData.append('faceImage', imageBlobOrBase64, 'face.jpg');

      const response = await api.post('/api/delivery-partners/me/face/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return unwrap(response);
    } else {
      const response = await api.post('/api/v1/delivery-partner/face/verify', {
        imageBase64: imageBlobOrBase64,
        completedActions: extra.completedActions || [],
        livenessScore: extra.livenessScore || 0,
      });
      return unwrap(response);
    }
  },

  // Backwards compatibility aliases
  async getFaceStatus() {
    return this.getStatus();
  },

  async enroll(imageBase64) {
    return this.registerFace(imageBase64);
  },

  async verify({ imageBase64, completedActions = [], livenessScore = 0 }) {
    return this.verifyFace(imageBase64, { completedActions, livenessScore });
  },
};

export default faceVerificationService;
