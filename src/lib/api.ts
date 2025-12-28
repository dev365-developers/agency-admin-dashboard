import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;
  private credentials: { username: string; password: string } | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach auth
    this.client.interceptors.request.use(
      (config) => {
        if (this.credentials) {
          const auth = btoa(`${this.credentials.username}:${this.credentials.password}`);
          config.headers.Authorization = `Basic ${auth}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear credentials and redirect to login
          this.clearCredentials();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setCredentials(username: string, password: string) {
    this.credentials = { username, password };
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_credentials', JSON.stringify({ username, password }));
    }
  }

  clearCredentials() {
    this.credentials = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_credentials');
    }
  }

  loadCredentials() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_credentials');
      if (stored) {
        this.credentials = JSON.parse(stored);
      }
    }
  }

  isAuthenticated(): boolean {
    return this.credentials !== null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();