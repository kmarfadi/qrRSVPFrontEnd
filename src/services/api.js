import axios from 'axios';


// Use environment variable for API URL with fallback
const API_URL = 'https://qrverificationsystemv1-2.onrender.com';

const api = {
  generateQRCodes: async (guestCount) => {
    try {
      const response = await axios.post(`${API_URL}/generate`, {
        guestCount,
      });
      return response.data.qrCodes;
    } catch (error) {
      console.error('Error generating QR codes:', error);
      throw error;
    }
  },

  verifyQRCode: async (qrCode) => {
    try {
      const response = await axios.post(`${API_URL}/verify`, {
        qrCode
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying QR code:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },
};

export default api; 