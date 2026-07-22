import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from './jwt-auth.guard';

// Must run after JwtAuthGuard (relies on request.user being already set).
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (user?.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs.');
    }
    return true;
  }
}
