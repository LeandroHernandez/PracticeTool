import { Injectable } from '@angular/core';
import { 
   Auth,
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
   signInWithPopup,
   GoogleAuthProvider,
   signOut,
   authState,
   deleteUser,
   UserCredential,
   User 
  } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  googleAuth(): Promise<UserCredential> {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logOut(): Promise<void> {
    return signOut(this.auth);
  }

  delete(user: User) {
    return deleteUser(user);
  }

  userState(): Observable<User | null> {
    return authState(this.auth);
  }
}
