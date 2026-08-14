import { apiRequest } from "@/lib/api";
import { Team } from "@/types/team";

export interface CreateTeamData {
  teamName: string;
  teamCode?: string;
  sportId: string;
  sportName: string;
  schoolName: string;
  location: string;
  status: string;
}

export async function getTeams(sportId?: string): Promise<{ success?: boolean; data: Team[] }> {
  const query = sportId ? `?sportId=${encodeURIComponent(sportId)}` : "";
  return apiRequest(`/teams${query}`);
}

export async function createTeam(
  teamData: CreateTeamData
): Promise<{ success?: boolean; data: Team }> {
  return apiRequest("/teams", {
    method: "POST",
    body: JSON.stringify(teamData),
  });
}

export async function updateTeam(
  id: string,
  teamData: Partial<CreateTeamData>
): Promise<{ success?: boolean; data: Team }> {
  return apiRequest(`/teams/${id}`, {
    method: "PATCH",
    body: JSON.stringify(teamData),
  });
}

export async function deleteTeam(id: string) {
  return apiRequest(`/teams/${id}`, {
    method: "DELETE",
  });
}