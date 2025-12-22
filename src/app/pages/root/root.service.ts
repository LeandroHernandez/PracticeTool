import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class RootService {
  private _userS = new BehaviorSubject<IUser | null>(null);

  get user$(): Observable<IUser | null | any> {
    return this._userS.asObservable();
  }

  setUser(value: IUser | null) {
    return this._userS.next(value);
  }

  // constructor() { }
}
