import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
})
export class SetPasswordComponent implements OnInit {
  token!: string;
  password: string = '';
  confirmPassword: string = '';
  passwordMismatchError: string = ''; // New variable to hold password mismatch error message
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: ActivatedRoute,
    private route: Router,
    private aRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.token = this.aRoute.snapshot.queryParams['token'];
  }
  setPassword(): void {
    // Check if passwords match
    let validatePass = this.validatePassword(this.password);
    let _id = this.router.snapshot.params['id'];
    console.log(validatePass);
    if (validatePass) {
      if (this.password !== this.confirmPassword) {
        this.passwordMismatchError =
          'Passwords do not match. Please try again.';
        alert(this.passwordMismatchError);
        return;
      } else {
        this.passwordMismatchError = '';
      }
      let data = {
        password: this.confirmPassword,
        token: this.token,
      };
      //  console.log('Password set successfully');
      this.auth.setPassword(data).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          if (response.message == 'update successfully') {
            // alert("Password set successful");
            this.toastr.success('Password set successful');
            this.route.navigate(['/', 'auth', 'login']);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('API Error:', error);
          //    this.toastr.error(error.error.error)
        },
      });
    } else {
      // alert("Password Should Be At Least Of Minimun 8 Character, Must Contain Number And Alphabets")
      this.toastr.error(
        'Password Should Be At Least Of Minimun 8 Character, Must Contain Number And Alphabets'
      );
    }
  }

  validatePassword(password: string): boolean {
    // Customize your password validation criteria
    const minLength = 8;
    const containsLettersAndNumbers = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

    return (
      password.length >= minLength && containsLettersAndNumbers.test(password)
    );
  }
}
