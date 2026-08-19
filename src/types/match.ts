export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  sport: string;
  sportId?: string;
  sportName?: string;
  matchCode?: string;
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
  halfDurationMinutes?: number;
  totalOvers?: number;
  winnerId?: string;
  scorerId?: string;
  scorerName?: string;
  scorerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}
