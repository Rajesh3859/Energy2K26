export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  sport: string;
  teamA: {
    id: string;
    name: string;
    score?: number | string;
  };
  teamB: {
    id: string;
    name: string;
    score?: number | string;
  };
  status: MatchStatus;
  startTime: string;
  venue?: string;
  winnerId?: string;
  scorerId?: string;
  createdAt?: string;
  updatedAt?: string;
}
