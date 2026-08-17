import axios from 'axios';
 
const Api = axios.create({
  baseURL: 'http://127.0.0.1:8000/Api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
 
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user_name');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
 
export default Api;