import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map, switchMap, of, from } from 'rxjs';
import { AuthService } from '../pages/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { localStorageLabels, RoutesApp } from '../enums';
import { RootService } from '../pages/root';

export const subMenuGuard = (allowedRoles: string[]) => {
  // devolvemos una función que Angular ejecutará DENTRO de un contexto de inyección
  return () => {
    const envInjector = inject(EnvironmentInjector);

    return runInInjectionContext(envInjector, () => {
      // const firestore = inject(Firestore);
      const router = inject(Router);
      // const authSvc = inject(AuthService);
      const rootSvc = inject(RootService);
      const nzNotificationSvc = inject(NzNotificationService);

      const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) === 'en';

      const fResponse = () => {
        // rootSvc.setUser(null);
        nzNotificationSvc.error(
          en ? 'Access denied' : 'Acceso denegado',
          en
            ? 'You do not have permission to access this section.'
            : 'No tiene permiso para acceder a esta sección.'
        );
        const { url } = router;
        // console.log({ url });
        router.navigate([`/${RoutesApp.dashboard}`]);
        return false
      }

      return rootSvc.user$.pipe(
        map((userVal) => {
          // nzNotificationSvc.info(' Action ', ' Sub Menú ');
          if (!allowedRoles.includes(userVal.role)) {
            return fResponse();
          }
          return true;
        })
      )
    });
  };
};
