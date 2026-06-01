import { createFileRoute } from "@tanstack/react-router";
import { useStandings } from "@/hooks/useFootballData";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorState, EmptyState } from "@/components/States";
import { getGroupStandings, teamQualificationStatus } from "@/lib/bracketGenerator";
import type { ApiStandingRow } from "@/lib/types";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups & Standings — FIFA World Cup 2026" },
      { name: "description", content: "All 12 groups (A-L) of the FIFA World Cup 2026 with live standings and qualification status." },
    ],
  }),
  component: GroupsPage,
});

const ALL_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function statusBadge(s: "QUALIFIED" | "POSSIBLE" | "ELIMINATED") {
  if (s === "QUALIFIED")
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-success/20 text-[color:var(--success)]">Q</span>;
  if (s === "ELIMINATED")
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-danger/20 text-[color:var(--danger)]">E</span>;
  return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-warning/20 text-[color:var(--warning)]">P</span>;
}

function GroupTable({ group, table }: { group: string; table: ApiStandingRow[] }) {
  return (
    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl font-bold">Group {group}</h3>
        <span className="text-xs text-muted-foreground">4 teams · 6 matches</span>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2 px-2 sm:px-3">#</th>
              <th className="py-2 px-2 sm:px-3">Team</th>
              <th className="py-2 px-2 text-center">P</th>
              <th className="py-2 px-2 text-center">W</th>
              <th className="py-2 px-2 text-center">D</th>
              <th className="py-2 px-2 text-center">L</th>
              <th className="py-2 px-2 text-center hidden sm:table-cell">GF</th>
              <th className="py-2 px-2 text-center hidden sm:table-cell">GA</th>
              <th className="py-2 px-2 text-center">GD</th>
              <th className="py-2 px-2 text-center font-bold text-foreground">Pts</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => {
              const status = teamQualificationStatus(row, table);
              const qualifiesBorder =
                row.position <= 2 ? "border-l-2 border-l-[color:var(--gold)]"
                : row.position === 3 ? "border-l-2 border-l-warning"
                : "border-l-2 border-l-transparent";
              return (
                <tr key={row.team.id} className={`border-b border-border/40 last:border-0 ${qualifiesBorder}`}>
                  <td className="py-2.5 px-2 sm:px-3 font-bold tabular-nums">{row.position}</td>
                  <td className="py-2.5 px-2 sm:px-3">
                    <div className="flex items-center gap-2">
                      {row.team.crest && <img src={row.team.crest} alt="" className="h-5 w-5 object-contain" />}
                      <span className="font-medium truncate">{row.team.shortName ?? row.team.name}</span>
                      {statusBadge(status)}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center tabular-nums">{row.playedGames}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums">{row.won}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums">{row.draw}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums">{row.lost}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums hidden sm:table-cell">{row.goalsFor}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums hidden sm:table-cell">{row.goalsAgainst}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                  <td className="py-2.5 px-2 text-center tabular-nums font-bold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupsPage() {
  const { data, isLoading, error } = useStandings();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Groups</h1>
        <p className="text-muted-foreground mt-2">All 12 groups · Top 2 + best 8 third-placed teams advance.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend color="bg-success/20 text-[color:var(--success)]" label="Qualified" />
          <Legend color="bg-warning/20 text-[color:var(--warning)]" label="Possible" />
          <Legend color="bg-danger/20 text-[color:var(--danger)]" label="Eliminated" />
        </div>
      </header>

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState error={error} />
      ) : (() => {
        const grouped = getGroupStandings(data?.standings ?? []);
        const present = ALL_GROUPS.filter((g) => grouped[g]);
        if (present.length === 0) {
          return <EmptyState title="Standings not yet available" description="Once group-stage matches begin, standings will appear here automatically." />;
        }
        return (
          <div className="grid lg:grid-cols-2 gap-5">
            {present.map((g) => <GroupTable key={g} group={g} table={grouped[g]} />)}
          </div>
        );
      })()}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
