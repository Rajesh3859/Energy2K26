import { apiRequest } from "@/lib/api";

export async function cricketAction(
  matchId: string,
  action: {
    type: string;
    runs?: number;
    deliveryType?: string;
  }
) {
  return apiRequest(
    `/live-matches/${matchId}/cricket/action`,
    {
      method: "POST",
      body: JSON.stringify(action),
    }
  );
}
