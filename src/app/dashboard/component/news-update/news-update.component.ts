import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AngularEditorConfig, UploadResponse } from '@kolkov/angular-editor';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environment/enviroment';
import { NewsUpdateService } from 'src/app/services/update.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Observer, of, tap } from 'rxjs';
@Component({
  selector: 'app-news-update',
  templateUrl: './news-update.component.html',
  styleUrls: ['./news-update.component.scss'],
})
export class NewsUpdateComponent implements OnInit, OnDestroy {
  @ViewChild('angularEditor') editor!: ElementRef;
  // content:any;
  // title:any
  images: any[] = [];
  newsContent = new FormGroup({
    content: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
  });
  updateNews: boolean = false;
  newsId!: string;
  constructor(
    private http: HttpClient,
    private updateService: NewsUpdateService,
    private route: Router,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    let data: any = this.updateService.news;
    this.newsId = data._id;
    if (this.newsId) {
      console.log(data, 'hii');
      this.updateNews = true;
      this.newsContent.patchValue({
        content: data.content,
        title: data.title,
      });
    }
  }

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '20rem',
    maxHeight: '20rem',
    minWidth: '100%',
    width: '50rem',

    upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
      console.log('file is', file);
      return Observable.create(
        (observer: Observer<HttpEvent<UploadResponse>>) => {
          const maxDimension = 250; // Maximum width or height for the resized image

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const image = new Image();
          image.src = URL.createObjectURL(file);

          image.onload = () => {
            let width = image.width;
            let height = image.height;

            // Resize the image if either dimension is greater than the maximum
            if (width > maxDimension || height > maxDimension) {
              // Calculate the new dimensions while maintaining aspect ratio
              if (width > height) {
                height *= maxDimension / width;
                width = maxDimension;
              } else {
                width *= maxDimension / height;
                height = maxDimension;
              }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas with new dimensions
            ctx?.drawImage(image, 0, 0, width, height);

            // Convert canvas content to Blob
            canvas.toBlob((blob) => {
              if (!blob) {
                observer.error('Failed to resize image');
                return;
              }

              // Create FormData and append resized image
              const formData = new FormData();
              formData.append('file', blob, file.name);

              // Upload resized image
              fetch(`${environment.baseUrl}news/upload`, {
                method: 'POST',
                body: formData,
              })
                .then((response) => {
                  if (!response.ok) {
                    this.toastr.error("error while upload image")
                    throw new Error('Failed to upload file');
                  }
                  return response.json() as Promise<UploadResponse>;
                })
                .then((data: any) => {
                  console.log('data', data);
                  this.images.push(data);
                  let imageUrl = `${environment.baseUrl}${data.data.path}`;
                  console.log('data', imageUrl);
                  const httpResponse: HttpResponse<UploadResponse> =
                    new HttpResponse({
                      body: { imageUrl },
                      status: 200,
                      statusText: 'OK',
                      // headers: null
                    });
                  // Emit the HttpResponse
                  observer.next(httpResponse);
                  observer.complete();
                })
                .catch((error) => {
                  console.error('Error uploading file:', error);
                  observer.error('Failed to upload file');
                });
            }, file.type);
          };
        }
      );
    },

    // upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
    //   console.log("file is",file)
    //   return Observable.create((observer: Observer<HttpEvent<UploadResponse>>) => {

    //     const formData = new FormData();
    //     formData.append('file', file);

    //     fetch(`${environment.baseUrl}news/upload`, {
    //       method: 'POST',
    //       body: formData
    //     })
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error('Failed to upload file');
    //       }
    //       return response.json() as Promise<UploadResponse>;
    //     })
    //     .then((data:any) => {
    //       console.log("data", data)
    //       this.images.push(data)
    //       let imageUrl = `${environment.baseUrl}${data.data.path}`
    //       console.log("data", imageUrl)
    //       const httpResponse: HttpResponse<UploadResponse> = new HttpResponse({
    //         body: {imageUrl},
    //         status: 200,
    //         statusText: 'OK',
    //         // headers: null
    //       });
    //       // Emit the HttpResponse
    //       observer.next(httpResponse);
    //       observer.complete();
    //     })
    //     .catch(error => {
    //       console.error('Error uploading file:', error);
    //       observer.error('Failed to upload file');
    //     });
    //   });
    // },

    // upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
    //   return Observable.create((observer: Observer<HttpEvent<UploadResponse>>) => {
    //     // Simulate file upload
    //     setTimeout(() => {
    //       // Mock response data
    //       const mockResponse: UploadResponse = {
    //         imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYOWWq-AMr45F3MB_tDje4CkiDlx_dqavqaEe2f4SSKhOhYQSuAyHpsWYWl_nt_gAbekc&usqp=CAU' // Sample image URL
    //       };
    //       // Create an HttpResponse object with the mock response data
    //       const httpResponse: HttpResponse<UploadResponse> = new HttpResponse({
    //         body: mockResponse,
    //         status: 200, // Set the status code
    //         statusText: 'OK', // Set the status text
    //         // headers: null // You can set custom headers if needed
    //       });
    //       // Emit the HttpResponse
    //       observer.next(httpResponse);
    //       observer.complete();
    //     }, 1000); // Simulate delay for testing
    //   });
    // },
    placeholder: 'Enter text here...',
    translate: 'no',
    sanitize: false,
    toolbarPosition: 'top',
  };
  submitContent() {
    if (this.newsContent.valid) {
      console.log(this.newsContent.value);
      if (this.updateNews) {
        this.http
          .patch(
            environment.baseUrl + 'news/' + this.newsId,
            this.newsContent.value
          )
          .subscribe(
            (res: any) => {
              if (res.statusCode == 200) {
                this.toastr.success(res.message);

                this.route.navigate(['/', 'dashboard', 'news-list']);
              }
            },
            (error: HttpErrorResponse) => {
              console.log('error in api ', error);
              this.toastr.error(error.error.message);
            }
          );
      } else {
        console.log('news adding', this.images);
        this.http
          .post(environment.baseUrl + 'news', this.newsContent.value)
          .subscribe(
            (res: any) => {
              console.log(res);
              if (res.statusCode == 200) {
                this.toastr.success('News added successfully');
                this.route.navigate(['/', 'dashboard', 'news-list']);
              }
            },
            (error: HttpErrorResponse) => {
              console.log('error in api', error);
              this.toastr.error(error.error.message);
            }
          );
      }
    } else {
      this.toastr.error('Enter All Fields');
    }
  }

  ngOnDestroy(): void {
    this.updateService.news = [];
  }
}
