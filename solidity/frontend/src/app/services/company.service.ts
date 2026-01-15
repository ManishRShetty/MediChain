import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endPoint, companyName } from '../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${endPoint}${companyName}`;
  private product = `${endPoint}${companyName}`;

  constructor(private http: HttpClient) {}

  getCompanyName(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getCompanyProductName(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  
}
