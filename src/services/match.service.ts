import { apiRequest } from "@/lib/api";
import { Match } from "@/types/match";

export interface CreateMatchData {
  sportId: string;
  sportName?: string;
  teamAId: string;
  teamAName?: string;
  teamBId: string;
  teamBName?: string;
  matchDate: string;
  startTime: string;
  venue: string;
  halfDurationMinutes?: number;
  status?: string;
}

export async function getMatches(): Promise<{ success?: boolean; data: Match[] }> {
  return apiRequest("/matches");
}

export async function getMatch(id: string): Promise<{ success?: boolean; data: Match }> {
  return apiRequest(`/matches/${id}`);
}

export async function createMatch(data: CreateMatchData): Promise<{ success?: boolean; data: Match }> {
  return apiRequest("/matches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMatch(
  id: string,
  data: Partial<CreateMatchData>
): Promise<{ success?: boolean; data: Match }> {
  return apiRequest(`/matches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMatch(id: string): Promise<{ success?: boolean; message?: string }> {
  return apiRequest(`/matches/${id}`, {
    method: "DELETE",
  });
}
