import { getPublicLiveMatch } from "@/services/publicScore.service";

export async function exportMatchReportCSV(match: any, initialLiveData?: any) {
  let liveData = initialLiveData;

  // Fetch full live match data if not provided or incomplete
  if (!liveData || !liveData.events) {
    try {
      const res = await getPublicLiveMatch(match.id || match.matchId);
      if (res && res.data) {
        liveData = res.data;
      }
    } catch (err) {
      console.error("Could not fetch detailed live match history for report", err);
    }
  }

  const teamAName = liveData?.teamA?.teamName || match.teamA?.name || match.teamAName || "Team A";
  const teamBName = liveData?.teamB?.teamName || match.teamB?.name || match.teamBName || "Team B";
  const scoreA = liveData?.teamA?.score ?? match.result?.teamA?.score ?? 0;
  const scoreB = liveData?.teamB?.score ?? match.result?.teamB?.score ?? 0;

  const rawEvents = liveData?.events ? Object.values(liveData.events) : [];

  let winner = "Draw";
  if (scoreA > scoreB) winner = teamAName;
  if (scoreB > scoreA) winner = teamBName;

  const reportGeneratedAt = new Date().toLocaleString();

  const rows: string[][] = [
    ["ENERGY 2026 SPORTS TOURNAMENT — OFFICIAL MATCH REPORT"],
    ["Report Generated At", reportGeneratedAt],
    [],
    ["=== MATCH INFORMATION ==="],
    ["Match Code", match.matchCode || match.id],
    ["Sport", match.sport || match.sportName || "Football"],
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
    ["Event #", "Match Minute", "Timestamp", "Event Type", "Team", "Player Name", "Notes/Description"],
  ];

  if (rawEvents.length === 0) {
    rows.push(["1", "N/A", "N/A", "NO EVENTS RECORDED", "N/A", "N/A", "No live events logged for this match."]);
  } else {
    rawEvents.forEach((ev: any, index: number) => {
      const isTeamA = ev.teamId === (liveData?.teamA?.teamId || match.teamA?.id || match.teamAId);
      const teamName = isTeamA ? teamAName : teamBName;
      const formattedTimestamp = ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString() : "N/A";

      rows.push([
        String(index + 1),
        `${ev.minute}'`,
        formattedTimestamp,
        (ev.type || "EVENT").toUpperCase(),
        teamName,
        ev.playerName || "N/A",
        ev.description || "",
      ]);
    });
  }

  rows.push([]);
  rows.push(["=== END OF OFFICIAL REPORT ==="]);

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Match_Report_${match.matchCode || match.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
