import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endPoint, GETFILE } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class IfpsService {

  private apiUrl = `${endPoint}${GETFILE}`;

  constructor(private http: HttpClient) {}

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
