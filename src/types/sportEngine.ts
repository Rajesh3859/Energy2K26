export interface CricketInningsScore {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
}

export interface CricketMatchScore {
  teamA: CricketInningsScore;
  teamB: CricketInningsScore;
  currentInnings: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  currentOverBalls?: number;
  strikerName?: string;
  nonStrikerName?: string;
  bowlerName?: string;
}

export interface KabaddiMatchScore {
  teamA: number;
  teamB: number;
  raidsTeamA?: number;
  raidsTeamB?: number;
  tacklesTeamA?: number;
  tacklesTeamB?: number;
  allOutsTeamA?: number;
  allOutsTeamB?: number;
}

export interface BasketballMatchScore {
  teamA: number;
  teamB: number;
  quarter: 1 | 2 | 3 | 4 | 5;
  q1TeamA?: number;
  q1TeamB?: number;
  q2TeamA?: number;
  q2TeamB?: number;
  q3TeamA?: number;
  q3TeamB?: number;
  q4TeamA?: number;
  q4TeamB?: number;
  foulsTeamA?: number;
  foulsTeamB?: number;
  timeoutsTeamA?: number;
  timeoutsTeamB?: number;
}

export interface SetScores {
  setNumber: number;
  teamA: number;
  teamB: number;
}

export interface VolleyballMatchScore {
  setsWonTeamA: number;
  setsWonTeamB: number;
  currentSet: number;
  currentSetTeamA: number;
  currentSetTeamB: number;
  setsHistory?: SetScores[];
}

export interface TableTennisMatchScore {
  gamesWonTeamA: number;
  gamesWonTeamB: number;
  currentGame: number;
  currentGameTeamA: number;
  currentGameTeamB: number;
  gamesHistory?: SetScores[];
}

export interface BadmintonMatchScore {
  gamesWonTeamA: number;
  gamesWonTeamB: number;
  currentGame: number;
  currentGameTeamA: number;
  currentGameTeamB: number;
  gamesHistory?: SetScores[];
}

export type MultiSportScorePayload =
  | { sportCode: "football"; scoreA: number; scoreB: number }
  | { sportCode: "cricket"; score: CricketMatchScore }
  | { sportCode: "kabaddi"; score: KabaddiMatchScore }
  | { sportCode: "basketball"; score: BasketballMatchScore }
  | { sportCode: "volleyball"; score: VolleyballMatchScore }
  | { sportCode: "table_tennis"; score: TableTennisMatchScore }
  | { sportCode: "badminton"; score: BadmintonMatchScore };
