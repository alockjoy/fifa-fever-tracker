import { createFileRoute } from "@tanstack/react-router";
import { useStandings } from "@/hooks/useFootballData";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/States";
import { generateFullBracket } from "@/lib/bracketGenerator";
import type { BracketMatch, BracketTeam } from "@/lib/types";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/bracket")({
  head: () => ({
    meta: [
      { title: "Knockout Bracket — FIFA World Cup 2026" },
      { name: "description", content: "Auto-generated FIFA World Cup 2026 knockout bracket: Round of 32 → Final, updated live from group standings." },
    ],
  }),
  component: BracketPage,
});

const ROUNDS: Array<{ key: "r32" | "r16" | "qf" | "sf" | "f"; label: string; sub: string }> = [
  { key: "r32", label: "Round of 32", sub: "32 → 16" },
  { key: "r16", label: "Round of 16", sub: "16 → 8" },
  { key: "qf", label: "Quarter-Finals", sub: "8 → 4" },
  { key: "sf", label: "Semi-Finals", sub: "4 → 2" },
  { key: "f", label: "Final", sub: "Champion" },
];

function isTeam(side: BracketMatch["home"]): side is BracketTeam {
  return !!side && "team" in side;
}

function Side({ side }: { side: BracketMatch["home"] }) {
  if (!side) {
    return <div className="flex items-center gap-2 py-2 px-3 text-muted-foreground italic text-sm">TBD</div>;
  }
  if (!isTeam(side)) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-muted-foreground text-sm italic">
        {side.placeholder}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 py-2 px-3">
      {side.team.crest ? (
        <img src={side.team.crest} alt="" className="h-5 w-5 object-contain" />
      ) : (
        <div className="h-5 w-5 rounded-full bg-accent" />
      )}
      <span className="font-medium text-sm truncate">{side.team.shortName ?? side.team.name}</span>
      <span className="ml-auto text-[10px] text-muted-foreground">{side.group}{side.groupPosition}</span>
    </div>
  );
}

function MatchBox({ m }: { m: BracketMatch }) {
  return (
    <div className="glass rounded-lg overflow-hidden min-w-[200px]">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-2">{m.id}</div>
      <Side side={m.home} />
      <div className="border-t border-border" />
      <Side side={m.away} />
    </div>
  );
}

function BracketPage() {
  const { data, isLoading, error } = useStandings();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Header />
        <div className="grid lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Header />
        <ErrorState error={error} />
      </div>
    );
  }

  const bracket = generateFullBracket(data?.standings ?? []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
      <Header />

      <div className="glass rounded-xl p-4 mb-6 text-xs text-muted-foreground">
        <strong className="text-foreground">Auto-generated</strong> from the latest group standings.
        Pairings refresh as results come in. Best-third ranking uses points → goal difference → goals scored.
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {ROUNDS.map((r) => (
            <div key={r.key} className="flex flex-col gap-3 min-w-[220px]">
              <div className="sticky top-16">
                <div className="font-display font-bold text-sm uppercase tracking-wider text-[color:var(--gold)]">{r.label}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{r.sub}</div>
              </div>
              <div className="flex flex-col gap-3">
                {bracket[r.key].map((m) => <MatchBox key={m.id} m={m} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-[var(--gradient-gold)] ring-gold flex items-center justify-center">
        <Trophy className="h-6 w-6 text-[var(--gold-foreground)]" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Knockout Bracket</h1>
        <p className="text-muted-foreground mt-1">Round of 32 → Final · 32 teams advance</p>
      </div>
    </header>
  );
}
