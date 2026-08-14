import { apiRequest } from "@/lib/api";

export async function getPublicLiveMatches() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  try {
    const res = await fetch(`${baseUrl}/public/live-matches`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { success: false, data: [] };
    }
    return await res.json();
  } catch (err) {
    console.error("Public live matches fetch error", err);
    return { success: false, data: [] };
  }
}

export async function getPublicLiveMatch(matchId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  try {
    const res = await fetch(`${baseUrl}/public/live-matches/${matchId}`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return { success: false, data: null };
    }
    if (!res.ok) {
      throw new Error("Failed to fetch live match details");
    }
    return await res.json();
  } catch (err: any) {
    if (err?.message?.includes("not found")) {
      return { success: false, data: null };
    }
    throw err;
  }
}
