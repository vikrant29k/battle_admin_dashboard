import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit{

  constructor(private http:HttpClient,private route:Router) {}
ngOnInit(): void {
    this.getListofNews()
}
  listOfNews:any
  getListofNews(){
    this.http.get(environment.baseUrl+'newsFeed/'+'campanyxyz').subscribe(res=>{
      this.listOfNews=res;
    })
  }
  getFormattedDate(timestamp: string): string {
    const date = new Date(timestamp);
    const options:any = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString('en-US', options); // Adjust locale and options as needed
  }
  deleteNews(id:any){
    this.http.delete(environment.baseUrl+'delete-news/'+id).subscribe(res=>{
      console.log(res)
    })
  }

}
