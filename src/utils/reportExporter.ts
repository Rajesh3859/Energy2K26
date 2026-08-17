import { getPublicLiveMatch } from "@/services/publicScore.service";
import { getLiveScore } from "@/services/liveScore.service";
import { getMatch } from "@/services/match.service";

export async function exportMatchReportCSV(match: any, initialLiveData?: any) {
  let liveData = initialLiveData;

  const matchId = match.id || match.matchId;

  // Try fetching live score data if events are missing
  if (matchId && (!liveData || !liveData.events || (typeof liveData.events === "object" && Object.keys(liveData.events).length === 0))) {
    try {
      const res = await getLiveScore(matchId);
      if (res && res.data) {
        liveData = res.data;
      }
    } catch (err) {
      console.warn("Could not fetch live match score for report", err);
    }
  }

  // Fallback to public live match endpoint if still missing
  if (matchId && (!liveData || !liveData.events || (typeof liveData.events === "object" && Object.keys(liveData.events).length === 0))) {
    try {
      const res = await getPublicLiveMatch(matchId);
      if (res && res.data) {
        liveData = res.data;
      }
    } catch (err) {
      console.warn("Could not fetch public live match history for report", err);
    }
  }

  // Fallback to match details endpoint if still missing
  if (matchId && (!match.events && !match.result?.events && !liveData?.events)) {
    try {
      const res = await getMatch(matchId);
      if (res && res.data) {
        match = { ...match, ...res.data };
      }
    } catch (err) {
      console.warn("Could not fetch full match details for report", err);
    }
  }

  const teamAName = liveData?.teamA?.teamName || match.teamA?.name || match.teamAName || "Team A";
  const teamBName = liveData?.teamB?.teamName || match.teamB?.name || match.teamBName || "Team B";
  const teamAId = liveData?.teamA?.teamId || match.teamA?.id || match.teamAId || "";
  const teamBId = liveData?.teamB?.teamId || match.teamB?.id || match.teamBId || "";

  const scoreA = liveData?.teamA?.score ?? match.result?.teamA?.score ?? match.teamA?.score ?? 0;
  const scoreB = liveData?.teamB?.score ?? match.result?.teamB?.score ?? match.teamB?.score ?? 0;

  // Extract events from liveData, match.events, or match.result.events
  const rawEventsSource =
    liveData?.events ||
    liveData?.timeline ||
    match?.events ||
    match?.timeline ||
    match?.result?.events ||
    match?.result?.timeline ||
    match?.liveData?.events ||
    [];

  const rawEvents = Array.isArray(rawEventsSource)
    ? rawEventsSource
    : Object.values(rawEventsSource);

  rawEvents.sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0));

  let winner = "Draw";
  if (Number(scoreA) > Number(scoreB)) winner = teamAName;
  if (Number(scoreB) > Number(scoreA)) winner = teamBName;

  const reportGeneratedAt = new Date().toLocaleString();

  const rows: string[][] = [
    ["ENERGY 2026 SPORTS TOURNAMENT — OFFICIAL MATCH REPORT"],
    ["Report Generated At", reportGeneratedAt],
    [],
    ["=== MATCH INFORMATION ==="],
    ["Match Code / ID", match.matchCode || match.id || "N/A"],
    ["Sport Category", match.sportName || match.sport || "Football"],
    ["Venue", match.venue || "Main Stadium"],
    ["Match Date", match.matchDate || "N/A"],
    ["Scheduled Start Time", match.startTime || "N/A"],
    ["Match Status", (match.status || liveData?.status || "COMPLETED").toUpperCase()],
    [],
    ["=== TEAM & FINAL SCORE SUMMARY ==="],
    ["Team A Name", teamAName],
    ["Team A Final Score", String(scoreA)],
    ["Team B Name", teamBName],
    ["Team B Final Score", String(scoreB)],
    ["Match Winner", winner],
    [],
    ["=== DETAILED EVENT HISTORY & TIMELINE ==="],
    ["Event No.", "Match Minute", "Timestamp", "Event Type", "Team Name", "Player Name", "Assist By", "Description / Note", "Detailed Summary"],
  ];

  if (rawEvents.length === 0) {
    rows.push(["1", "N/A", "N/A", "NO EVENTS RECORDED", "N/A", "N/A", "N/A", "No events logged", "No live events logged for this match."]);
  } else {
    rawEvents.forEach((ev: any, index: number) => {
      const isTeamA = ev.teamId === teamAId || ev.teamName === teamAName;
      const teamName = ev.teamName || (isTeamA ? teamAName : (ev.teamId === teamBId ? teamBName : teamAName));
      const formattedTimestamp = ev.createdAt
        ? new Date(ev.createdAt).toLocaleTimeString()
        : ev.timestamp
        ? new Date(ev.timestamp).toLocaleTimeString()
        : "N/A";

      const minuteStr = ev.minute !== undefined && ev.minute !== null ? `${ev.minute}'` : "N/A";
      const eventTypeUpper = (ev.type || "EVENT").toUpperCase();
      const playerStr = ev.playerName || "N/A";
      const assistStr = ev.assistPlayerName || "N/A";
      const descStr = ev.description || ev.note || ev.details || "No description provided";

      let summaryText = "";
      if (ev.type === "goal") {
        summaryText = `GOAL scored by ${playerStr !== "N/A" ? playerStr : "Player"} for ${teamName} at ${minuteStr}`;
        if (assistStr !== "N/A") {
          summaryText += ` (Assist: ${assistStr})`;
        }
      } else if (ev.type === "yellow_card") {
        summaryText = `Yellow Card issued to ${playerStr !== "N/A" ? playerStr : "Player"} (${teamName}) at ${minuteStr}`;
      } else if (ev.type === "red_card") {
        summaryText = `Red Card issued to ${playerStr !== "N/A" ? playerStr : "Player"} (${teamName}) at ${minuteStr}`;
      } else if (ev.type === "substitution") {
        summaryText = `Substitution for ${teamName} at ${minuteStr}`;
      } else {
        summaryText = `${eventTypeUpper} for ${teamName} at ${minuteStr}`;
      }

      if (ev.description || ev.note) {
        summaryText += ` — Note: ${ev.description || ev.note}`;
      }

      rows.push([
        String(index + 1),
        minuteStr,
        formattedTimestamp,
        eventTypeUpper,
        teamName,
        playerStr,
        assistStr,
        descStr,
        summaryText,
      ]);
    });
  }

  rows.push([]);
  rows.push(["=== END OF OFFICIAL REPORT ==="]);

  const csvString = rows
    .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", blobUrl);
  link.setAttribute("download", `Match_Report_${match.matchCode || match.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

