import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
  showMenu = false;
  activeMenu!: string; // Use localStorage for persistence
  ifSuperUser: boolean = false;
  constructor(
    private route: Router,
    private toastr: ToastrService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    let user = localStorage.getItem('user');
    if (user == 'super-admin') {
      this.activeMenu = 'super-admin-dashboard';
      this.ifSuperUser = true;
    } else if (user == 'admin') {
      this.activeMenu = 'import-file';
      this.ifSuperUser = false;
    }
  }
  goToRoute(name: string) {
    this.activeMenu = name;
    localStorage.setItem('activeMenu', name);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logOut() {
    // Clear token and any other related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('activeMenu');
    localStorage.removeItem('user');
    // Redirect to login page
    this.route.navigate(['/auth/login']);

    // Show success message
    this.toastr.success(
      this.translate.instant('TOASTER_RESPONSE.LOGOUT_SUCCESS')
    );
  }
}
