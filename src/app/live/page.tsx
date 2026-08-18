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
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-md"
        >
          <span>← Back to Admin Dashboard</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
        >
          <span>🏠 Home</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 mb-3">
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
            <div className="flex items-center gap-2 text-xs font-mono bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span>⚡ Firebase Realtime Sync Active (0ms)</span>
            </div>
            <button
              onClick={() => {
                const targetId = selectedMatch?.matchId || selectedMatch?.id || (liveMatches[0] ? (liveMatches[0].matchId || liveMatches[0].id) : "test_match");
                const testRef = ref(database, `liveMatches/${targetId}/test`);
                set(testRef, Date.now());
                console.log(`🧪 Triggered test write to liveMatches/${targetId}/test`);
              }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-bold border border-white/30 transition-all cursor-pointer shadow-md"
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
            <span>⚽ Ongoing Live Matches</span>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              {liveMatches.length} Active
            </span>
          </h2>

          {liveMatches.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 shadow-xl">
              <span className="text-4xl mb-3 block">🏆</span>
              <h3 className="text-lg font-bold text-white mb-1">No Matches Currently Live</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Check back soon for live fixtures or view scheduled tournament matches in the admin calendar.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveMatches.map((match) => {
                const teamA = match.teamA || {};
                const teamB = match.teamB || {};
                const events = match.events ? Object.values(match.events) : [];

                return (
                  <MatchCard
                    key={match.matchId || match.id}
                    sportName={match.sportName || "Football"}
                    status={match.status}
                    teamAName={teamA.teamName || "Team A"}
                    teamBName={teamB.teamName || "Team B"}
                    scoreA={teamA.score ?? 0}
                    scoreB={teamB.score ?? 0}
                    eventsCount={events.length}
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
          <div className="text-slate-100">
            <div className="grid grid-cols-3 items-center text-center my-6 py-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-xl font-extrabold text-white">
                {selectedMatch.teamA?.teamName || "Team A"}
              </p>
              <div className="text-4xl font-black font-mono text-cyan-400">
                {selectedMatch.teamA?.score ?? 0} : {selectedMatch.teamB?.score ?? 0}
              </div>
              <p className="text-xl font-extrabold text-white">
                {selectedMatch.teamB?.teamName || "Team B"}
              </p>
            </div>

            <h4 className="font-bold text-sm text-slate-300 mb-3 uppercase tracking-wider">
              Live Event Feed
            </h4>

            {!selectedMatch.events || Object.keys(selectedMatch.events).length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-sm">
                No events recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {Object.values(selectedMatch.events).map((ev: any) => {
                  const isTeamA = ev.teamId === (selectedMatch.teamA?.teamId || selectedMatch.teamA?.id);
                  const teamName = ev.teamName || (isTeamA ? selectedMatch.teamA?.teamName : selectedMatch.teamB?.teamName) || "Team";

                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm"
                    >
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded">
                        {ev.minute}'
                      </span>
                      <div>
                        <p className="font-semibold text-white">
                          {ev.type === "goal" ? "⚽ Goal!" : ev.type === "yellow_card" ? "🟨 Yellow Card" : ev.type === "red_card" ? "🟥 Red Card" : "🔄 Substitution"}
                          {" — "}
                          <span className="text-cyan-300 font-bold">{teamName}</span>
                        </p>
                        {ev.playerName && (
                          <p className="text-xs text-slate-300 font-medium mt-0.5">👤 {ev.playerName}</p>
                        )}
                        {ev.description && (
                          <p className="text-xs text-cyan-400/90 italic mt-0.5">📝 {ev.description}</p>
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
