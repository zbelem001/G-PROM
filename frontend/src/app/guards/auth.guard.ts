import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Runs during SSR too, where localStorage doesn't exist — let the server
// render the shell and let the client-side check below do the real gating.
export const authGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  const router = inject(Router);
  const token = window.localStorage.getItem('gprom_token');
  if (token && isTokenValid(token)) {
    return true;
  }

  window.localStorage.removeItem('gprom_token');
  window.localStorage.removeItem('gprom_user');
  return router.parseUrl('/connexion');
};
