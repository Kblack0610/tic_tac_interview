import { API_BASE_URL } from '../constants';

interface CreateScorePayload {
  result: 'win' | 'loss' | 'draw';
  difficulty: string;
  opponent: string;
  move_count: number;
  duration_ms: number;
}

interface Score {
  id: number;
  result: string;
  difficulty: string;
  opponent: string;
  move_count: number;
  duration_ms: number;
  created_at: string;
}

interface LeaderboardEntry {
  opponent: string;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
}

const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Fire-and-forget score submission. Returns null on any error. */
export async function postScore(payload: CreateScorePayload): Promise<Score | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Returns empty array on any error. */
export async function getScores(limit = 50): Promise<Score[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/scores?limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Returns empty array on any error. */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/scores/leaderboard`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
