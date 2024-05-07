import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  showMenu = false;
  activeMenu: string = localStorage.getItem('activeMenu') || 'import-file'; // Use localStorage for persistence

  constructor(private route: Router,private toastr:ToastrService, public translate:TranslateService) { }

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
    // Clear token and any other related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem('activeMenu');

    // Redirect to login page
    this.route.navigate(['/auth/login']);

    // Show success message
    this.toastr.success(this.translate.instant('TOASTER_RESPONSE.LOGOUT_SUCCESS'));

  }
}
