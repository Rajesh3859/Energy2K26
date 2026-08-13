import { Match } from '@/types/match';

export function ScoreCard({ match }: { match: Match }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="text-xs font-semibold text-gray-500 uppercase">{match.sport} • {match.status}</div>
      <div className="flex justify-between items-center my-2">
        <span className="font-bold">{match.teamA.name}</span>
        <span className="text-xl font-bold">{match.teamA.score ?? 0}</span>
      </div>
      <div className="flex justify-between items-center my-2">
        <span className="font-bold">{match.teamB.name}</span>
        <span className="text-xl font-bold">{match.teamB.score ?? 0}</span>
      </div>
    </div>
  );
}
