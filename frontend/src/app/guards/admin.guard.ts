import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  const router = inject(Router);
  const raw = window.localStorage.getItem('gprom_user');
  try {
    const user = raw ? JSON.parse(raw) : null;
    if (user?.role === 'admin') {
      return true;
    }
  } catch {
    // fall through to redirect
  }
  return router.parseUrl('/dashboard');
};
