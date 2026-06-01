import { useEffect, useState } from "react";
import { countdownTo } from "@/lib/timeUtils";

export function CountdownTimer({ utc }: { utc: string }) {
  const [c, setC] = useState(() => countdownTo(utc));
  useEffect(() => {
    const i = setInterval(() => setC(countdownTo(utc)), 1000);
    return () => clearInterval(i);
  }, [utc]);

  const cell = (n: number, label: string) => (
    <div className="glass-strong rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center min-w-[64px] sm:min-w-[80px]">
      <div className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-gradient-gold">
        {String(n).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );

  if (c.done) {
    return (
      <div className="glass-strong rounded-lg px-4 py-3 text-center">
        <span className="font-display font-bold text-gradient-gold">Kick-off!</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-3">
      {cell(c.days, "Days")}
      {cell(c.hours, "Hours")}
      {cell(c.minutes, "Min")}
      {cell(c.seconds, "Sec")}
    </div>
  );
}
