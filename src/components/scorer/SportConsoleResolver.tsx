"use client";

import { getSportDefinition } from "@/config/sports";
import CricketConsole from "./consoles/CricketConsole";
import KabaddiConsole from "./consoles/KabaddiConsole";
import BasketballConsole from "./consoles/BasketballConsole";
import VolleyballConsole from "./consoles/VolleyballConsole";
import TableTennisConsole from "./consoles/TableTennisConsole";
import BadmintonConsole from "./consoles/BadmintonConsole";

interface SportConsoleResolverProps {
  match: any;
  liveData: any;
  onEventAdded?: () => void;
  // Football Fallback Props
  eventType?: any;
  setEventType?: any;
  eventTeamId?: any;
  setEventTeamId?: any;
  eventMinute?: any;
  setEventMinute?: any;
  playerName?: any;
  setPlayerName?: any;
  assistPlayerName?: any;
  setAssistPlayerName?: any;
  description?: any;
  setDescription?: any;
  handleAddEvent?: any;
  actionLoading?: boolean;
}

export default function SportConsoleResolver({
  match,
  liveData,
  onEventAdded,
  eventType,
  setEventType,
  eventTeamId,
  setEventTeamId,
  eventMinute,
  setEventMinute,
  playerName,
  setPlayerName,
  assistPlayerName,
  setAssistPlayerName,
  description,
  setDescription,
  handleAddEvent,
  actionLoading,
}: SportConsoleResolverProps) {
  const targetSport =
    match?.sportName ||
    match?.sportCode ||
    match?.sport ||
    liveData?.sportName ||
    liveData?.sportCode ||
    liveData?.sport ||
    match;
  const sportDef = getSportDefinition(targetSport);
  const code = sportDef.code;

  if (code === "cricket") {
    return <CricketConsole match={match} liveData={liveData} onEventAdded={onEventAdded} />;
  }

  if (code === "kabaddi") {
    return <KabaddiConsole match={match} liveData={liveData} onEventAdded={onEventAdded} />;
  }

  if (code === "basketball") {
    return <BasketballConsole match={match} liveData={liveData} onEventAdded={onEventAdded} />;
  }

  if (code === "volleyball") {
    return <VolleyballConsole match={match} liveData={liveData} onEventAdded={onEventAdded} />;
  }

  if (code === "table_tennis") {
    return <TableTennisConsole match={match} liveData={liveData} onEventAdded={onEventAdded} />;
  }

  if (code === "badminton") {
    return <BadmintonConsole match={match} liveData={liveData} onEventAdded={onEventAdded} />;
  }

  // DEFAULT / FOOTBALL SCORER CONSOLE
  const teamAName = liveData?.teamA?.teamName || match?.teamA?.name || "Team A";
  const teamBName = liveData?.teamB?.teamName || match?.teamB?.name || "Team B";
  const teamAId = liveData?.teamA?.teamId || match?.teamA?.id || "teamA";
  const teamBId = liveData?.teamB?.teamId || match?.teamB?.id || "teamB";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-6 shadow-xl">
      <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-3">
        <span>⚽</span> Football Match Event Console
      </h3>

      <form onSubmit={handleAddEvent} className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e: any) => setEventType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="goal">⚽ Goal</option>
              <option value="yellow_card">🟨 Yellow Card</option>
              <option value="red_card">🟥 Red Card</option>
              <option value="substitution">🔄 Substitution</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Team</label>
            <select
              value={eventTeamId || teamAId}
              onChange={(e) => setEventTeamId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={teamAId}>{teamAName} (Home)</option>
              <option value={teamBId}>{teamBName} (Away)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Match Minute</label>
            <input
              type="number"
              min={1}
              max={120}
              value={eventMinute}
              onChange={(e) => setEventMinute(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Player Name</label>
            <input
              type="text"
              placeholder="Player Name (Optional)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Assist By (Optional)</label>
            <input
              type="text"
              placeholder="Assist Player Name"
              value={assistPlayerName}
              onChange={(e) => setAssistPlayerName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Description / Note</label>
            <input
              type="text"
              placeholder="e.g. Header from corner kick"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3 text-sm transition-all shadow-lg active:scale-98 disabled:opacity-50"
        >
          {actionLoading ? "Recording Event..." : "Record Live Football Event"}
        </button>
      </form>
    </div>
  );
}
