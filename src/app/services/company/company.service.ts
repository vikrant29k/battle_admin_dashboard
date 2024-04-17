// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/enviroment';
@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http:HttpClient) {}
    getAllCompany(): Observable<any> {
      return this.http.get(`${environment.baseUrl}company`);
    }
}
