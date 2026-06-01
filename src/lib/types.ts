// FIFA World Cup 2026 — Domain types

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface ApiTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

export interface ApiScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: ApiScore;
}

export interface ApiStandingRow {
  position: number;
  team: ApiTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface ApiStandingGroup {
  stage: string;
  type: "TOTAL" | "HOME" | "AWAY";
  group: string | null;
  table: ApiStandingRow[];
}

export interface MatchesResponse { matches: ApiMatch[] }
export interface StandingsResponse { standings: ApiStandingGroup[] }
export interface TeamsResponse { teams: ApiTeam[] }

// Bracket
export type QualificationStatus = "QUALIFIED" | "POSSIBLE" | "ELIMINATED" | "UNKNOWN";

export interface BracketTeam {
  team: ApiTeam;
  group: string;
  groupPosition: number;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

export interface BracketMatch {
  id: string;
  round: "R32" | "R16" | "QF" | "SF" | "F";
  slot: number;
  home?: BracketTeam | { placeholder: string };
  away?: BracketTeam | { placeholder: string };
}
