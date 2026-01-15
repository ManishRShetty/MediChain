import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endPoint, REQUESTS, Approve } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private apiUrl = `${endPoint}${REQUESTS}`;

  constructor(private http: HttpClient) {}

  getRequests(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  approveRequest(address: string): Observable<any> {
    const userData = { address };  // The data to be sent in the POST request

    // Send the POST request to approve the role request
    return this.http.post<any>(`${endPoint}${Approve}`, userData);
  }
}
