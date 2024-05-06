import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';



@Injectable({
  providedIn: 'root',
})
 export class AuthGuardService {

 constructor(
 public router: Router,
 ) { }

 canActivate(): boolean {
  const token = localStorage.getItem('token')
 if (token) {
   return true
 } else {
   this.router.navigate(['/login']);
   return false
   }
 }

 }

export const authGuardGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuardService).canActivate();
};
