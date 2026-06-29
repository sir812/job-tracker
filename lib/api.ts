import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000';

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('job-tracker-token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
