import { apiRequest } from '../lib/api';
import { Team } from '../types/team';

export const teamService = {
  async getAllTeams(): Promise<Team[]> {
    return apiRequest('/api/teams');
  },

  async getTeamById(id: string): Promise<Team> {
    return apiRequest(`/api/teams/${id}`);
  },

  async createTeam(data: Partial<Team>): Promise<Team> {
    return apiRequest('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
