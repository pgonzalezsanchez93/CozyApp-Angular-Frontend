import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../auth/services/auth-service.service';

export const UserDashboardGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userId = route.paramMap.get('userId');
  const user = authService.currentUser();

  if (userId === 'me' && user) {
    router.navigate(['/dashboard/user', user._id]);
    return false;
  }

  if (user) {
    if (user.roles.includes('admin') || user._id === userId) {
      return true;
    }
  }

  if (user) {
    router.navigate(['/dashboard/user', user._id]);
  } else {
    router.navigate(['/auth/login']);
  }

  return false;
};
