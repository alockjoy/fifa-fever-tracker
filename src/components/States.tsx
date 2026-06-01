import { AlertCircle, Inbox, KeyRound } from "lucide-react";
import { ApiKeyMissingError } from "@/lib/footballApi";

export function StateMessage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="glass rounded-xl p-8 text-center flex flex-col items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-accent/60 flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      )}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  if (error instanceof ApiKeyMissingError) {
    return (
      <StateMessage
        icon={<KeyRound className="h-5 w-5" />}
        title="API key not configured"
        description="Add VITE_FOOTBALL_DATA_API_KEY to your Workspace Build Secrets to load live World Cup 2026 data from Football-Data.org."
      />
    );
  }
  const msg =
    error instanceof Error ? error.message : "Something went wrong loading data.";
  return (
    <StateMessage
      icon={<AlertCircle className="h-5 w-5" />}
      title="Couldn't load data"
      description={msg}
    />
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <StateMessage icon={<Inbox className="h-5 w-5" />} title={title} description={description} />
  );
}
