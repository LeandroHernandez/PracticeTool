// import { inject, Injectable } from '@angular/core';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../../interfaces';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../enviroments/enviroment';
// import type { GiphyResponse } from '../../interfaces/giphy.interfaces';

@Injectable({
  providedIn: 'root'
})
export class RootService {
  private _userS = new BehaviorSubject<IUser | null>(null);

  // private _http: HttpClient = inject(HttpClient);

  get user$(): Observable<IUser | null | any> {
    return this._userS.asObservable();
  }

  setUser(value: IUser | null) {
    return this._userS.next(value);
  }

  // loadTrendingGifs(q?: string): Observable<GiphyResponse> {
  //   let params: any = {
  //     api_key: environment.giphyApiKey,
  //     limit: 20
  //     // limit: 1
  //   }

  //   if (q) params.q = q
  //   return this._http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/${q ? 'search' : 'trending'}`, {
  //     params
  //   })
  // }

  // constructor() { }
}
