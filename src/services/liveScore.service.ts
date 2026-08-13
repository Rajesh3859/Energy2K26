import { apiRequest } from '../lib/api';
import { LiveScoreUpdate } from '../types/liveScore';

export const liveScoreService = {
  async getLiveScores(): Promise<LiveScoreUpdate[]> {
    return apiRequest('/api/live-score');
  },

  async updateLiveScore(matchId: string, data: Partial<LiveScoreUpdate>): Promise<LiveScoreUpdate> {
    return apiRequest(`/api/live-score/${matchId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
