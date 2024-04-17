// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor(private http:HttpClient, private toastService :ToastrService) {}

    importExcel(data:any): Observable<any> {
      const loadingToast = this.toastService.info('','Verifying...', {
        disableTimeOut: true,
        closeButton: true,
        positionClass: 'toast-top-right'
      });
      return this.http.post<any>(`${environment.baseUrl}user/player-add-excel`, data) .pipe(
        finalize(() => {
          if (loadingToast) {
            this.toastService.clear(loadingToast.toastId);
          }
        })
      );
    }

}
