import { MatchStatus } from './match';

export interface LiveScoreUpdate {
  matchId: string;
  sport: string;
  scoreTeamA: number | string;
  scoreTeamB: number | string;
  currentOverDetails?: string;
  status: MatchStatus;
  commentary?: string;
  updatedAt: string;
}

export interface LiveScoreState {
  matches: Record<string, LiveScoreUpdate>;
  isLoading: boolean;
  error: string | null;
}
