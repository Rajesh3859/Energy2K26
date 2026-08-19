export interface CricketState {
  innings: number;
  runs: number;
  wickets: number;
  legalBalls: number;
  balls?: number;
  overs: string;
  striker?: string | null;
  nonStriker?: string | null;
  bowler?: string | null;
  battingTeamId?: string;
  bowlingTeamId?: string;
}

export type CricketActionType =
  | "RUN"
  | "WICKET"
  | "WIDE"
  | "NO_BALL"
  | "BYE"
  | "LEG_BYE"
  | "CHANGE_INNINGS"
  | "SET_PLAYERS";

export interface CricketActionPayload {
  type: CricketActionType | string;
  runs?: number;
  deliveryType?: string;
  wicketType?: string;
  dismissedPlayer?: string;
  striker?: string;
  nonStriker?: string;
  bowler?: string;
  battingTeamId?: string;
  bowlerName?: string;
  strikerName?: string;
  nonStrikerName?: string;
  outBatsmanName?: string;
}
