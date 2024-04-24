import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  showMenu:boolean=false
  constructor(private route:Router,private toastr:ToastrService){

  }
  goToRoute(name:string){
    this.route.navigate(['/','dashboard',name]);
    this.showMenu = false
  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  logOut() {
    localStorage.removeItem("token")
    this.toastr.success("Logout successfully")
  }
}
