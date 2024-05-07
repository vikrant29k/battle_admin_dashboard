import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  email: string = '';
  spinner: boolean = false;

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private route: Router,
    public translate: TranslateService
  ) {}

  forgotBtnClick() {
    // alert(this.email)
    this.spinner = true
    if (!this.isValidEmail(this.email)) {

      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.ENTER_VALID_EMAIL'));

      this.spinner = false
      return;
    }
    this.auth.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.statusCode == 200) {
          this.toastr.success(response.message);
          this.spinner = false
          this.route.navigate(['']);
        } else {
          this.toastr.success(response.message);
          this.spinner = false
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('API Error:', error);
        this.spinner = false
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error(this.translate.instant('SERVER_ERROR'));
        }
      },
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}
