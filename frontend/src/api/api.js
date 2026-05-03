import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your computer's WiFi IP address + backend port
export const BASE_URL = 'https://hostel-management-mobile.onrender.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Automatically attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('hms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
