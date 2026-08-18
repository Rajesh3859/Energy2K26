export interface SportDefinition {
  id: string;
  code: string;
  name: string;
  scoringType: "goals" | "runs" | "points" | "sets" | "games";
  matchStructure: "periods" | "innings" | "quarters" | "sets" | "games";
  periods?: number;
  supportsTimer: boolean;
  supportsEvents: boolean;
  eventTypes?: { type: string; label: string; icon: string }[];
}

export const SPORTS: Record<string, SportDefinition> = {
  football: {
    id: "01",
    code: "football",
    name: "Football",
    scoringType: "goals",
    matchStructure: "periods",
    periods: 2,
    supportsTimer: true,
    supportsEvents: true,
    eventTypes: [
      { type: "goal", label: "Goal", icon: "⚽" },
      { type: "yellow_card", label: "Yellow Card", icon: "🟨" },
      { type: "red_card", label: "Red Card", icon: "🟥" },
      { type: "substitution", label: "Substitution", icon: "🔄" },
    ],
  },

  cricket: {
    id: "02",
    code: "cricket",
    name: "Cricket",
    scoringType: "runs",
    matchStructure: "innings",
    supportsTimer: false,
    supportsEvents: true,
    eventTypes: [
      { type: "run", label: "Runs Scored", icon: "🏏" },
      { type: "boundary_4", label: "FOUR (4)", icon: "4️⃣" },
      { type: "boundary_6", label: "SIX (6)", icon: "6️⃣" },
      { type: "wicket", label: "Wicket", icon: "🔴" },
      { type: "extra", label: "Extra (Wide/No Ball)", icon: "➕" },
    ],
  },

  kabaddi: {
    id: "03",
    code: "kabaddi",
    name: "Kabaddi",
    scoringType: "points",
    matchStructure: "periods",
    periods: 2,
    supportsTimer: true,
    supportsEvents: true,
    eventTypes: [
      { type: "raid_point", label: "Raid Point", icon: "🏃" },
      { type: "tackle_point", label: "Tackle Point", icon: "🤼" },
      { type: "super_raid", label: "Super Raid", icon: "⚡" },
      { type: "super_tackle", label: "Super Tackle", icon: "💪" },
      { type: "all_out", label: "All Out (+2)", icon: "💥" },
      { type: "bonus_point", label: "Bonus Point", icon: "⭐" },
    ],
  },

  basketball: {
    id: "04",
    code: "basketball",
    name: "Basketball",
    scoringType: "points",
    matchStructure: "quarters",
    periods: 4,
    supportsTimer: true,
    supportsEvents: true,
    eventTypes: [
      { type: "point_1", label: "Free Throw (+1)", icon: "🎯" },
      { type: "point_2", label: "Field Goal (+2)", icon: "🏀" },
      { type: "point_3", label: "3-Pointer (+3)", icon: "🔥" },
      { type: "foul", label: "Foul", icon: "⚠️" },
      { type: "timeout", label: "Timeout", icon: "⏱️" },
    ],
  },

  volleyball: {
    id: "05",
    code: "volleyball",
    name: "Volleyball",
    scoringType: "points",
    matchStructure: "sets",
    supportsTimer: false,
    supportsEvents: true,
    eventTypes: [
      { type: "set_point", label: "Rally Point (+1)", icon: "🏐" },
      { type: "ace", label: "Service Ace", icon: "⚡" },
      { type: "block", label: "Block Point", icon: "🛡️" },
    ],
  },

  table_tennis: {
    id: "06",
    code: "table_tennis",
    name: "Table Tennis",
    scoringType: "points",
    matchStructure: "games",
    supportsTimer: false,
    supportsEvents: true,
    eventTypes: [
      { type: "game_point", label: "Point (+1)", icon: "🏓" },
      { type: "ace", label: "Service Winner", icon: "⚡" },
    ],
  },

  badminton: {
    id: "07",
    code: "badminton",
    name: "Badminton",
    scoringType: "points",
    matchStructure: "games",
    supportsTimer: false,
    supportsEvents: true,
    eventTypes: [
      { type: "rally_point", label: "Rally Point (+1)", icon: "🏸" },
      { type: "smash", label: "Smash Winner", icon: "💥" },
    ],
  },
};

/**
 * Resolves a sport code string (e.g., 'cricket', 'Cricket', '02', 'table_tennis') to its SportDefinition
 */
export function getSportDefinition(sportCodeOrName?: any): SportDefinition {
  if (!sportCodeOrName) return SPORTS.football;

  let str = "";
  if (typeof sportCodeOrName === "object" && sportCodeOrName !== null) {
    str =
      sportCodeOrName.sportCode ||
      sportCodeOrName.sport ||
      sportCodeOrName.sportName ||
      sportCodeOrName.name ||
      (sportCodeOrName.code && !sportCodeOrName.matchCode ? sportCodeOrName.code : "") ||
      sportCodeOrName.id ||
      "";
  } else {
    str = String(sportCodeOrName);
  }

  if (!str) return SPORTS.football;

  const key = str.toLowerCase().trim().replace(/[\s-]/g, "_");
  if (SPORTS[key]) return SPORTS[key];

  const found = Object.values(SPORTS).find(
    (s) =>
      s.code.toLowerCase() === key ||
      s.name.toLowerCase() === str.toLowerCase().trim() ||
      s.id === str ||
      key.includes(s.code.toLowerCase()) ||
      key.includes(s.name.toLowerCase()) ||
      s.code.toLowerCase().includes(key) ||
      s.name.toLowerCase().includes(key) ||
      str.toLowerCase().includes(s.code) ||
      str.toLowerCase().includes(s.name.toLowerCase())
  );

  return found || SPORTS.football;
}
