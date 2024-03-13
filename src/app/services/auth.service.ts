// auth.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

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
}
