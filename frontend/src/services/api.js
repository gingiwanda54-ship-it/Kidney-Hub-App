import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (status === 422) {
        toast.error(data.message || 'Validation error');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: () => api.post('/auth/resend-otp'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

// Patient services
export const patientService = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  verifyID: (idNumber) => api.post('/patients/verify-id', { idNumber }),
  verifyMedicalAid: (data) => api.post('/patients/verify-medical-aid', data),
  lookupMedicalAid: (idNumber) => api.post('/patients/lookup-medical-aid', { idNumber }),
  uploadPhoto: (formData) => api.post('/patients/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDocuments: () => api.get('/patients/documents'),
  // Health Records
  getRecords: () => api.get('/patients/records'),
  getRecordById: (id) => api.get(`/patients/records/${id}`),
  uploadVitals: (data) => api.post('/patients/records/vitals', data),
  uploadRecord: (formData) => api.post('/patients/records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getVitalsHistory: (params) => api.get('/patients/records/vitals', { params }),
  // Meal Plans
  getMyMealPlan: () => api.get('/patients/meal-plan'),
  // AI
  getAIConversations: () => api.get('/patients/ai/conversations'),
};

// Nurse services
export const nurseService = {
  getAll: (params) => api.get('/nurses', { params }),
  getById: (id) => api.get(`/nurses/${id}`),
  updateProfile: (data) => api.put('/nurses/profile', data),
  verifySANC: (registrationNumber) => api.post('/nurses/verify-sanc', { registrationNumber }),
  verifyBHF: (providerNumber) => api.post('/nurses/verify-bhf', { providerNumber }),
  uploadPhoto: (formData) => api.post('/nurses/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAvailability: (nurseId) => api.get(`/nurses/${nurseId}/availability`),
  getReviews: (nurseId) => api.get(`/nurses/${nurseId}/reviews`),
  // Patient management
  getPatientById: (id) => api.get(`/nurses/patients/${id}`),
  getPatientRecords: (patientId) => api.get(`/nurses/patients/${patientId}/records`),
  addPatientVitals: (patientId, data) => api.post(`/nurses/patients/${patientId}/records/vitals`, data),
  addPatientRecord: (patientId, formData) => api.post(`/nurses/patients/${patientId}/records`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Availability services
export const availabilityService = {
  get: () => api.get('/availability'),
  create: (data) => api.post('/availability', data),
  update: (id, data) => api.put(`/availability/${id}`, data),
  delete: (id) => api.delete(`/availability/${id}`),
  getSlots: (params) => api.get('/availability/slots', { params }),
};

// Booking services
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  generateMeetingLink: (id) => api.post(`/bookings/${id}/meeting-link`),
};

// Payment services
export const paymentService = {
  initiate: (bookingId, data) => api.post('/payments/initiate', { bookingId, ...data }),
  getStatus: (bookingId) => api.get(`/payments/${bookingId}`),
  verifyMedicalAid: (data) => api.post('/payments/verify-medical-aid', data),
  webhook: (data) => api.post('/payments/webhook', data),
};

// Review services
export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getByNurse: (nurseId) => api.get(`/reviews/nurse/${nurseId}`),
};

// Indemnity services
export const indemnityService = {
  getForm: () => api.get('/indemnity/form'),
  sign: (data) => api.post('/indemnity/sign', data),
  getStatus: () => api.get('/indemnity/status'),
};

// Meal Plan services
export const mealPlanService = {
  getAll: (params) => api.get('/meal-plans', { params }),
  getAllAdmin: () => api.get('/meal-plans/admin'),
  getById: (id) => api.get(`/meal-plans/${id}`),
  create: (data) => api.post('/meal-plans', data),
  update: (id, data) => api.put(`/meal-plans/${id}`, data),
  delete: (id) => api.delete(`/meal-plans/${id}`),
  assignToPatient: (id) => api.post(`/meal-plans/${id}/assign`),
  assignToPatients: (id, data) => api.post(`/meal-plans/${id}/assign/bulk`, data),
  getGroceryList: (id) => api.get(`/meal-plans/${id}/grocery-list`),
};

// Education services
export const educationService = {
  getContent: (params) => api.get('/education', { params }),
  getContentById: (id) => api.get(`/education/${id}`),
  getFeatured: () => api.get('/education/featured'),
  getPersonalized: () => api.get('/education/personalized'),
  getRecentlyViewed: () => api.get('/education/recent'),
  getHistory: () => api.get('/education/history'),
  getProgress: () => api.get('/education/progress'),
  getBadges: () => api.get('/education/badges'),
  getQuiz: (contentId) => api.get(`/education/${contentId}/quiz`),
  saveQuizProgress: (contentId, data) => api.post(`/education/${contentId}/quiz/progress`, data),
  addBookmark: (contentId) => api.post(`/education/${contentId}/bookmark`),
  removeBookmark: (contentId) => api.delete(`/education/${contentId}/bookmark`),
  // Admin
  getAllAdmin: () => api.get('/education/admin'),
  create: (data) => api.post('/education', data),
  update: (id, data) => api.put(`/education/${id}`, data),
  delete: (id) => api.delete(`/education/${id}`),
};

// AI services
export const aiService = {
  sendMessage: (data) => api.post('/ai/chat', data),
  getConversations: () => api.get('/ai/conversations'),
  getConversationById: (id) => api.get(`/ai/conversations/${id}`),
  getFlaggedConversations: () => api.get('/ai/conversations/flagged'),
  flagConversation: (id) => api.post(`/ai/conversations/${id}/flag`),
  unflagConversation: (id) => api.delete(`/ai/conversations/${id}/flag`),
};

// Mock services
export const mockService = {
  validateSAID: (idNumber) => api.post('/mock/validate-sa-id', { idNumber }),
  lookupMedicalAid: (idNumber) => api.post('/mock/lookup-medical-aid', { idNumber }),
  verifySANC: (registrationNumber) => api.post('/mock/verify-sanc', { registrationNumber }),
  verifyBHF: (providerNumber) => api.post('/mock/verify-bhf', { providerNumber }),
};

export default api;
