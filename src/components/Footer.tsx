export function Footer() {
  return (
    <footer className="mt-16 border-t border-border glass">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
        <p className="font-display">
          <span className="text-foreground font-semibold">FIFA World Cup 2026</span> Tracker
        </p>
        <p>
          Data by{" "}
          <a
            href="https://www.football-data.org/"
            target="_blank"
            rel="noreferrer"
            className="text-gradient-gold font-semibold hover:underline"
          >
            Football-Data.org
          </a>
        </p>
        <p>© {new Date().getFullYear()} · All rights reserved</p>
      </div>
    </footer>
  );
}
