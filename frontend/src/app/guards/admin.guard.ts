import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAdmin } from '../../session';

export const adminGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') return true;

  if (isAdmin()) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/dashboard');
};
