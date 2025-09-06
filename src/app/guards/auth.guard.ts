// import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../pages/auth/auth.service';
import { map, take } from 'rxjs';
import { RoutesApp } from '../constants';

// export const authGuard: CanActivateFn = (route, state) => {
export const authGuard: CanActivateChildFn = (route, state) => {
  console.log('AuthGuard');
  const auth = inject(Auth);
  const router = inject(Router);

  const authSvc = inject(AuthService);

  return authSvc.userState().pipe(
    take(1), // solo toma el primer valor
    map(user => {
      if (user) {
        return true; // ✅ Usuario autenticado → acceso permitido
      } else {
        router.navigate([`/${RoutesApp.landingPage}`]); // 🚫 Redirigir a la Landing Page
        return false;
      }
    })
  );

};
