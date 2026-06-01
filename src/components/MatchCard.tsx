import type { ApiMatch } from "@/lib/types";
import { formatBdDate, formatBdTime } from "@/lib/timeUtils";

interface Props {
  match: ApiMatch;
  variant?: "default" | "compact";
}

function TeamCrest({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
        {alt.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  return <img src={src} alt={alt} className="h-10 w-10 object-contain" loading="lazy" />;
}

export function MatchCard({ match, variant = "default" }: Props) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const home = match.homeTeam;
  const away = match.awayTeam;
  const hs = match.score.fullTime.home;
  const as = match.score.fullTime.away;

  return (
    <div className="glass rounded-xl p-4 transition-all hover:ring-glow hover:border-primary/40">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatBdDate(match.utcDate)}</span>
          <span>·</span>
          <span>{formatBdTime(match.utcDate)} BD</span>
        </div>
        <StatusBadge status={match.status} live={isLive} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <TeamCrest src={home.crest} alt={home.tla ?? home.name} />
          <span className="font-semibold truncate">{home.shortName ?? home.name}</span>
        </div>

        <div className="px-3 py-1.5 rounded-lg glass-strong text-center min-w-[64px]">
          {isFinished || isLive ? (
            <span className="font-display text-lg font-bold tabular-nums">
              {hs ?? 0} <span className="text-muted-foreground">:</span> {as ?? 0}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-wider text-muted-foreground">vs</span>
          )}
        </div>

        <div className="flex items-center gap-3 min-w-0 justify-end text-right">
          <span className="font-semibold truncate">{away.shortName ?? away.name}</span>
          <TeamCrest src={away.crest} alt={away.tla ?? away.name} />
        </div>
      </div>

      {variant === "default" && match.group && (
        <div className="mt-3 text-xs text-muted-foreground">
          {match.group.replace(/_/g, " ")} · {match.stage.replace(/_/g, " ")}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, live }: { status: string; live: boolean }) {
  if (live) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-danger/20 text-[color:var(--danger)] text-[10px] font-bold uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> Live
      </span>
    );
  }
  if (status === "FINISHED") {
    return (
      <span className="px-2 py-0.5 rounded-full bg-success/20 text-[color:var(--success)] text-[10px] font-bold uppercase tracking-wider">
        Final
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-accent/60 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
      {status.replace(/_/g, " ")}
    </span>
  );
}
