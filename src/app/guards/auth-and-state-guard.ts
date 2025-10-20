import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map, switchMap, of, from } from 'rxjs';
import { AuthService } from '../pages/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { localStorageLabels } from '../enums';

export const canActivateUserAndState = () => {
    // const auth = inject(Auth);
    const firestore = inject(Firestore);
    const router = inject(Router);

    const authSvc = inject(AuthService);
    const nzNotificationSvc = inject(NzNotificationService);

    // `user(auth)` devuelve un observable del usuario autenticado (o null)
    return authSvc.userState().pipe(
        switchMap((firebaseUser) => {
            if (!firebaseUser) {
                router.navigate(['/landing-page']);
                authSvc.logOut();
                return of(false);
            }

            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('email', '==', firebaseUser.email));

            const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) === 'en';

            return from(getDocs(q)).pipe(
                map((snapshot) => {
                    if (snapshot.empty) {
                        // No hay registro en la colección de usuarios
                        nzNotificationSvc.error(en ? 'User not found' : 'Usuario no encontrado', en ? 'User not found in the database.' : 'Usuario no encontrado en la base de datos.');
                        router.navigate(['/landing-page']);
                        authSvc.logOut();
                        return false;
                    }

                    const userData = snapshot.docs[0].data() as any;
                    if (!userData.state) {
                        // Usuario deshabilitado
                        nzNotificationSvc.error(en ? 'User disabled' : 'Usuario deshabilitado', en ? 'Your user account is disabled. Please contact support.' : 'Su cuenta de usuario está deshabilitada. Por favor, contacte al soporte.');
                        router.navigate(['/landing-page']);
                        authSvc.logOut();
                        return false;
                    }

                    // Todo correcto
                    return true;
                })
            );
        })
    );
};
