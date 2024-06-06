import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  LoginForm!: FormGroup;
  active: boolean = false;
  inactive: boolean = false;
  passwordHidden: boolean = true;
  show: boolean = true;
  eyes: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService,
    public translate:TranslateService
  ) {}

  togglePasswordVisibility(): void {
    this.passwordHidden = !this.passwordHidden;
  }

  ngOnInit() {
    this.LoginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      password: ['', [Validators.required]],
      role: ['admin'],
    });
    this.show = true;
    this.eyes = false;
  }
  btn() {
    this.show = false;
    this.eyes = true;
  }
  eys() {
    this.eyes = false;
    this.show = true;
  }

  onSubmit() {
    let password = this.LoginForm?.get('password')?.value;
    let validatePass = this.validatePassword(String(password));
    if (this.LoginForm.valid) {
      if (validatePass) {
        this.auth.login(this.LoginForm.value).subscribe({
          next: (response: any) => {
            if (response.statusCode == 200) {
              this.toastr.success(this.translate.instant('TOASTER_RESPONSE.LOGIN_SUCCESS'));
              localStorage.setItem('token', response.data.token);

              if(response.data.superSuperUser){
                localStorage.setItem('user','super-admin')
                this.router.navigate(['/dashboard/super-admin-dashboard'])
              }else{
                localStorage.setItem('user','admin')
                this.router.navigate(['/dashboard']);
              }

            }
          },
          error: (error: HttpErrorResponse) => {
            console.log('error', error);
            if (error.error.message=="Please verify your email before proceeding.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EMAIL_VERIFICATION_REQUIRED'));
            }
            else if (error.error.message=="Invalid credentials ."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_CREDENTIALS'));
            }
            else if (error.error.message=="No matching data found. Please check your credentials and try again."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_NO_MATCHING_DATA_FOUND'));
            }
            else if (error.error.message=="Something went wrong on the server."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER_ERROR'));
            }
            else if (error.error.message=="Invalid email address."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_EMAIL_ADDRESS'));
            }
            else if (error.error.message=="role must be a string."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_ROLE_MUST_BE_STRING'));
            }
            else if (error.error.message=="role is required."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_ROLE_REQUIRED'));
            }
            else if (error.error.message=="Password must be at least 8 characters long."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_PASSWORD_LENGTH'));
            }
            else if (error.error.message=="Please enter valid password."){
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_PASSWORD'));
            }
             else {
              // }
              // console.error('API Error:', error);
              // Handle error, e.g., show an error message
              //   if(!error.error.message){
                this.toastr.error(this.translate.instant('TOASTER_RESPONSE.LOGIN_ERROR'));

            }
          },
        });
      } else {
        this.toastr.error(this.translate.instant('TOASTER_RESPONSE.PASSWORD_VALIDATION_ERROR'));

      }
    } else {
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.ENTER_ALL_FIELDS'));
    }
  }
  onInputBox(event: any) {
    const emailControl = this.LoginForm.get('email');
    const passwordControl = this.LoginForm.get('password');

    if (
      emailControl &&
      emailControl.valid &&
      passwordControl &&
      passwordControl.valid
    ) {
      this.active = true;
      this.inactive = false;
    } else {
      this.active = false;
      this.inactive = true;
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
