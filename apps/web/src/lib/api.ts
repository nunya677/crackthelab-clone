import type {
  AuthUser,
  ChallengeDetail,
  ChallengeSummary,
  Instance,
  LeaderboardEntry,
  LessonDetail,
  LessonSummary,
  SubmitFlagResult,
} from '@crackthelab/shared';

const API_URL = import.meta.env.VITE_API_URL  

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

let refreshingPromise: Promise<boolean> | null = null;

// Access tokens are short-lived (see JWT_ACCESS_TTL); a request made after one
// expires would otherwise fail with a silent 401. Refresh once via the
// httpOnly cookie and retry, rather than surfacing a confusing failure for
// what the user experiences as a normal, valid session.
function tryRefresh(): Promise<boolean> {
  if (!refreshingPromise) {
    refreshingPromise = request<{ user: AuthUser; accessToken: string }>('/api/auth/refresh', {
      method: 'POST',
    })
      .then((data) => {
        setAccessToken(data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

async function request<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401 && !_retried && !path.startsWith('/api/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, true);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? 'Request failed');
  }
  return body as T;
}

export const api = {
  register: (input: { email: string; username: string; password: string }) =>
    request<{ user: AuthUser; accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request<{ user: AuthUser; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  refresh: () => request<{ user: AuthUser; accessToken: string }>('/api/auth/refresh', { method: 'POST' }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ user: AuthUser }>('/api/auth/me'),

  getChallenges: () => request<ChallengeSummary[]>('/api/challenges'),
  getChallenge: (slug: string) => request<ChallengeDetail>(`/api/challenges/${slug}`),
  submitFlag: (challengeId: string, flag: string) =>
    request<SubmitFlagResult>(`/api/challenges/${challengeId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ flag }),
    }),

  getLeaderboard: () => request<LeaderboardEntry[]>('/api/leaderboard'),

  getLessons: () => request<LessonSummary[]>('/api/lessons'),
  getLesson: (slug: string) => request<LessonDetail>(`/api/lessons/${slug}`),

  getMyInstances: () => request<Instance[]>('/api/instances/mine'),
  startInstance: (challengeId: string) =>
    request<Instance>('/api/instances', { method: 'POST', body: JSON.stringify({ challengeId }) }),
  stopInstance: (id: string) => request<Instance>(`/api/instances/${id}`, { method: 'DELETE' }),

  confirmSubscription: (subscriptionId: string) =>
    request<{ plan: 'FREE' | 'PRO'; planRenewsAt: string | null }>('/api/billing/confirm', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId }),
    }),
};

export { ApiError, API_URL };
