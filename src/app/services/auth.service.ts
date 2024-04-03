// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/enviroment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http:HttpClient) {}

  getUserIdFromToken(): string | null {              //Get the id from the token saved in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded:any = jwtDecode(token);
        return decoded._id;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }


    signUp(data: any): Observable<any> {
      return this.http.post(`${environment.baseUrl}user/admin-add`, data);
    }

    setPassword(data: any): Observable<any> {
      return this.http.patch(`${environment.baseUrl}user/admin-password`, data);
    }

    login(data:any): Observable<any>{
      return this.http.post(`${environment.baseUrl}user/signin`, data);
    }
  
    forgotPassword(data:any): Observable<any>{
      return this.http.post(`${environment.baseUrl}user/admin-forget-password`, data);
    }
}
