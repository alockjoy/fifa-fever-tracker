import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMatches } from "@/hooks/useFootballData";
import { MatchCard } from "@/components/MatchCard";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorState, EmptyState } from "@/components/States";
import { Search } from "lucide-react";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches — FIFA World Cup 2026 Tracker" },
      { name: "description", content: "All FIFA World Cup 2026 fixtures and results with Bangladesh Time, searchable by team and filterable by group and matchday." },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { data, isLoading, error } = useMatches();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [matchday, setMatchday] = useState("");

  const matches = data?.matches ?? [];

  const groups = useMemo(
    () => Array.from(new Set(matches.map((m) => m.group).filter(Boolean))).sort(),
    [matches],
  );
  const matchdays = useMemo(
    () => Array.from(new Set(matches.map((m) => m.matchday).filter((v): v is number => v != null))).sort((a, b) => a - b),
    [matches],
  );

  const filtered = matches.filter((m) => {
    if (group && m.group !== group) return false;
    if (matchday && String(m.matchday) !== matchday) return false;
    if (q) {
      const s = q.toLowerCase();
      const hay = `${m.homeTeam.name} ${m.awayTeam.name} ${m.homeTeam.tla ?? ""} ${m.awayTeam.tla ?? ""}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  }).sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Matches</h1>
        <p className="text-muted-foreground mt-2">All World Cup 2026 fixtures in Bangladesh Time.</p>
      </header>

      <div className="glass rounded-xl p-4 mb-6 grid sm:grid-cols-[1fr_auto_auto] gap-3">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by team..."
            className="w-full bg-input/60 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="bg-input/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g} value={g ?? ""}>{(g ?? "").replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={matchday}
          onChange={(e) => setMatchday(e.target.value)}
          className="bg-input/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Matchdays</option>
          {matchdays.map((d) => (
            <option key={d} value={d}>Matchday {d}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState error={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches found" description="Try changing your filters or check back later." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
