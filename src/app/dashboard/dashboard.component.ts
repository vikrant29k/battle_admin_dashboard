import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{
  constructor(private route:Router){}
ngOnInit(): void {
  throw new Error('Method not implemented.');
}
profile(event:any) {
  this.route.navigate(['/profile']);
}
  // showMenu = true; // Initialize menu state to open

}
