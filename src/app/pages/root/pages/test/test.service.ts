import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IEtpItem } from '../../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private _etpSubject = new BehaviorSubject<IEtpItem | null>(null);
  private _testStatus = new BehaviorSubject<boolean>(false);
  // etp$ = this._etpSubject.asObservable();
  constructor() { }

  get etp$() {
    return this._etpSubject.asObservable();
  }
  
  get current() {
    return this._etpSubject.value;
  }
  
  get currentStatus() {
    return this._testStatus.value;
  }
  
  setEtp(value: IEtpItem | null) {
    this._etpSubject.next(value);
  }

  reset() {
    this._etpSubject.next(null);
  }
  
  setStatus(status: boolean) {
    this._testStatus.next(status);
  }
}
