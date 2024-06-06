// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http:HttpClient, private toster:ToastrService, public translate: TranslateService) {}

  signUp(data: any): Observable<any> {
      const loadingToast = this.toster.info('',this.translate.instant('TOASTER_RESPONSE.VERIFYING'), {
        disableTimeOut: true,
        closeButton: true,
        positionClass: 'toast-top-right'
      });
      return this.http.post<any>(`${environment.baseUrl}user/admin-add`, data) .pipe(
        finalize(() => {
          if (loadingToast) {
            this.toster.clear(loadingToast.toastId);
          }
        })
      );
    }

    setPassword(data: any): Observable<any> {
      return this.http.patch(`${environment.baseUrl}user/set-password`, data);
    }

    login(data:any): Observable<any>{
      return this.http.post(`${environment.baseUrl}user/signin`, data);
    }

    forgotPassword(data:any): Observable<any>{
      return this.http.post(`${environment.baseUrl}user/admin-forget-password`, data);
    }
}
