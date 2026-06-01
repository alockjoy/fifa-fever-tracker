import { createFileRoute, Link } from "@tanstack/react-router";
import { useMatches, useStandings } from "@/hooks/useFootballData";
import { MatchCard } from "@/components/MatchCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorState, EmptyState } from "@/components/States";
import { todayBdKey, bdDayKey } from "@/lib/timeUtils";
import { getWinnersAndRunnersUp } from "@/lib/bracketGenerator";
import { Calendar, Trophy, Users, Target, ArrowRight, MapPin } from "lucide-react";
import type { ApiMatch } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup 2026 Tracker — Home" },
      { name: "description", content: "Live FIFA World Cup 2026 fixtures, countdown to the next match, today's games and qualified teams." },
    ],
  }),
  component: Home,
});

function Hero({ nextMatch }: { nextMatch?: ApiMatch }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.82_0.16_85/0.15),_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs uppercase tracking-widest">
              <MapPin className="h-3 w-3 text-[color:var(--gold)]" />
              <span>USA · Canada · Mexico · 2026</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              The road to the <span className="text-gradient-gold">2026 World Cup</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              48 teams. 12 groups. One trophy. Track every match, every standing
              and the auto-generated knockout bracket — all in Bangladesh Time.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 ring-glow"
              >
                View Matches <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/bracket"
                className="inline-flex items-center gap-2 rounded-lg glass-strong px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent/60"
              >
                Knockout Bracket
              </Link>
            </div>
          </div>

          {nextMatch ? (
            <div className="glass-strong rounded-2xl p-6 sm:p-8 space-y-5 ring-gold">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[color:var(--gold)] font-semibold">Next Match</span>
                <span className="text-xs text-muted-foreground">{nextMatch.stage.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <TeamBlock crest={nextMatch.homeTeam.crest} name={nextMatch.homeTeam.shortName ?? nextMatch.homeTeam.name} />
                <span className="font-display text-2xl text-muted-foreground">vs</span>
                <TeamBlock crest={nextMatch.awayTeam.crest} name={nextMatch.awayTeam.shortName ?? nextMatch.awayTeam.name} align="end" />
              </div>
              <CountdownTimer utc={nextMatch.utcDate} />
            </div>
          ) : (
            <div className="glass-strong rounded-2xl p-8 ring-gold">
              <span className="text-xs uppercase tracking-widest text-[color:var(--gold)] font-semibold">Tournament starts</span>
              <h3 className="font-display text-3xl font-bold mt-2">June 11, 2026</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Fixtures will appear here as soon as Football-Data.org publishes them.
              </p>
              <div className="mt-4">
                <CountdownTimer utc="2026-06-11T20:00:00Z" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TeamBlock({ crest, name, align = "start" }: { crest?: string; name: string; align?: "start" | "end" }) {
  return (
    <div className={`flex-1 flex flex-col items-${align === "end" ? "end" : "start"} gap-2 min-w-0`}>
      {crest ? (
        <img src={crest} alt={name} className="h-14 w-14 object-contain" />
      ) : (
        <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground">
          {name.slice(0, 3).toUpperCase()}
        </div>
      )}
      <span className="font-semibold truncate max-w-full">{name}</span>
    </div>
  );
}

const QUICK = [
  { to: "/matches", label: "Matches", icon: Calendar, desc: "Fixtures & results" },
  { to: "/groups", label: "Groups", icon: Users, desc: "All standings" },
  { to: "/qualification", label: "Qualification", icon: Target, desc: "Who's through" },
  { to: "/bracket", label: "Bracket", icon: Trophy, desc: "Knockout path" },
] as const;

function Home() {
  const matches = useMatches();
  const standings = useStandings();

  const all = matches.data?.matches ?? [];
  const now = Date.now();
  const upcoming = all
    .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));
  const nextMatch = upcoming[0];

  const todayKey = todayBdKey();
  const todays = all.filter((m) => bdDayKey(m.utcDate) === todayKey);

  const recent = all
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => +new Date(b.utcDate) - +new Date(a.utcDate))
    .slice(0, 4);

  const qualifiedTeams = standings.data
    ? (() => {
        const { winners, runnersUp } = getWinnersAndRunnersUp(standings.data.standings);
        return [...Object.values(winners), ...Object.values(runnersUp)].filter(Boolean).slice(0, 8);
      })()
    : [];

  return (
    <>
      <Hero nextMatch={nextMatch} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-12">
        {/* Quick nav */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="glass rounded-xl p-5 group hover:border-primary/40 hover:ring-glow transition-all"
            >
              <q.icon className="h-6 w-6 text-[color:var(--gold)] mb-3" />
              <div className="font-display font-semibold">{q.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{q.desc}</div>
            </Link>
          ))}
        </div>

        {/* Today's matches */}
        <div>
          <SectionHeading title="Today's Matches" subtitle="In Bangladesh Time (UTC+6)" />
          {matches.isLoading ? (
            <Grid><CardSkeleton /><CardSkeleton /></Grid>
          ) : matches.error ? (
            <ErrorState error={matches.error} />
          ) : todays.length === 0 ? (
            <EmptyState title="No matches today" description="Check back when the tournament is in full swing." />
          ) : (
            <Grid>{todays.map((m) => <MatchCard key={m.id} match={m} />)}</Grid>
          )}
        </div>

        {/* Upcoming */}
        <div>
          <SectionHeading title="Upcoming Matches" link={{ to: "/matches", label: "View all" }} />
          {matches.isLoading ? (
            <Grid><CardSkeleton /><CardSkeleton /><CardSkeleton /></Grid>
          ) : upcoming.length === 0 ? (
            <EmptyState title="No upcoming fixtures" />
          ) : (
            <Grid>{upcoming.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)}</Grid>
          )}
        </div>

        {/* Recent results */}
        {recent.length > 0 && (
          <div>
            <SectionHeading title="Latest Results" />
            <Grid>{recent.map((m) => <MatchCard key={m.id} match={m} />)}</Grid>
          </div>
        )}

        {/* Qualified teams */}
        {qualifiedTeams.length > 0 && (
          <div>
            <SectionHeading title="Qualified Teams" link={{ to: "/qualification", label: "Full tracker" }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {qualifiedTeams.map((t) =>
                t ? (
                  <div key={t.team.id} className="glass rounded-lg p-4 flex items-center gap-3">
                    {t.team.crest ? (
                      <img src={t.team.crest} alt="" className="h-8 w-8 object-contain" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-accent" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{t.team.shortName ?? t.team.name}</div>
                      <div className="text-xs text-muted-foreground">Group {t.group} · #{t.groupPosition}</div>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

function SectionHeading({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle?: string;
  link?: { to: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="text-sm font-semibold text-[color:var(--gold)] hover:underline inline-flex items-center gap-1"
        >
          {link.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
