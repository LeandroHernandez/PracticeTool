import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { from, map, switchMap, of } from 'rxjs';

export const canActivateWithRole = (allowedRoles: string[]) => {
    const auth = inject(Auth);
    const firestore = inject(Firestore);
    const router = inject(Router);

    return user(auth).pipe(
        switchMap(firebaseUser => {
            if (!firebaseUser) {
                router.navigate(['/landing-page']);
                return of(false);
            }

            const userRef = doc(firestore, 'users', firebaseUser.uid);
            return from(getDoc(userRef)).pipe(
                map(snapshot => {
                    if (!snapshot.exists()) {
                        router.navigate(['/landing-page']);
                        return false;
                    }

                    const userData = snapshot.data() as any;

                    // Verificar si el usuario está activo
                    if (!userData.state) {
                        router.navigate(['/landing-page']);
                        return false;
                    }

                    // Verificar si el rol está permitido
                    if (!allowedRoles.includes(userData.role)) {
                        router.navigate(['/unauthorized']);
                        return false;
                    }

                    return true;
                })
            );
        })
    );
};
