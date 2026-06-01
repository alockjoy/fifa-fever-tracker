import type {
  ApiStandingGroup,
  ApiStandingRow,
  BracketMatch,
  BracketTeam,
} from "./types";

/**
 * Bracket generator for FIFA World Cup 2026 format:
 * 48 teams, 12 groups (A-L), top 2 + best 8 third-place teams advance to R32.
 */

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function toBracketTeam(row: ApiStandingRow, group: string): BracketTeam {
  return {
    team: row.team,
    group,
    groupPosition: row.position,
    points: row.points,
    goalDifference: row.goalDifference,
    goalsFor: row.goalsFor,
  };
}

export function getGroupStandings(
  standings: ApiStandingGroup[],
): Record<string, ApiStandingRow[]> {
  const map: Record<string, ApiStandingRow[]> = {};
  for (const s of standings) {
    if (s.type !== "TOTAL") continue;
    const g = (s.group ?? "").replace(/^GROUP_/, "").trim();
    if (g && GROUPS.includes(g)) map[g] = s.table;
  }
  return map;
}

/**
 * Rank all third-placed teams, return the best `count` (default 8).
 * Tiebreakers: points → GD → goals for.
 */
export function calculateBestThirdPlacedTeams(
  standings: ApiStandingGroup[],
  count = 8,
): BracketTeam[] {
  const grouped = getGroupStandings(standings);
  const thirds: BracketTeam[] = [];
  for (const g of GROUPS) {
    const table = grouped[g];
    if (!table) continue;
    const third = table.find((r) => r.position === 3);
    if (third) thirds.push(toBracketTeam(third, g));
  }
  thirds.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor,
  );
  return thirds.slice(0, count);
}

export function getWinnersAndRunnersUp(standings: ApiStandingGroup[]) {
  const grouped = getGroupStandings(standings);
  const winners: Record<string, BracketTeam | undefined> = {};
  const runnersUp: Record<string, BracketTeam | undefined> = {};
  for (const g of GROUPS) {
    const table = grouped[g];
    if (!table) continue;
    const w = table.find((r) => r.position === 1);
    const r = table.find((r) => r.position === 2);
    if (w) winners[g] = toBracketTeam(w, g);
    if (r) runnersUp[g] = toBracketTeam(r, g);
  }
  return { winners, runnersUp };
}

/**
 * Generate Round of 32 pairings.
 * Uses a stable, FIFA-published-style pairing scheme. Since the official
 * cross-group pairings haven't been confirmed yet, we use a deterministic
 * snake bracket: 1A-3X, 1B-2Y, etc. This is replaceable when FIFA confirms.
 */
export function generateRoundOf32(standings: ApiStandingGroup[]): BracketMatch[] {
  const { winners, runnersUp } = getWinnersAndRunnersUp(standings);
  const thirds = calculateBestThirdPlacedTeams(standings, 8);

  // ordered slots: 16 deterministic matchups
  // pattern alternates: winner vs third / runner-up vs runner-up to mimic bracket spread
  const pairings: Array<[BracketTeam | undefined | string, BracketTeam | undefined | string]> = [
    [winners.A, thirds[0] ?? "Best 3rd #1"],
    [runnersUp.C, runnersUp.E],
    [winners.B, thirds[1] ?? "Best 3rd #2"],
    [runnersUp.D, runnersUp.F],

    [winners.C, thirds[2] ?? "Best 3rd #3"],
    [runnersUp.A, runnersUp.B],
    [winners.D, thirds[3] ?? "Best 3rd #4"],
    [runnersUp.G, runnersUp.H],

    [winners.E, thirds[4] ?? "Best 3rd #5"],
    [runnersUp.I, runnersUp.J],
    [winners.F, thirds[5] ?? "Best 3rd #6"],
    [runnersUp.K, runnersUp.L],

    [winners.G, thirds[6] ?? "Best 3rd #7"],
    [winners.H, winners.I],
    [winners.J, thirds[7] ?? "Best 3rd #8"],
    [winners.K, winners.L],
  ];

  return pairings.map((p, i) => ({
    id: `R32-${i + 1}`,
    round: "R32",
    slot: i + 1,
    home: typeof p[0] === "string" ? { placeholder: p[0] } : p[0],
    away: typeof p[1] === "string" ? { placeholder: p[1] } : p[1],
  }));
}

export function generateRoundOf16(_standings: ApiStandingGroup[]): BracketMatch[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `R16-${i + 1}`,
    round: "R16" as const,
    slot: i + 1,
    home: { placeholder: `Winner R32-${i * 2 + 1}` },
    away: { placeholder: `Winner R32-${i * 2 + 2}` },
  }));
}

export function generateQuarterFinals(_standings: ApiStandingGroup[]): BracketMatch[] {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `QF-${i + 1}`,
    round: "QF" as const,
    slot: i + 1,
    home: { placeholder: `Winner R16-${i * 2 + 1}` },
    away: { placeholder: `Winner R16-${i * 2 + 2}` },
  }));
}

export function generateSemiFinals(_standings: ApiStandingGroup[]): BracketMatch[] {
  return Array.from({ length: 2 }, (_, i) => ({
    id: `SF-${i + 1}`,
    round: "SF" as const,
    slot: i + 1,
    home: { placeholder: `Winner QF-${i * 2 + 1}` },
    away: { placeholder: `Winner QF-${i * 2 + 2}` },
  }));
}

export function generateFinal(_standings: ApiStandingGroup[]): BracketMatch[] {
  return [
    {
      id: "F-1",
      round: "F",
      slot: 1,
      home: { placeholder: "Winner SF-1" },
      away: { placeholder: "Winner SF-2" },
    },
  ];
}

export function generateFullBracket(standings: ApiStandingGroup[]) {
  return {
    r32: generateRoundOf32(standings),
    r16: generateRoundOf16(standings),
    qf: generateQuarterFinals(standings),
    sf: generateSemiFinals(standings),
    f: generateFinal(standings),
  };
}

/** Qualification status per team based on remaining matches and standings. */
export function teamQualificationStatus(
  row: ApiStandingRow,
  table: ApiStandingRow[],
): "QUALIFIED" | "POSSIBLE" | "ELIMINATED" {
  const matchesPlayed = row.playedGames;
  const totalGroupGames = 3; // 4 teams, each plays 3
  const remaining = totalGroupGames - matchesPlayed;
  const maxPossible = row.points + remaining * 3;

  // qualified if in top 2 with no remaining games OR mathematically certain
  if (remaining === 0 && row.position <= 2) return "QUALIFIED";

  // eliminated if max possible < third place current points and no chance
  const thirdPoints = table.find((r) => r.position === 3)?.points ?? 0;
  if (remaining === 0 && row.position > 3) return "ELIMINATED";
  if (maxPossible < thirdPoints && row.position > 3) return "ELIMINATED";

  if (row.position <= 2) return "POSSIBLE";
  return "POSSIBLE";
}
