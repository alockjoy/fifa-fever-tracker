import type {
  MatchesResponse,
  StandingsResponse,
  TeamsResponse,
} from "./types";

const BASE = "https://api.football-data.org/v4/competitions/WC";
const API_KEY =
  (import.meta.env.VITE_FOOTBALL_DATA_API_KEY as string | undefined) ?? "";

export class ApiKeyMissingError extends Error {
  constructor() {
    super("Missing VITE_FOOTBALL_DATA_API_KEY");
    this.name = "ApiKeyMissingError";
  }
}

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiRequestError";
  }
}

// Simple in-memory + sessionStorage 15-min cache
const TTL = 15 * 60 * 1000;
type CacheEntry<T> = { ts: number; data: T };
const memCache = new Map<string, CacheEntry<unknown>>();

function readCache<T>(key: string): T | null {
  const m = memCache.get(key) as CacheEntry<T> | undefined;
  if (m && Date.now() - m.ts < TTL) return m.data;
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry<T>;
        if (Date.now() - parsed.ts < TTL) {
          memCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function writeCache<T>(key: string, data: T) {
  const entry = { ts: Date.now(), data };
  memCache.set(key, entry);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      /* ignore quota */
    }
  }
}

async function request<T>(path: string): Promise<T> {
  if (!API_KEY) throw new ApiKeyMissingError();
  const cacheKey = `wc26:${path}`;
  const cached = readCache<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": API_KEY },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiRequestError(res.status, text || `Request failed: ${res.status}`);
  }
  const data = (await res.json()) as T;
  writeCache(cacheKey, data);
  return data;
}

export const footballApi = {
  matches: () => request<MatchesResponse>("/matches"),
  standings: () => request<StandingsResponse>("/standings"),
  teams: () => request<TeamsResponse>("/teams"),
};

export const isApiConfigured = () => Boolean(API_KEY);
