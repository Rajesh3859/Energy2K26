import { apiRequest } from '../lib/api';
import { User } from '../types/auth';

export const authService = {
  async getProfile(): Promise<User> {
    return apiRequest('/api/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiRequest('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export async function getCurrentUserProfile() {
  return apiRequest('/api/auth/me');
}

