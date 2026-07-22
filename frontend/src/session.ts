// Single source of truth for reading/writing the logged-in user's session.
// Used from both api.service.ts files, the route guards and any component
// that needs to know who's logged in — nothing else should touch
// localStorage's gprom_token / gprom_user keys directly.

export interface StoredUser {
  idutilisateur: number;
  nomutilisateur: string;
  email: string;
  prenom?: string | null;
  nom?: string | null;
  role?: string;
  statut?: string;
}

const TOKEN_KEY = 'gprom_token';
const USER_KEY = 'gprom_user';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function getToken(): string | null {
  if (!hasStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as StoredUser) : null;
  } catch {
    // corrupted value (manual edit, old format, partial write...) — treat as logged out
    return null;
  }
}

export function setSession(token: string, user: StoredUser): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    // malformed token — can't trust it
    return true;
  }
}

export function hasValidSession(): boolean {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    if (token) clearSession();
    return false;
  }
  return true;
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}
