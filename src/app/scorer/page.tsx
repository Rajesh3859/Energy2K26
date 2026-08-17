"use client";

import { useEffect, useState } from "react";
import { getMatches } from "@/services/match.service";
import {
  getLiveScore,
  initializeLiveMatch,
  startLiveMatch,
  createFootballEvent,
  updateLiveMatchStatus,
  deleteFootballEvent,
  completeMatch,
} from "@/services/liveScore.service";
import { Match } from "@/types/match";
import DigitalClock from "@/components/sports/DigitalClock";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { exportMatchReportCSV } from "@/utils/reportExporter";
import { rtdb, auth } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

import { subscribeToAllLiveMatches, subscribeToLiveMatch } from "@/services/liveMatchRealtime";

export default function ScorerPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [liveData, setLiveData] = useState<any | null>(null);
  const [filterAssignedOnly, setFilterAssignedOnly] = useState<boolean>(true);

  const [loadingMatches, setLoadingMatches] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Live Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Event form
  const [eventType, setEventType] = useState<"goal" | "yellow_card" | "red_card" | "substitution">("goal");
  const [eventTeamId, setEventTeamId] = useState<string>("");
  const [eventMinute, setEventMinute] = useState<number>(1);
  const [playerName, setPlayerName] = useState<string>("");
  const [assistPlayerName, setAssistPlayerName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Derived Safe Team & Score Properties
  const teamAName = liveData?.teamA?.teamName || selectedMatch?.teamA?.name || (selectedMatch as any)?.teamAName || "Team A";
  const teamBName = liveData?.teamB?.teamName || selectedMatch?.teamB?.name || (selectedMatch as any)?.teamBName || "Team B";
  const teamAId = liveData?.teamA?.teamId || selectedMatch?.teamA?.id || (selectedMatch as any)?.teamAId || "";
  const teamBId = liveData?.teamB?.teamId || selectedMatch?.teamB?.id || (selectedMatch as any)?.teamBId || "";
  const scoreA = liveData?.teamA?.score ?? (selectedMatch as any)?.result?.teamA?.score ?? 0;
  const scoreB = liveData?.teamB?.score ?? (selectedMatch as any)?.result?.teamB?.score ?? 0;

  const currentUser = auth.currentUser;

  const matchesForScorer = matches.filter((m) => {
    if (!filterAssignedOnly) return true;
    if (!m.scorerId && !m.scorerEmail) return true;
    if (currentUser && (m.scorerId === currentUser.uid || m.scorerEmail?.toLowerCase() === currentUser.email?.toLowerCase())) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    loadMatchesList();
  }, []);

  // Firebase Realtime Database Listener for All Matches Status Sync (Zero Polling)
  useEffect(() => {
    const unsubscribe = subscribeToAllLiveMatches((liveDataObj) => {
      if (liveDataObj) {
        setMatches((prevMatches) =>
          prevMatches.map((m) => {
            const liveForMatch = liveDataObj[m.id];
            if (liveForMatch && liveForMatch.status) {
              return { ...m, status: liveForMatch.status as any };
            }
            return m;
          })
        );

        if (selectedMatch) {
          const currentLive = liveDataObj[selectedMatch.id];
          if (currentLive) {
            setLiveData(currentLive);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedMatch?.id]);

  // Firebase Realtime Database Listener for Active Match Scoreboard
  useEffect(() => {
    if (!selectedMatch) return;
    const matchId = selectedMatch.id;

    const unsubscribe = subscribeToLiveMatch(matchId, (data) => {
      setLiveData(data);
      if (data) {
        const tAId = data.teamA?.teamId || selectedMatch.teamA?.id || (selectedMatch as any)?.teamAId;
        if (tAId && !eventTeamId) {
          setEventTeamId(tAId);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedMatch?.id]);

  // Real-time Match Clock Ticker with Dynamic Admin-Configured Sport Duration & Pause/Resume Support
  useEffect(() => {
    if (!liveData) return;

    // Default to 45 minutes per half if not set by admin
    const halfMins = liveData.halfDurationMinutes || liveData.halfDuration || (selectedMatch as any)?.halfDurationMinutes || (selectedMatch as any)?.halfDuration || 45;
    const halfSecs = halfMins * 60;
    const fullSecs = halfSecs * 2;

    const interval = setInterval(() => {
      const status = liveData.status;
      const now = Date.now();

      if (status === "live") {
        const pausedSecs = liveData.totalPausedSeconds || 0;
        if (liveData.half === 2 && liveData.secondHalfStartedAt) {
          const diffSec = Math.max(0, Math.floor((now - liveData.secondHalfStartedAt) / 1000) - pausedSecs);
          const currentTotal = halfSecs + diffSec;
          setElapsedSeconds(currentTotal);
          setEventMinute(Math.min(halfMins * 2 + 30, Math.floor(currentTotal / 60) + 1));
        } else if (liveData.firstHalfStartedAt) {
          const diffSec = Math.max(0, Math.floor((now - liveData.firstHalfStartedAt) / 1000) - pausedSecs);
          setElapsedSeconds(diffSec);
          setEventMinute(Math.min(halfMins, Math.floor(diffSec / 60) + 1));
        }
      } else if (status === "paused") {
        const pausedSecs = liveData.totalPausedSeconds || 0;
        const freezePoint = liveData.pausedAt || now;
        if (liveData.half === 2 && liveData.secondHalfStartedAt) {
          const diffSec = Math.max(0, Math.floor((freezePoint - liveData.secondHalfStartedAt) / 1000) - pausedSecs);
          const currentTotal = halfSecs + diffSec;
          setElapsedSeconds(currentTotal);
          setEventMinute(Math.min(halfMins * 2 + 30, Math.floor(currentTotal / 60) + 1));
        } else if (liveData.firstHalfStartedAt) {
          const diffSec = Math.max(0, Math.floor((freezePoint - liveData.firstHalfStartedAt) / 1000) - pausedSecs);
          setElapsedSeconds(diffSec);
          setEventMinute(Math.min(halfMins, Math.floor(diffSec / 60) + 1));
        }
      } else if (status === "half_time") {
        setElapsedSeconds(halfSecs);
        setEventMinute(halfMins);
      } else if (status === "full_time" || status === "completed") {
        setElapsedSeconds(fullSecs);
        setEventMinute(halfMins * 2);
      } else {
        setElapsedSeconds(0);
        setEventMinute(1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [liveData, selectedMatch]);

  async function loadMatchesList() {
    try {
      setLoadingMatches(true);
      setError("");
      const response = await getMatches();
      const list = response.data || [];
      setMatches(list);

      if (list.length > 0) {
        const savedId = typeof window !== "undefined" ? localStorage.getItem("scorer_selected_match_id") : null;
        let matchToSelect = savedId ? list.find((m) => m.id === savedId) : null;
        if (!matchToSelect) {
          matchToSelect = list.find((m) => m.status?.toLowerCase() !== "completed") || list[0];
        }

        setSelectedMatch(matchToSelect);
        if (matchToSelect) {
          loadLiveScoreDataHttp(matchToSelect.id);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoadingMatches(false);
    }
  }

  function handleSelectMatch(match: Match) {
    setSelectedMatch(match);
    if (typeof window !== "undefined") {
      localStorage.setItem("scorer_selected_match_id", match.id);
    }
    loadLiveScoreDataHttp(match.id);
  }

  async function loadLiveScoreDataHttp(matchId: string) {
    try {
      const res = await getLiveScore(matchId);
      const data = res.data || null;
      setLiveData(data);

      if (data && selectedMatch) {
        const tAId = data.teamA?.teamId || selectedMatch.teamA?.id || (selectedMatch as any)?.teamAId;
        if (tAId && !eventTeamId) {
          setEventTeamId(tAId);
        }
      }
    } catch (err) {
      console.error(err);
      setLiveData(null);
    }
  }

  async function handleInitialize() {
    if (!selectedMatch) return;
    try {
      setActionLoading(true);
      const res = await initializeLiveMatch(selectedMatch.id);
      if (res && res.data) {
        setLiveData(res.data);
      } else {
        await loadLiveScoreDataHttp(selectedMatch.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initialize match");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStart() {
    if (!selectedMatch) return;
    try {
      setActionLoading(true);
      const res = await startLiveMatch(selectedMatch.id);
      if (res && res.data) {
        setLiveData(res.data);
      } else {
        await loadLiveScoreDataHttp(selectedMatch.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start match");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(nextStatus: any) {
    if (!selectedMatch) return;
    try {
      setActionLoading(true);
      const res = await updateLiveMatchStatus(selectedMatch.id, nextStatus);
      if (res && res.data) {
        setLiveData(res.data);
      } else {
        await loadLiveScoreDataHttp(selectedMatch.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update match status");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatch) return;
    try {
      setActionLoading(true);
      const targetTeamId = eventTeamId || teamAId || "team-a";
      const targetTeamName = targetTeamId === teamAId ? teamAName : teamBName;
      const nowIso = new Date().toISOString();

      await createFootballEvent(selectedMatch.id, {
        type: eventType,
        teamId: targetTeamId,
        teamName: targetTeamName,
        minute: eventMinute,
        playerName: playerName || undefined,
        assistPlayerName: assistPlayerName || undefined,
        description: description || undefined,
        note: description || undefined,
        timestamp: Date.now(),
        createdAt: nowIso,
      });

      setPlayerName("");
      setAssistPlayerName("");
      setDescription("");
      await loadLiveScoreDataHttp(selectedMatch.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record event");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!selectedMatch) return;
    if (!confirm("Are you sure you want to undo this event?")) return;

    try {
      setActionLoading(true);
      await deleteFootballEvent(selectedMatch.id, eventId);
      await loadLiveScoreDataHttp(selectedMatch.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!selectedMatch) return;
    if (!confirm("Are you sure you want to complete and finalize this match?")) return;

    try {
      setActionLoading(true);
      await completeMatch(selectedMatch.id);
      await loadMatchesList();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete match");
    } finally {
      setActionLoading(false);
    }
  }

  if (loadingMatches) {
    return <LoadingSpinner message="Loading match fixtures..." dark={true} />;
  }

  const activeMatches = matches.filter((m) => m.status?.toLowerCase() !== "completed");
  const completedMatches = matches.filter((m) => m.status?.toLowerCase() === "completed");
  const eventsList = liveData?.events ? Object.values(liveData.events) : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header / Profile Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xl font-bold">
            📋
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Match Scorer Dashboard</h1>
            <p className="text-xs text-slate-400">Record live scores, events & manage match fixtures</p>
          </div>
        </div>

        {/* User Profile & Role Badge */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-1.5 shadow-inner">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 font-black text-xs text-slate-950 uppercase shadow">
                {(currentUser.displayName || currentUser.email || "SC").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {currentUser.displayName || currentUser.email?.split("@")[0] || "Scorer"}
                </span>
                <span className="text-[10px] font-extrabold uppercase text-cyan-400 leading-none mt-0.5">
                  Match Scorer
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("live")}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "live"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          ⚡ Live Scoring Console ({activeMatches.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "history"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🏆 Completed Match History ({completedMatches.length})
        </button>
      </div>

      {activeTab === "history" ? (
        /* Completed Match History View */
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Completed Tournament Matches</h2>
          {completedMatches.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 shadow-xl">
              <span className="text-4xl mb-3 block">📜</span>
              <h3 className="text-lg font-bold text-white mb-1">No Completed Matches Yet</h3>
              <p className="text-sm text-slate-500">
                Completed matches will be archived here with downloadable official reports.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedMatches.map((m) => {
                const tAName = m.teamA?.name || (m as any).teamAName || "Team A";
                const tBName = m.teamB?.name || (m as any).teamBName || "Team B";
                const sA = (m as any).result?.teamA?.score ?? 0;
                const sB = (m as any).result?.teamB?.score ?? 0;

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider mb-3">
                        <span>{m.sportName || m.sport || "Football"}</span>
                        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300">
                          {m.venue || "Stadium"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 items-center text-center my-2">
                        <span className="font-bold text-white text-base">{tAName}</span>
                        <span className="text-2xl font-black font-mono text-cyan-400">
                          {sA} : {sB}
                        </span>
                        <span className="font-bold text-white text-base">{tBName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => exportMatchReportCSV(m)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2 text-xs font-bold text-cyan-300 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      📥 Download Official Match Report (.CSV)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Live Scoring Console View */
        <>
          {/* Match Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Active Match to Score
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterAssignedOnly(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    filterAssignedOnly
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  🎯 My Assigned Matches
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAssignedOnly(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    !filterAssignedOnly
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  🌐 All Matches ({matches.length})
                </button>
              </div>
            </div>

            <select
              value={selectedMatch?.id || ""}
              onChange={(e) => {
                const m = matches.find((x) => x.id === e.target.value);
                if (m) handleSelectMatch(m);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 sm:p-3 text-sm sm:text-base font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              {matchesForScorer.length === 0 ? (
                <option value="">No matches assigned to your account</option>
              ) : (
                matchesForScorer.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.sportName || m.sport || "Football"} — {m.teamA?.name || (m as any).teamAName} vs {m.teamB?.name || (m as any).teamBName} ({m.status}) {m.scorerName ? `[Assigned: ${m.scorerName}]` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedMatch && (
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
              {/* Main Scoreboard & Digital Clock */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-8 shadow-2xl">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 pb-4 mb-6 gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                      <span>{selectedMatch.sportName || selectedMatch.sport || "Football"} • {selectedMatch.venue || "Stadium"}</span>
                      <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        ● RTDB Connected (0ms)
                      </span>
                    </span>

                    {/* Digital Clock Component */}
                    <DigitalClock seconds={elapsedSeconds} status={liveData?.status || selectedMatch.status} />
                  </div>

                  {/* Live Scoreboard */}
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="space-y-1 sm:space-y-2">
                      <h2 className="text-lg sm:text-2xl font-black text-white truncate">{teamAName}</h2>
                      <span className="text-xs font-semibold text-slate-400">Home</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                      <span className="text-4xl sm:text-6xl font-black tracking-tight text-cyan-400 font-mono">
                        {scoreA}
                      </span>
                      <span className="text-xl sm:text-3xl font-light text-slate-600">:</span>
                      <span className="text-4xl sm:text-6xl font-black tracking-tight text-cyan-400 font-mono">
                        {scoreB}
                      </span>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <h2 className="text-lg sm:text-2xl font-black text-white truncate">{teamBName}</h2>
                      <span className="text-xs font-semibold text-slate-400">Away</span>
                    </div>
                  </div>

                  {/* Status Step Transitions & Report Download */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2.5">
                    {/* Step 1: Initialize Match */}
                    {!liveData && (
                      <button
                        onClick={handleInitialize}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-cyan-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>⚙️ Initialize Match</span>
                      </button>
                    )}

                    {/* Step 2: Start 1st Half */}
                    {(liveData?.status === "not_started" || (liveData && selectedMatch.status?.toLowerCase() === "scheduled" && liveData.status !== "live" && liveData.status !== "half_time" && liveData.status !== "full_time")) && (
                      <button
                        onClick={handleStart}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>▶️ Start 1st Half</span>
                      </button>
                    )}

                    {/* Step 3: Pause Live Match */}
                    {liveData?.status === "live" && (
                      <button
                        onClick={() => handleStatusChange("paused")}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>⏸️ Pause Match</span>
                      </button>
                    )}

                    {/* Step 4: Resume Paused Match */}
                    {liveData?.status === "paused" && (
                      <button
                        onClick={() => handleStatusChange("live")}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>▶️ Resume Match</span>
                      </button>
                    )}

                    {/* Step 5: 1st Half End */}
                    {(liveData?.status === "live" || liveData?.status === "paused") && (liveData?.half === 1 || !liveData?.half) && (
                      <button
                        onClick={() => handleStatusChange("half_time")}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-200 shadow-lg hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>🏁 1st Half End (Half Time)</span>
                      </button>
                    )}

                    {/* Step 6: Start 2nd Half */}
                    {liveData?.status === "half_time" && (
                      <button
                        onClick={() => handleStatusChange("live")}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>▶️ Start 2nd Half</span>
                      </button>
                    )}

                    {/* Step 7: Whistle Full Time */}
                    {(liveData?.status === "live" || liveData?.status === "paused") && liveData?.half === 2 && (
                      <button
                        onClick={() => handleStatusChange("full_time")}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>⏱️ Whistle Full Time</span>
                      </button>
                    )}

                    {/* Step 6: Finalize Match */}
                    {liveData?.status === "full_time" && (
                      <button
                        onClick={handleComplete}
                        disabled={actionLoading}
                        className="w-full sm:w-auto rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <span>🏆 Finalize & Complete Match</span>
                      </button>
                    )}

                    <button
                      onClick={() => exportMatchReportCSV(selectedMatch, liveData)}
                      className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all"
                    >
                      📥 Download Report (.CSV)
                    </button>
                  </div>
                </div>

                {/* Event Form */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>⚽ Record Live Football Event</span>
                  </h3>

                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Event Type</label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white"
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
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white"
                        >
                          <option value={teamAId}>{teamAName}</option>
                          <option value={teamBId}>{teamBName}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Minute</label>
                        <input
                          type="number"
                          min={1}
                          max={130}
                          value={eventMinute}
                          onChange={(e) => setEventMinute(parseInt(e.target.value) || 1)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Player Name</label>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="e.g. Lionel Messi"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Assist By (Optional)</label>
                        <input
                          type="text"
                          value={assistPlayerName}
                          onChange={(e) => setAssistPlayerName(e.target.value)}
                          placeholder="e.g. Angel Di Maria"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Description / Note</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g. Header from corner"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading || (liveData?.status !== "live" && selectedMatch.status !== "LIVE" as any)}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-3 text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? "Submitting Event..." : "Record Live Event"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Event Stream & Timeline */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
                  <span>Match Timeline</span>
                  <span className="text-xs font-semibold text-slate-400">
                    {eventsList.length} events
                  </span>
                </h3>

                {eventsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    No events recorded yet for this match.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                    {eventsList.map((ev: any) => {
                      const isTeamA = ev.teamId === teamAId;
                      const name = ev.teamName || (isTeamA ? teamAName : teamBName);

                      return (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded">
                              {ev.minute}'
                            </span>
                            <div>
                              <p className="font-semibold text-slate-200 text-xs sm:text-sm">
                                {ev.type === "goal" ? "⚽ Goal" : ev.type === "yellow_card" ? "🟨 Yellow Card" : ev.type === "red_card" ? "🟥 Red Card" : "🔄 Sub"}
                                {" — "}
                                <span className="text-slate-300 font-bold">{name}</span>
                              </p>
                              {ev.playerName && (
                                <p className="text-xs text-slate-300 font-medium mt-0.5">👤 {ev.playerName}</p>
                              )}
                              {ev.assistPlayerName && (
                                <p className="text-xs text-slate-400 font-medium">👟 Assist: {ev.assistPlayerName}</p>
                              )}
                              {ev.description && (
                                <p className="text-xs text-cyan-400/90 italic mt-0.5">📝 {ev.description}</p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded bg-red-950/30 hover:bg-red-900/50 transition-all"
                          >
                            Undo
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
