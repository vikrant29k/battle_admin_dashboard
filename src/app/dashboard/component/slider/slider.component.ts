import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  showMenu = false;
  activeMenu: string = localStorage.getItem('activeMenu') || 'import-file'; // Use localStorage for persistence

  constructor(private route: Router,private toastr:ToastrService) { }

  goToRoute(name: string) {
    this.route.navigate(['/dashboard', name]);
    this.activeMenu = name;
    this.showMenu = false;
    localStorage.setItem('activeMenu', name);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem('activeMenu')
    this.route.navigate(['/auth/login']);
    this.toastr.success('Logout successfully')
  }
}
