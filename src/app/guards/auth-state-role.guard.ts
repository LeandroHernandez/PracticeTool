import { inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map, switchMap, of, from } from 'rxjs';
import { AuthService } from '../pages/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { localStorageLabels } from '../enums';
import { RootService } from '../pages/root';
// import { UsersService } from '../pages/root/pages/users';

export const canActivateAuthStateRole = (allowedRoles?: string[]) => {
    // devolvemos una función que Angular ejecutará DENTRO de un contexto de inyección
    return () => {
        const envInjector = inject(EnvironmentInjector);

        return runInInjectionContext(envInjector, () => {
            const firestore = inject(Firestore);
            const router = inject(Router);
            const authSvc = inject(AuthService);
            const rootSvc = inject(RootService);
            // const usersSvc = inject(UsersService);
            const nzNotificationSvc = inject(NzNotificationService);

            const fResponse = () => {
                rootSvc.setUser(null);
                return false
            }

            return authSvc.userState().pipe(
                switchMap((firebaseUser) => {
                    if (!firebaseUser) {
                        router.navigate(['/landing-page']);
                        authSvc.logOut();
                        return of(false);
                    }

                    return runInInjectionContext(envInjector, () => {

                        const usersRef = collection(firestore, 'users');
                        const q = query(usersRef, where('email', '==', firebaseUser.email));
                        const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) === 'en';

                        return from(getDocs(q)).pipe(
                            map((snapshot) => {
                                if (snapshot.empty) {
                                    nzNotificationSvc.error(
                                        en ? 'User not found' : 'Usuario no encontrado',
                                        en
                                            ? 'User not found in the database.'
                                            : 'Usuario no encontrado en la base de datos.'
                                    );
                                    router.navigate(['/landing-page']);
                                    authSvc.logOut();
                                    return fResponse();
                                }

                                const register = snapshot.docs[0];
                                const userData = { id: register.id, ...register.data() } as any;
                                if (!userData.state) {
                                    nzNotificationSvc.error(
                                        en ? 'User disabled' : 'Usuario deshabilitado',
                                        en
                                            ? 'Your user account is disabled. Please contact support.'
                                            : 'Su cuenta de usuario está deshabilitada. Por favor, contacte al soporte.'
                                    );
                                    router.navigate(['/landing-page']);
                                    authSvc.logOut();
                                    return fResponse();
                                }

                                const roleList = allowedRoles || [];
                                if (roleList.length > 0 && !roleList.includes(userData.role)) {
                                    nzNotificationSvc.error(
                                        en ? 'Access denied' : 'Acceso denegado',
                                        en
                                            ? 'You do not have permission to access this section.'
                                            : 'No tiene permiso para acceder a esta sección.'
                                    );
                                    router.navigate(['/dashboard']);
                                    return fResponse();
                                }

                                rootSvc.setUser(userData);
                                return true;
                            })
                        );
                    });
                })
            );
        });
    };
};
