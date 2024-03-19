import { Component,ViewChild,ElementRef,AfterViewInit, OnInit } from '@angular/core';
import { AngularEditorConfig, UploadResponse } from '@kolkov/angular-editor';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { environment } from 'src/environment/enviroment';
import { NewsUpdateService } from 'src/app/services/update.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-news-update',
  templateUrl: './news-update.component.html',
  styleUrls: ['./news-update.component.scss']
})
export class NewsUpdateComponent implements OnInit{
  @ViewChild('angularEditor') editor!: ElementRef;
  // content:any;
  // title:any
  newsContent = new FormGroup({
    content:new FormControl("",Validators.required),
    title:new FormControl("",Validators.required)
  })
  updateNews:boolean=false;
  newsId!:string;
  constructor(private http:HttpClient,private updateService:NewsUpdateService,private route:Router,private toastr:ToastrService) {}
   ngOnInit(): void {
    let data:any = this.updateService.news
    this.newsId=data._id
    if(this.newsId){
      console.log(data,"hii")
      this.updateNews=true
      this.newsContent.patchValue({
        content:data.content,
        title:data.title
      })
    }
  }


config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '20rem',
    maxHeight: '20rem',
    minWidth:'100%',
    width:'50rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    sanitize: false,
    toolbarPosition: 'top',
  };
  submitContent() {

if(this.newsContent.valid){
  console.log(this.newsContent.value);
  if(this.updateNews){
    this.http.patch(environment.baseUrl+'news/'+this.newsId,this.newsContent.value).subscribe((res:any)=>{
      if( res.statusCode==200){
        this.toastr.success(res.message)
        this.route.navigate(['/','dashboard','news-list'])
       }
    })
  }else{
    console.log("news adding")
    this.http.post(environment.baseUrl+'news',this.newsContent.value).subscribe((res:any)=>{
      console.log(res)
     if( res.statusCode==200){
      this.toastr.success("News added successfully")
      this.route.navigate(['/','dashboard','news-list'])
     }
    })
  }

}
}

}
