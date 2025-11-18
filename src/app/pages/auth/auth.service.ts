import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  Auth,
  updatePassword,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  authState,
  deleteUser,
  UserCredential,
  User,
  linkWithPopup
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { RootService } from '../root';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // constructor(private auth: Auth) {}
  private injector = inject(EnvironmentInjector);
  private auth = inject(Auth);

  private _rootSvc = inject(RootService);

  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  googleAuth(): Promise<UserCredential> {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }
  // googleAuth(u: User): Promise<UserCredential> {
  //   return linkWithPopup(u, new GoogleAuthProvider());
  // }

  logOut(): Promise<void> {
    this._rootSvc.setUser(null);
    return signOut(this.auth);
  }

  delete(user: User) {
    return deleteUser(user);
  }

  userState(): Observable<User | null> {
    // return authState(this.auth);
    return runInInjectionContext(this.injector, () => authState(this.auth));
  }

  changePassword(user: User, password: string): Promise<void> {
    return updatePassword(user, password);
  }
}
