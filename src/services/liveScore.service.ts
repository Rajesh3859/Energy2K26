import { apiRequest } from "@/lib/api";

export interface FootballEventPayload {
  type: "goal" | "yellow_card" | "red_card" | "substitution" | string;
  teamId: string;
  teamName?: string;
  minute: number;
  playerName?: string;
  assistPlayerName?: string;
  description?: string;
  note?: string;
  timestamp?: number | string;
  createdAt?: number | string;
}

export interface FootballEvent {
  id: string;
  type: string;
  teamId: string;
  teamName?: string;
  minute: number;
  playerName?: string;
  assistPlayerName?: string;
  description?: string;
  note?: string;
  timestamp?: number | string;
  createdAt?: number | string;
}

export interface LiveMatchData {
  matchId: string;
  status: "not_started" | "live" | "paused" | "half_time" | "full_time" | "completed" | "cancelled" | "postponed";
  half?: number;
  halfDurationMinutes?: number;
  halfDuration?: number;
  firstHalfStartedAt?: number;
  secondHalfStartedAt?: number;
  pausedAt?: number;
  totalPausedSeconds?: number;
  endedAt?: number;
  completedAt?: number;
  teamA?: {
    teamId: string;
    teamName: string;
    score: number;
  };
  teamB?: {
    teamId: string;
    teamName: string;
    score: number;
  };
  scoreTeamA?: number;
  scoreTeamB?: number;
  events?: Record<string, FootballEvent> | Array<FootballEvent>;
  updatedAt?: string | number;
}

export async function getLiveScore(
  matchId: string
): Promise<{ success?: boolean; data: LiveMatchData | null }> {
  try {
    return await apiRequest(`/live-matches/${matchId}`);
  } catch (err: any) {
    if (err?.message?.includes("Live match not found") || err?.message?.includes("404")) {
      return { success: false, data: null };
    }
    throw err;
  }
}

export async function initializeLiveMatch(matchId: string, matchData?: any): Promise<{ success?: boolean; data: LiveMatchData }> {
  return apiRequest(`/live-matches/${matchId}/initialize`, {
    method: "POST",
    body: JSON.stringify(matchData || {}),
  });
}

export async function startLiveMatch(matchId: string): Promise<{ success?: boolean; data: LiveMatchData }> {
  return apiRequest(`/live-matches/${matchId}/start`, {
    method: "POST",
  });
}

export async function createFootballEvent(
  matchId: string,
  eventData: FootballEventPayload
): Promise<{ success?: boolean; data: any }> {
  return apiRequest(`/live-matches/${matchId}/events`, {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export async function updateLiveMatchStatus(
  matchId: string,
  status: LiveMatchData["status"]
): Promise<{ success?: boolean; data: LiveMatchData }> {
  return apiRequest(`/live-matches/${matchId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteFootballEvent(
  matchId: string,
  eventId: string
): Promise<{ success?: boolean; message?: string }> {
  return apiRequest(`/live-matches/${matchId}/events/${eventId}`, {
    method: "DELETE",
  });
}

export async function completeMatch(matchId: string): Promise<{ success?: boolean; data: LiveMatchData }> {
  return apiRequest(`/live-matches/${matchId}/complete`, {
    method: "POST",
  });
}

export async function finalizeMatch(matchId: string): Promise<{ success?: boolean; data: LiveMatchData }> {
  return completeMatch(matchId);
}

export async function updateSportState(
  matchId: string,
  action: Record<string, any>
): Promise<{ success?: boolean; data: any }> {
  return apiRequest(`/live-matches/${matchId}/state`, {
    method: "POST",
    body: JSON.stringify(action),
  });
}
