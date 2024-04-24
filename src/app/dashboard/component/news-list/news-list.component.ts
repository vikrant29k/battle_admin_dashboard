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
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.getListofNews();
  }
  listOfNews: any;

  getListofNews() {
    this.http.get(environment.baseUrl + 'news').subscribe((res: any) => {
      this.listOfNews = res.data;
    });
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
          this.toastr.success('News deleted successfully');
          this.getListofNews();
        }
      },
      (error: HttpErrorResponse) => {
        console.log('error', error);
        this.toastr.error(error.error.message);
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
}
