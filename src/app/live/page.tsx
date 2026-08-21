"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { getPublicLiveMatches, getPublicLiveMatch } from "@/services/publicScore.service";
import MatchCard from "@/components/cards/MatchCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorAlert from "@/components/common/ErrorAlert";
import Modal from "@/components/common/Modal";
import MultiSportScoreDisplay from "@/components/sports/MultiSportScoreDisplay";
import { subscribeToAllLiveMatches, subscribeToLiveMatch } from "@/services/liveMatchRealtime";

export default function LivePage() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function parseMatches(dataObj: any) {
    if (!dataObj) {
      setLiveMatches([]);
      return;
    }
    const list = Object.values(dataObj).filter((m: any) => {
      const st = (m.status || "").toLowerCase();
      return st === "live" || st === "half_time" || st === "full_time" || st === "not_started";
    });
    setLiveMatches(list);
  }

  // Pure Firebase Realtime Listener (Zero Polling)
  useEffect(() => {
    fetchMatchesHttp();

    const unsubscribe = subscribeToAllLiveMatches((dataObj) => {
      parseMatches(dataObj);
      setLoading(false);
      setError("");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Firebase Realtime Listener for Selected Match Details Modal
  useEffect(() => {
    if (!selectedMatch) return;
    const matchId = selectedMatch.matchId || selectedMatch.id;
    if (!matchId) return;

    const unsubscribe = subscribeToLiveMatch(matchId, (data) => {
      if (data) {
        setSelectedMatch(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedMatch?.matchId, selectedMatch?.id]);

  async function fetchMatchesHttp() {
    try {
      const response = await getPublicLiveMatches();
      const list = response.data || response || [];
      setLiveMatches(Array.isArray(list) ? list : []);
      setError("");
    } catch (err) {
      console.error(err);
      if (liveMatches.length === 0) {
        setError("Unable to connect to live match server.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function openMatchDetails(matchId: string) {
    try {
      const response = await getPublicLiveMatch(matchId);
      if (response && response.data) {
        setSelectedMatch(response.data);
      } else {
        const found = liveMatches.find((m) => (m.matchId || m.id) === matchId);
        if (found) setSelectedMatch(found);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-md"
        >
          Back to Admin Dashboard
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
        >
          Home
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-md bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Match Broadcast Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Energy 2026 Live Scores
            </h1>
            <p className="mt-2 text-cyan-100 text-sm max-w-xl">
              Real-time scores, live match clocks, goal notifications, and tournament match statistics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-mono bg-black/20 backdrop-blur-md px-4 py-2 rounded-md border border-white/10">
              <span>Firebase Realtime Sync Active (0ms)</span>
            </div>
            <button
              onClick={() => {
                const targetId = selectedMatch?.matchId || selectedMatch?.id || (liveMatches[0] ? (liveMatches[0].matchId || liveMatches[0].id) : "test_match");
                const testRef = ref(database, `liveMatches/${targetId}/test`);
                set(testRef, Date.now());
                console.log(`🧪 Triggered test write to liveMatches/${targetId}/test`);
              }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-bold border border-white/30 transition-all cursor-pointer shadow-md"
            >
              Test Realtime
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="Connecting to live score feed..." dark={true} />}
      {error && <ErrorAlert title="Connection Offline" message={error} />}

      {!loading && !error && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Ongoing Live Matches</span>
            <span className="rounded-md bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              {liveMatches.length} Active
            </span>
          </h2>

          {liveMatches.length === 0 ? (
            <div className="rounded-md border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">No Matches Currently Live</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Check back soon for live fixtures or view scheduled tournament matches in the admin calendar.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveMatches.map((match, idx) => {
                const teamA = match.teamA || {};
                const teamB = match.teamB || {};
                const teamAName = teamA.teamName || match.teamA?.name || match.teamAName || "Team A";
                const teamBName = teamB.teamName || match.teamB?.name || match.teamBName || "Team B";
                const teamAId = teamA.teamId || match.teamA?.id || match.teamAId || "teamA";
                const teamBId = teamB.teamId || match.teamB?.id || match.teamBId || "teamB";

                const eventsList = match.events ? (Array.isArray(match.events) ? match.events : Object.values(match.events)) : [];

                const scoreA = (() => {
                  if (eventsList.length > 0) {
                    const goalCount = eventsList.filter(
                      (ev: any) =>
                        ev.type === "goal" &&
                        (ev.teamId === teamAId ||
                          ev.teamId === teamA.teamId ||
                          ev.teamId === match.teamA?.id ||
                          (ev.teamName && teamAName && ev.teamName.toLowerCase().trim() === teamAName.toLowerCase().trim()))
                    ).length;
                    if (goalCount > 0) return goalCount;
                  }
                  return typeof teamA.score === "number"
                    ? teamA.score
                    : typeof teamA.score === "object"
                    ? (teamA.score?.runs ?? teamA.score?.score ?? 0)
                    : (match.scoreTeamA ?? 0);
                })();

                const scoreB = (() => {
                  if (eventsList.length > 0) {
                    const goalCount = eventsList.filter(
                      (ev: any) =>
                        ev.type === "goal" &&
                        (ev.teamId === teamBId ||
                          ev.teamId === teamB.teamId ||
                          ev.teamId === match.teamB?.id ||
                          (ev.teamName && teamBName && ev.teamName.toLowerCase().trim() === teamBName.toLowerCase().trim()))
                    ).length;
                    if (goalCount > 0) return goalCount;
                  }
                  return typeof teamB.score === "number"
                    ? teamB.score
                    : typeof teamB.score === "object"
                    ? (teamB.score?.runs ?? teamB.score?.score ?? 0)
                    : (match.scoreTeamB ?? 0);
                })();

                return (
                  <MatchCard
                    key={match.matchId || match.id || `live_match_${idx}`}
                    sportName={match.sportName || "Football"}
                    sportCode={match.sportCode || match.sport}
                    status={match.status}
                    teamAName={teamAName}
                    teamBName={teamBName}
                    scoreA={scoreA}
                    scoreB={scoreB}
                    eventsCount={eventsList.length}
                    liveData={match}
                    onClick={() => openMatchDetails(match.matchId || match.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title="Live Match Center"
          maxWidth="lg"
        >
          <div className="text-slate-100 space-y-6">
            {(() => {
              const teamA = selectedMatch.teamA || {};
              const teamB = selectedMatch.teamB || {};
              const teamAName = teamA.teamName || selectedMatch.teamA?.name || selectedMatch.teamAName || "Team A";
              const teamBName = teamB.teamName || selectedMatch.teamB?.name || selectedMatch.teamBName || "Team B";
              const teamAId = teamA.teamId || selectedMatch.teamA?.id || selectedMatch.teamAId || "teamA";
              const teamBId = teamB.teamId || selectedMatch.teamB?.id || selectedMatch.teamBId || "teamB";

              const eventsList = selectedMatch.events ? (Array.isArray(selectedMatch.events) ? selectedMatch.events : Object.values(selectedMatch.events)) : [];

              const modalScoreA = (() => {
                if (eventsList.length > 0) {
                  const goalCount = eventsList.filter(
                    (ev: any) =>
                      ev.type === "goal" &&
                      (ev.teamId === teamAId ||
                        ev.teamId === teamA.teamId ||
                        ev.teamId === selectedMatch.teamA?.id ||
                        (ev.teamName && teamAName && ev.teamName.toLowerCase().trim() === teamAName.toLowerCase().trim()))
                  ).length;
                  if (goalCount > 0) return goalCount;
                }
                return typeof teamA.score === "number"
                  ? teamA.score
                  : typeof teamA.score === "object"
                  ? (teamA.score?.runs ?? teamA.score?.score ?? 0)
                  : (selectedMatch.scoreTeamA ?? 0);
              })();

              const modalScoreB = (() => {
                if (eventsList.length > 0) {
                  const goalCount = eventsList.filter(
                    (ev: any) =>
                      ev.type === "goal" &&
                      (ev.teamId === teamBId ||
                        ev.teamId === teamB.teamId ||
                        ev.teamId === selectedMatch.teamB?.id ||
                        (ev.teamName && teamBName && ev.teamName.toLowerCase().trim() === teamBName.toLowerCase().trim()))
                  ).length;
                  if (goalCount > 0) return goalCount;
                }
                return typeof teamB.score === "number"
                  ? teamB.score
                  : typeof teamB.score === "object"
                  ? (teamB.score?.runs ?? teamB.score?.score ?? 0)
                  : (selectedMatch.scoreTeamB ?? 0);
              })();

              return (
                <MultiSportScoreDisplay
                  sportCode={selectedMatch.sportCode || selectedMatch.sport}
                  sportName={selectedMatch.sportName || "Football"}
                  teamAName={teamAName}
                  teamBName={teamBName}
                  scoreA={modalScoreA}
                  scoreB={modalScoreB}
                  liveData={selectedMatch}
                />
              );
            })()}

            <h4 className="font-bold text-sm text-slate-300 mb-3 uppercase tracking-wider">
              Live Event Feed
            </h4>

            {!selectedMatch.events || Object.keys(selectedMatch.events).length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-sm">
                No events recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {Object.entries(selectedMatch.events).map(([evKey, ev]: [string, any], idx: number) => {
                  const isTeamA = ev.teamId === (selectedMatch.teamA?.teamId || selectedMatch.teamA?.id);
                  const teamName = ev.teamName || (isTeamA ? selectedMatch.teamA?.teamName : selectedMatch.teamB?.teamName) || "Team";

                  return (
                    <div
                      key={ev.id || evKey || `event_${idx}`}
                      className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950 p-3 text-sm"
                    >
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded-md">
                        {ev.minute ? `${ev.minute}'` : "•"}
                      </span>
                      <div>
                        <p className="font-semibold text-white">
                          {ev.type === "goal" ? "Goal!" : ev.type === "yellow_card" ? "Yellow Card" : ev.type === "red_card" ? "Red Card" : ev.type === "substitution" ? "Substitution" : ev.type === "ace" ? "Service Winner" : ev.type === "point" ? "Point" : `${ev.type || "Event"}`}
                          {" — "}
                          <span className="text-cyan-300 font-bold">{teamName}</span>
                        </p>
                        {ev.playerName && (
                          <p className="text-xs text-slate-300 font-medium mt-0.5">Player: {ev.playerName}</p>
                        )}
                        {ev.description && (
                          <p className="text-xs text-cyan-400/90 italic mt-0.5">Note: {ev.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
