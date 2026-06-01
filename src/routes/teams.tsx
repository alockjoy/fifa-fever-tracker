import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTeams, useStandings, useMatches } from "@/hooks/useFootballData";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorState, EmptyState } from "@/components/States";
import { MatchCard } from "@/components/MatchCard";
import { getGroupStandings } from "@/lib/bracketGenerator";
import { Search, X } from "lucide-react";
import type { ApiTeam } from "@/lib/types";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams — FIFA World Cup 2026 Tracker" },
      { name: "description", content: "Browse all 48 FIFA World Cup 2026 teams with group position, fixtures, results and goal stats." },
    ],
  }),
  component: Page,
});

function Page() {
  const teams = useTeams();
  const standings = useStandings();
  const matches = useMatches();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ApiTeam | null>(null);

  const list = teams.data?.teams ?? [];
  const filtered = list
    .filter((t) => !q || `${t.name} ${t.tla ?? ""}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Teams</h1>
        <p className="text-muted-foreground mt-2">Click any team to see fixtures and results.</p>
      </header>

      <div className="glass rounded-xl p-4 mb-6">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teams..."
            className="w-full bg-input/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>
      </div>

      {teams.isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : teams.error ? (
        <ErrorState error={teams.error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No teams found" description="Team list will appear once Football-Data.org publishes it." />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="glass rounded-lg p-4 flex items-center gap-3 text-left hover:border-primary/40 hover:ring-glow transition-all"
            >
              {t.crest ? <img src={t.crest} alt="" className="h-10 w-10 object-contain" /> : <div className="h-10 w-10 rounded-full bg-accent" />}
              <div className="min-w-0">
                <div className="font-semibold truncate">{t.name}</div>
                {t.tla && <div className="text-xs text-muted-foreground">{t.tla}</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <TeamDrawer
          team={selected}
          onClose={() => setSelected(null)}
          standings={standings.data?.standings ?? []}
          matches={matches.data?.matches ?? []}
        />
      )}
    </div>
  );
}

function TeamDrawer({
  team,
  onClose,
  standings,
  matches,
}: {
  team: ApiTeam;
  onClose: () => void;
  standings: ReturnType<typeof useStandings>["data"] extends infer T ? (T extends { standings: infer S } ? S : never) : never;
  matches: ReturnType<typeof useMatches>["data"] extends infer T ? (T extends { matches: infer M } ? M : never) : never;
}) {
  const info = useMemo(() => {
    const groups = getGroupStandings(standings);
    for (const g of Object.keys(groups)) {
      const row = groups[g].find((r) => r.team.id === team.id);
      if (row) return { group: g, row };
    }
    return null;
  }, [standings, team.id]);

  const teamMatches = matches
    .filter((m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id)
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));

  const upcoming = teamMatches.filter((m) => m.status === "SCHEDULED" || m.status === "TIMED");
  const results = teamMatches.filter((m) => m.status === "FINISHED");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong rounded-t-2xl sm:rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {team.crest ? <img src={team.crest} alt="" className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 rounded-full bg-accent" />}
            <div>
              <h2 className="font-display text-2xl font-bold">{team.name}</h2>
              {info && (
                <p className="text-sm text-muted-foreground">
                  Group {info.group} · #{info.row.position} · {info.row.points} pts
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        {info && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Stat label="Played" value={info.row.playedGames} />
            <Stat label="W-D-L" value={`${info.row.won}-${info.row.draw}-${info.row.lost}`} />
            <Stat label="Goals For" value={info.row.goalsFor} />
            <Stat label="Goals Against" value={info.row.goalsAgainst} />
          </div>
        )}

        <h3 className="font-display text-lg font-bold mb-3">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-6">No upcoming matches.</p>
        ) : (
          <div className="space-y-3 mb-6">{upcoming.map((m) => <MatchCard key={m.id} match={m} />)}</div>
        )}

        <h3 className="font-display text-lg font-bold mb-3">Results</h3>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No results yet.</p>
        ) : (
          <div className="space-y-3">{results.map((m) => <MatchCard key={m.id} match={m} />)}</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-lg p-3 text-center">
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
