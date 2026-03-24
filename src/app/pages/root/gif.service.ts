import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GiphyResponse } from '../../interfaces/giphy.interfaces';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class GifService {

  private _http: HttpClient = inject(HttpClient);

  loadTrendingGifs(q?: string): Observable<GiphyResponse> {
    let params: any = {
      api_key: environment.giphyApiKey,
      limit: 20
      // limit: 1
    }

    if (q) params.q = q
    return this._http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/${q ? 'search' : 'trending'}`, {
      params
    })
  }
}
