import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    private http: HttpClient,
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
    if (this.LoginForm.valid) {
      this.auth.login(this.LoginForm.value).subscribe({
        next: (response: any) => {
          console.log('response =>>', response);
          if(response.statusCode==200){
            console.log('API Response:', response);
            this.toastr.success(response.message);
            localStorage.setItem('token', response.data);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log("error", error)
          if(error.error.statusCode==404){
            this.toastr.error("check your email")
          }
          else{
            // alert("Invalid Email or Password");
            this.toastr.error(error.error.message);
          }
          console.error('API Error:', error);
          // Handle error, e.g., show an error message
          if(!error.error.message){
          this.toastr.error('error while login');
        }
        },
      });
    } else {
      this.toastr.error('Please fill all fields');
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
}
