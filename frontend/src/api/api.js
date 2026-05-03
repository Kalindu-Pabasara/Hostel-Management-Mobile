import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your computer's WiFi IP address + backend port
// Change this to your Render URL after deployment
export const BASE_URL = 'http://192.168.8.166:5001';

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
