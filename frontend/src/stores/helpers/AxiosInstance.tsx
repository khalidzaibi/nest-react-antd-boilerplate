import axios, { AxiosResponse } from 'axios';
import { getAuth, removeAuth } from '../../lib/authHelpers';
import { feedback } from '@/lib/feedback';

function getAuthToken(): string | null {
  const auth = getAuth();
  return auth?.access_token || null;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (res: AxiosResponse<any>) => {
    // Check if response has a success message
    const successMsg = res.data?.message;
    if (successMsg) {
      feedback.success(successMsg);
    }
    return res;
  },
  err => {
    console.error(err);
    const status = err.response?.status || err.response?.statusCode || 500;
    const msg = err.response?.data?.message || err.message || 'Something went wrong, please try again.';
    feedback.error(msg);
    if (status === 401) {
      // notification.error({ message: 'Session expired, please log in again' });
      removeAuth();
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    if (status === 403) {
      setTimeout(() => {
        // window.location.href = '/403';
      }, 1000);
    }

    return Promise.reject(err);
  },
);

export default axiosInstance;
