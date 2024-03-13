import { Component,ViewChild,ElementRef,AfterViewInit, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { HttpClient } from '@angular/common/http';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { environment } from 'src/environment/enviroment';
import { NewsUpdateService } from 'src/app/services/update.service';
import { Router } from '@angular/router';
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
  constructor(private http:HttpClient,private updateService:NewsUpdateService,private route:Router) {}
   ngOnInit(): void {
    let data:any = this.updateService.news
    this.newsId=data._id
    if(this.newsId){
      console.log(data,"hii")
      this.updateNews=true
      this.newsContent.patchValue({
        content:data.content,
        title:data.newsTitle
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
    this.http.put(environment.baseUrl+'update-news/'+this.newsId,this.newsContent.value).subscribe(res=>{
      // console.log(res)
    })
  }else{
    this.http.post(environment.baseUrl+'add-news',this.newsContent.value).subscribe((res:any)=>{
      // console.log(res)
     if( res.message=="News added succeefully"){
      this.route.navigate(['/','dashboard','news-list'])
     }
    })
  }

}
}

}
