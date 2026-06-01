export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-accent/40 ${className}`}
      aria-hidden
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
