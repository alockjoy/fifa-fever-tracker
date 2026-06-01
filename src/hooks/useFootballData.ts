import { useQuery } from "@tanstack/react-query";
import { footballApi } from "@/lib/footballApi";

const FIFTEEN_MIN = 15 * 60 * 1000;

export function useMatches() {
  return useQuery({
    queryKey: ["wc26", "matches"],
    queryFn: footballApi.matches,
    staleTime: FIFTEEN_MIN,
    refetchInterval: FIFTEEN_MIN,
    retry: 1,
  });
}

export function useStandings() {
  return useQuery({
    queryKey: ["wc26", "standings"],
    queryFn: footballApi.standings,
    staleTime: FIFTEEN_MIN,
    refetchInterval: FIFTEEN_MIN,
    retry: 1,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ["wc26", "teams"],
    queryFn: footballApi.teams,
    staleTime: FIFTEEN_MIN,
    refetchInterval: FIFTEEN_MIN,
    retry: 1,
  });
}
