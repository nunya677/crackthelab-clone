import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '@crackthelab/shared';
import { api, setAccessToken } from '../lib/api';
import { connectSocket } from '../lib/socket';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Access tokens expire after JWT_ACCESS_TTL (15m). Endpoints behind
// requireAuth get a reactive retry-on-401 in lib/api.ts, but endpoints with
// optionalAuth (e.g. /api/challenges, so anonymous browsing still works)
// never return 401 for a stale token — they just silently answer as an
// anonymous user, which made solved/points look reset even though nothing
// was actually lost. Proactively refreshing in the background avoids ever
// hitting that silent-degradation window.
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function silentRefresh() {
      return api
        .refresh()
        .then(({ user, accessToken }) => {
          if (cancelled) return;
          setAccessToken(accessToken);
          setUser(user);
          connectSocket(accessToken);
        })
        .catch(() => {
          if (cancelled) return;
          connectSocket(null);
        });
    }

    // Silently exchange the httpOnly refresh cookie (if any) for a fresh
    // access token on first load, so a page refresh doesn't log you out.
    silentRefresh().finally(() => {
      if (!cancelled) setLoading(false);
    });

    const interval = setInterval(silentRefresh, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function login(email: string, password: string) {
    const { user, accessToken } = await api.login({ email, password });
    setAccessToken(accessToken);
    setUser(user);
    connectSocket(accessToken);
  }

  async function register(email: string, username: string, password: string) {
    const { user, accessToken } = await api.register({ email, username, password });
    setAccessToken(accessToken);
    setUser(user);
    connectSocket(accessToken);
  }

  async function logout() {
    await api.logout();
    setAccessToken(null);
    setUser(null);
    connectSocket(null);
  }

  // Re-pulls the user object from the server — used after a subscription
  // upgrade so the new `plan` shows up without forcing a full page reload.
  async function refreshUser() {
    const { user, accessToken } = await api.refresh();
    setAccessToken(accessToken);
    setUser(user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
