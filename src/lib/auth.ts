import { apiClient } from './api';

export async function login(username: string, password: string): Promise<boolean> {
  try {
    // Set credentials
    apiClient.setCredentials(username, password);
    
    // Test credentials by fetching stats
    await apiClient.get('/admin/requests/stats');
    
    return true;
  } catch (error) {
    apiClient.clearCredentials();
    throw error;
  }
}

export function logout() {
  apiClient.clearCredentials();
}

export function isAuthenticated(): boolean {
  return apiClient.isAuthenticated();
}

export function initializeAuth() {
  apiClient.loadCredentials();
}