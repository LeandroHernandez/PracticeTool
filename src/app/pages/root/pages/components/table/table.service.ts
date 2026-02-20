import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TableService {

    private _listSubject = new BehaviorSubject<Array<string> | null>(null);
    //   private _testStatus = new BehaviorSubject<boolean>(false);
    // list$ = this._listSubject.asObservable();
    constructor() { }

    get list$() {
        return this._listSubject.asObservable();
    }

    // get current() {
    //     return this._listSubject.value;
    // }

    //   get currentStatus() {
    //     return this._testStatus.value;
    //   }

    setlist(value: Array<string> | null) {
        this._listSubject.next(value);
    }

    reset() {
        this._listSubject.next(null);
    }

    //   setStatus(status: boolean) {
    //     this._testStatus.next(status);
    //   }
}
