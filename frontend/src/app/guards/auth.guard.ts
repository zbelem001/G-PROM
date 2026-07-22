import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { hasValidSession } from '../../session';

// Runs during SSR too, where localStorage doesn't exist — let the server
// render the shell and let the client-side check below do the real gating.
export const authGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  if (hasValidSession()) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/connexion');
};
