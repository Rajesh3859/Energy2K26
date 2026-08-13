import { apiRequest } from '../lib/api';
import { Match } from '../types/match';

export const matchService = {
  async getAllMatches(): Promise<Match[]> {
    return apiRequest('/api/matches');
  },

  async getMatchById(id: string): Promise<Match> {
    return apiRequest(`/api/matches/${id}`);
  },

  async createMatch(data: Partial<Match>): Promise<Match> {
    return apiRequest('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMatch(id: string, data: Partial<Match>): Promise<Match> {
    return apiRequest(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
