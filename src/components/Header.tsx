import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/groups", label: "Groups" },
  { to: "/qualification", label: "Qualification" },
  { to: "/bracket", label: "Bracket" },
  { to: "/teams", label: "Teams" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gradient-gold)] ring-gold">
            <Trophy className="h-5 w-5 text-[var(--gold-foreground)]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold tracking-tight">
              WC<span className="text-gradient-gold">2026</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Tracker</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent/40 data-[status=active]:text-foreground data-[status=active]:bg-accent/60"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Toggle menu"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent/40"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border px-4 py-2 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent/40 data-[status=active]:text-foreground data-[status=active]:bg-accent/60"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
