import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

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
    private auth: AuthService
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
            console.log('response =>>', response);
            if (response.statusCode == 200) {
              console.log('API Response:', response);
              this.toastr.success(response.message);
              localStorage.setItem('token', response.data.token);
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error: HttpErrorResponse) => {
            console.log('error', error);
            if (error.error.message) {
              this.toastr.error(error.error.message);
            } else {
              // }
              console.error('API Error:', error);
              // Handle error, e.g., show an error message
              //   if(!error.error.message){
              this.toastr.error('error while login');
            }
          },
        });
      } else {
        this.toastr.error(
          'Password should have minimum 8 character, atleast one uppercase letter, one lowercase letter, one digit and one special character.'
        );
      }
    } else {
      this.toastr.error('Enter all fields');
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
