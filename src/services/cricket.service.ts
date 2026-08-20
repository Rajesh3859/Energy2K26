import { apiRequest } from "@/lib/api";

export async function cricketAction(
  matchId: string,
  action: {
    type: string;
    runs?: number;
    deliveryType?: string;
    battingTeamId?: string;
    bowlerName?: string;
    strikerName?: string;
    nonStrikerName?: string;
    outBatsmanName?: string;
    wicketType?: string;
  }
) {
  console.log("🔥 CRICKET REQUEST");
  console.log("Match ID:", matchId);
  console.log("Action:", action);

  const response = await apiRequest(
    `/live-matches/${matchId}/cricket/action`,
    {
      method: "POST",
      body: JSON.stringify(action),
    }
  );

  console.log("🔥 CRICKET RESPONSE:", response);

  return response;
}
