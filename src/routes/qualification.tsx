import { createFileRoute } from "@tanstack/react-router";
import { useStandings } from "@/hooks/useFootballData";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorState, EmptyState } from "@/components/States";
import {
  calculateBestThirdPlacedTeams,
  getGroupStandings,
  getWinnersAndRunnersUp,
  teamQualificationStatus,
} from "@/lib/bracketGenerator";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/qualification")({
  head: () => ({
    meta: [
      { title: "Qualification Tracker — FIFA World Cup 2026" },
      { name: "description", content: "Live qualification status for all 48 FIFA World Cup 2026 teams: confirmed qualifiers, fighting for a spot, and eliminated." },
    ],
  }),
  component: Page,
});

function TeamPill({ name, crest, group, position }: { name: string; crest?: string; group: string; position: number }) {
  return (
    <div className="glass rounded-lg p-3 flex items-center gap-3">
      {crest ? <img src={crest} alt="" className="h-8 w-8 object-contain" /> : <div className="h-8 w-8 rounded-full bg-accent" />}
      <div className="min-w-0">
        <div className="font-semibold text-sm truncate">{name}</div>
        <div className="text-xs text-muted-foreground">Group {group} · #{position}</div>
      </div>
    </div>
  );
}

function Page() {
  const { data, isLoading, error } = useStandings();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Qualification Tracker</h1>
        <p className="text-muted-foreground mt-2">24 group winners & runners-up + 8 best third-placed teams advance.</p>
      </header>

      {isLoading ? (
        <div className="grid gap-5">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState error={error} />
      ) : !data?.standings?.length ? (
        <EmptyState title="No qualification data yet" description="Once standings populate, qualification status will appear here." />
      ) : (() => {
        const standings = data.standings;
        const { winners, runnersUp } = getWinnersAndRunnersUp(standings);
        const bestThirds = calculateBestThirdPlacedTeams(standings, 8);
        const grouped = getGroupStandings(standings);

        const qualified = [
          ...Object.values(winners).filter(Boolean),
          ...Object.values(runnersUp).filter(Boolean),
        ];
        const possible: typeof bestThirds = [];
        const eliminated: typeof bestThirds = [];

        for (const g of Object.keys(grouped)) {
          for (const row of grouped[g]) {
            if (row.position <= 2) continue;
            const status = teamQualificationStatus(row, grouped[g]);
            const entry = { team: row.team, group: g, groupPosition: row.position, points: row.points, goalDifference: row.goalDifference, goalsFor: row.goalsFor };
            if (status === "ELIMINATED") eliminated.push(entry);
            else possible.push(entry);
          }
        }

        return (
          <div className="space-y-10">
            <Section
              icon={<CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" />}
              title="Qualified for Knockout"
              count={qualified.length}
              accent="success"
            >
              {qualified.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teams qualified yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {qualified.map((t) => t && <TeamPill key={t.team.id} name={t.team.shortName ?? t.team.name} crest={t.team.crest} group={t.group} position={t.groupPosition} />)}
                </div>
              )}
            </Section>

            <Section
              icon={<CheckCircle2 className="h-5 w-5 text-[color:var(--gold)]" />}
              title="Best Third-Placed Teams (Provisional)"
              count={bestThirds.length}
              accent="gold"
            >
              {bestThirds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No third-place data yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {bestThirds.map((t, i) => (
                    <div key={t.team.id} className="glass rounded-lg p-3 flex items-center gap-3">
                      <span className="font-display text-lg font-bold text-[color:var(--gold)] w-6">{i + 1}</span>
                      {t.team.crest && <img src={t.team.crest} alt="" className="h-8 w-8 object-contain" />}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{t.team.shortName ?? t.team.name}</div>
                        <div className="text-xs text-muted-foreground">Grp {t.group} · {t.points}p · GD {t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section
              icon={<AlertCircle className="h-5 w-5 text-[color:var(--warning)]" />}
              title="Still Fighting"
              count={possible.length}
              accent="warning"
            >
              {possible.length === 0 ? (
                <p className="text-sm text-muted-foreground">All scenarios resolved.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {possible.map((t) => <TeamPill key={t.team.id} name={t.team.shortName ?? t.team.name} crest={t.team.crest} group={t.group} position={t.groupPosition} />)}
                </div>
              )}
            </Section>

            <Section
              icon={<XCircle className="h-5 w-5 text-[color:var(--danger)]" />}
              title="Eliminated"
              count={eliminated.length}
              accent="danger"
            >
              {eliminated.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teams eliminated yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 opacity-60">
                  {eliminated.map((t) => <TeamPill key={t.team.id} name={t.team.shortName ?? t.team.name} crest={t.team.crest} group={t.group} position={t.groupPosition} />)}
                </div>
              )}
            </Section>
          </div>
        );
      })()}
    </div>
  );
}

function Section({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: number; accent: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <span className="text-sm text-muted-foreground">({count})</span>
      </div>
      {children}
    </section>
  );
}
