import { Injectable } from '@angular/core';
import { Observable, throwError, finalize, catchError, map } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment'; // Assuming correct file name
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NewsUpdateService {
  constructor(private toastService: ToastrService, private http: HttpClient) {}

  news: any[] = []; // Assuming news data structure is an array of any
  baseUrl = environment.baseUrl + 'news/';

  uploadNews(formData: FormData): Observable<HttpResponse<any>> {
    const url = `${this.baseUrl}upload`;

    return this.http.post<any>(url, formData)
      .pipe(
        finalize(() => {
          // Optional finalization logic, e.g., hiding a loading indicator
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error uploading file:', error);
          this.toastService.error('Error while uploading image');
          return throwError('Failed to upload file');
        }),
        map((data: any) => {
          console.log('Upload data:', data);
          const imageUrl = `${environment.baseUrl}${data.data.path}`;
          console.log('Image URL:', imageUrl);
          return new HttpResponse({
            body: { imageUrl },
            status: 200,
            statusText: 'OK',
          });
        })
      );
  }

  postNews(data:any):Observable<any> {
    return   this.http.post(this.baseUrl,data)
}
}
