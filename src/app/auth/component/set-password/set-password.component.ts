import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
})
export class SetPasswordComponent implements OnInit {
  token!: string;
  password: string = '';
  selectedLanguage = 'en';
languageCodes = ['en', 'de'];
  languages:any = {
    en: 'English',
    de: 'German',
  };
  confirmPassword: string = '';
  passwordMismatchError: string = ''; // New variable to hold password mismatch error message
  constructor(
    private auth: AuthService,
    private router: ActivatedRoute,
    private route: Router,
    private aRoute: ActivatedRoute,
    private toastr: ToastrService,
    public translate:TranslateService
  ) {
    let lang=localStorage.getItem('lang')||'en'
    translate.use(lang);
  }
  public showPassword: boolean = false;
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  ngOnInit(): void {
    this.token = this.aRoute.snapshot.queryParams['token'];
  }
  setPassword(): void {
    if (this.password == '' || this.confirmPassword == '') {
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.ENTER_ALL_FIELDS'));
      return;
    }
    let validatePass = this.validatePassword(this.password);
    let _id = this.router.snapshot.params['id'];
    console.log(validatePass);
    if (this.password == this.confirmPassword) {
      if (validatePass) {
        let data = {
          password: this.confirmPassword,
          token: this.token,
        };
        //  console.log('Password set successfully');
        this.auth.setPassword(data).subscribe({
          next: (response) => {
            console.log('API Response:', response);
            if (response.statusCode == 200) {
              // alert("Password set successful");
              this.toastr.success(this.translate.instant('TOASTER_RESPONSE.PASSWORD_UPDATE_SUCCESS'));
              this.route.navigate(['/', 'auth', 'login']);
            } 
          },
          error: (error: HttpErrorResponse) => {
            console.error('API Error:', error);
            if (error.error.message=="Token is required.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SENDING_EMAIL_TOKEN_REQUIRED'));
            } 
            else if (error.error.message=="Password must be at least 8 characters long.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_PASSWORD_LENGTH_ERROR'));
            } 
            else if (error.error.message=="Please enter valid password.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_PASSWORD'));
            } 
            else if (error.error.message=="Your session has expired. Please log in again.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SESSION_EXPIRED'));
            } 
            else if (error.error.message=="An error occurred while updating. Please try again later.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UPDATE_ERROR'));
            } 
            else {
              this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
            }
          },
        });
      } else {
        this.toastr.error(this.translate.instant('TOASTER_RESPONSE.PASSWORD_VALIDATION_ERROR'));
      }
    } else {
      this.passwordMismatchError = 'Password does not match. Please try again.';
      // alert(this.passwordMismatchError);
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.PASSWORD_NOT_MATCH'));
      return;

      // alert("Password Should Be At Least Of Minimun 8 Character, Must Contain Number And Alphabets")
    }
  }

  validatePassword(password: string): boolean {
    // Customize your password validation criteria
    const minLength = 8;
    const containsLettersAndNumbers =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    return (
      password.length >= minLength && containsLettersAndNumbers.test(password)
    );
  }
}
