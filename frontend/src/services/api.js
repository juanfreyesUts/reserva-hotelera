import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token from localStorage on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stayhub_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Helpers
export const hotelsApi = {
  search: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`)
};

export const roomsApi = {
  getByHotel: (hotelId, params) => api.get(`/rooms/hotel/${hotelId}`, { params }),
  getById: (id) => api.get(`/rooms/${id}`)
};

export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

export const adminApi = {
  // Hotels
  getHotels: () => api.get('/admin/hotels'),
  createHotel: (data) => api.post('/admin/hotels', data),
  updateHotel: (id, data) => api.put(`/admin/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/admin/hotels/${id}`),
  // Rooms
  getRooms: () => api.get('/admin/rooms'),
  createRoom: (data) => api.post('/admin/rooms', data),
  updateRoom: (id, data) => api.put(`/admin/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/admin/rooms/${id}`),
  // Bookings
  getBookings: () => api.get('/admin/bookings'),
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status })
};

export default api;
