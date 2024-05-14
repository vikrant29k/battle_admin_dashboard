import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
import { NewsUpdateService } from 'src/app/services/newsUpdate.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private updateService: NewsUpdateService,
    private route: Router,
    private toastr: ToastrService,
    public translate:TranslateService,
    private sanitizer:DomSanitizer,
  ) {}
  ngOnInit(): void {
    this.getListofNews();
  }
  listOfNews: any;

  getListofNews() {
    this.http.get(environment.baseUrl + 'news').subscribe(
      (res: any) => {
      this.listOfNews = res.data;
    },
    (error:HttpErrorResponse)=>{
      if(error.error.message=="Invalid news id"){
        this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_NEWS_ID'));
      }
      else if(error.error.message=="Unauthorized"){
        this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
      }
      else if(error.error.message=="Forbidden"){
        this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_FORBIDDEN'));
      }
      else if(error.error.message=="Something went wrong on the server."){
        this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SOMETHING_WENT_WRONG'));
      }
      else{
        this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
      }
    }
  );
  }
  getFormattedDate(timestamp: string): string {
    const date = new Date(timestamp);
    const options: any = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return date.toLocaleDateString('en-US', options); // Adjust locale and options as needed
  }
  deleteNews(id: any) {
    this.http.delete(environment.baseUrl + 'news/' + id).subscribe(
      (res: any) => {
        // console.log(res)
        if (res.success) {
          // location.reload()
          this.toastr.success(this.translate.instant('TOASTER_RESPONSE.NEWS_DELETED_SUCCESS'));
          this.getListofNews();
        }
      },
      (error: HttpErrorResponse) => {
        if(error.error.message=="Invalid news id"){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_NEWS_ID'));
        }
        else if(error.error.message=="Unauthorized"){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
        }
        else if(error.error.message=="Forbidden"){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_FORBIDDEN'));
        }
        else if(error.error.message=="Something went wrong on the server."){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SOMETHING_WENT_WRONG'));
        }
        else{
          this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
        }
        // console.log('error', error);
        // this.toastr.error(error.error.message);
      }
    );
  }
  updateNews(news: any) {
    console.log(news);
    this.updateService.news = news;
    if (news) {
      this.route.navigate(['/', 'news-update']);
    }
  }
  sanitizeHTML(content:string){
    return this.sanitizer.bypassSecurityTrustHtml(content)
  }
}
