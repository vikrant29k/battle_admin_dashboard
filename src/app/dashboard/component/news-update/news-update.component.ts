import { Component,ViewChild,ElementRef,AfterViewInit, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { HttpClient } from '@angular/common/http';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { environment } from 'src/environment/enviroment';
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

  constructor(private http:HttpClient) {}
   ngOnInit(): void {

  }


config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '20rem',
    maxHeight: '20rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    sanitize: false,
    toolbarPosition: 'top',

    // defaultFontName: 'Arial',
  };
  submitContent() {

if(this.newsContent.valid){
  console.log(this.newsContent.value);

  this.http.post(environment.baseUrl+'add-news',this.newsContent.value).subscribe(res=>{
    console.log(res)
  })
}
}

}
