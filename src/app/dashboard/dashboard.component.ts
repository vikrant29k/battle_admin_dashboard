import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{


  constructor(public translate: TranslateService){
    let lang:any=localStorage.getItem('lang')
    console.log(lang,"asdwqerqwr")
    translate.use(lang);
  }
ngOnInit(): void {

}


}
