import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Route, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';
import { ChangepasswordService } from 'src/app/services/changepassword.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {

  newsContent = new FormGroup({
    content: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
  });

  profileForm!: FormGroup;

  editBtn: boolean = true;
  changePassword: boolean = false;

  ngOnInit(): void {
    this.translateService.get(['RESET_PASSWORD.RESET_PASSWORD_TITLE', 'RESET_PASSWORD.RESET_PASSWORD_MESSAGE']).subscribe(translations => {
      this.dialogData.title = translations['RESET_PASSWORD.RESET_PASSWORD_TITLE'];
      this.dialogData.message = translations['RESET_PASSWORD.RESET_PASSWORD_MESSAGE'];
    });
    this.changepass.showOtherDiv.subscribe((res: any) => {
      this.showpassword = res;
    });
    this.profileForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', Validators.email],
      uid: [null, Validators.required],
      name: ['', Validators.required],
      newPassword: [''],
    });

    this.getProfileDetails();
  }
  constructor(
    public dialog: MatDialog,
    public changepass: ChangepasswordService,
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private translateService:TranslateService
  ) {}

  showOtherDiv: boolean = false;
  inputValue: string = '';
  showpassword = this.changepass.showOtherDiv;
  dialogData = {
    title: '',
    message: ''
  };
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogAnimationsComponent, {
      width: '250px',
      enterAnimationDuration,
      data:(this.dialogData),
      exitAnimationDuration,
    });

    this.changePassword = true;
  }

  getProfileDetails() {
    this.http.get(`${environment.baseUrl}user/details`).subscribe({
      next: (res: any) => {
        console.log('api res', res);
        let formData = {
          userName: res.data?.userName,
          email: res.data?.email,
          uid: res.data?.companyId?.uid,
          name: res.data?.companyId?.name,
        };
        this.profileForm.patchValue(formData);
        this.profileForm.disable();
      },
    });
  }

  editBtnClick() {
    this.profileForm.enable();
    this.profileForm.get('email')?.disable();
    this.profileForm.get('uid')?.disable();
    this.profileForm.get('name')?.disable();
    this.editBtn = false;
  }

  saveBtnClick() {
    if (this.profileForm.valid) {
      if (!this.showpassword) {
        if (this.profileForm.get('newPassword')?.value) {
          let pswd = this.profileForm.get('newPassword')?.value;
          if (!this.validatePassword(pswd)) {
            this.toastr.error(
              'Password should have minimum 8 character, atleast one uppercase letter, one lowercase letter, one digit and one special character.'
            );
            return;
          }
          console.log('new password', this.profileForm.get('newPassword'));
          let password = {
            password: this.profileForm.get('newPassword')?.value,
            token: localStorage.getItem('token'),
          };
          this.http
            .patch(`${environment.baseUrl}user/set-password`, password)
            .subscribe({
              next: (res: any) => {
                if (res.statusCode == 200) {
                  console.log('password res', res);
                  this.profileUpdate();
                  // this.toastr.success("Password Updated Successfully")
                  localStorage.clear()
                  this.router.navigate(['']);
                }
              },
              error: (err: HttpErrorResponse) => {
                console.log(' api error', err);
                this.toastr.error(err.error.message);
                return;
              },
            });
        } else {
          this.toastr.info('Enter New Password');
          return;
        }
      } else {
        this.profileUpdate();
      }
    } else {
      this.toastr.error('fill all fields');
    }
  }

  profileUpdate() {
    console.log(this.profileForm.valid);
    if (this.profileForm.valid) {
      let data = this.profileForm.value;
      delete data.newPassword
      delete data.email;
      this.http.patch(`${environment.baseUrl}user/admin-update`, data).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            console.log('api res', res);
            this.profileForm.disable();
            this.editBtn = true;
            this.getProfileDetails();
            this.toastr.success('Profile update successfully');
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(' api error', err);
          this.toastr.error(err.error.message);
        },
      });
    } else {
      this.toastr.error('fill all fields');
    }
  }

  validatePassword(password: string): boolean {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }
}
