import { apiRequest } from "@/lib/api";

export async function getPublicLiveMatches() {
  try {
    return await apiRequest("/public/live-matches");
  } catch (err) {
    console.warn("Public live matches fetch fallback warning:", err);
    return { success: false, data: [] };
  }
}

export async function getPublicLiveMatch(matchId: string) {
  try {
    return await apiRequest(`/public/live-matches/${matchId}`);
  } catch (err: any) {
    if (err?.message?.includes("not found") || err?.message?.includes("404")) {
      return { success: false, data: null };
    }
    console.warn(`Public live match ${matchId} fetch fallback warning:`, err);
    return { success: false, data: null };
  }
}
