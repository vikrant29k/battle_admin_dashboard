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
          this.toastr.success(this.translate.instant('TOASTER_RESPONSE.PASSWORD_RESET_LINK_SENT_SUCCESS'));
          this.spinner = false
          this.route.navigate(['']);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('API Error:', error);
        this.spinner = false
        if (error.error.message=="This email is not associated with wuerth") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EMAIL_NOT_ASSOCIATED_WITH_WUERTH'));
        } 
        else if (error.error.message=="Email must be a string.") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EMAIL_MUST_BE_STRING'));
        } 
        else if (error.error.message=="Invalid email address.") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_EMAIL_ADDRESS'));
        } 
        else if (error.error.message=="Only Admin can forget password not player.") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_ONLY_ADMIN_FORGET_PASSWORD'));
        } 
        else if (error.error.message=="error occurred while sending email...") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SENDING_EMAIL'));
        } 
        else {
          this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
        }
      },
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}
