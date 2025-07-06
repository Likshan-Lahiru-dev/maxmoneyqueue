import axios from 'axios';
//const BASE_URL = 'http://localhost:8080/MaxMoneyQueue/';
const BASE_URL = 'http://103.125.216.56:8101/MaxMoneyQueue/';
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
// Add response interceptor to handle common error cases
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    // Clear local storage and redirect to login if unauthorized
    localStorage.removeItem('staff');
    window.location.href = '/signin';
  }
  return Promise.reject(error);
});