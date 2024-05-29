import { Component } from '@angular/core';
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
import { TranslateService } from '@ngx-translate/core';
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
    private translateService:TranslateService,
    private translate:TranslateService
  ) {
    let lang=localStorage.getItem('lang')
    if(lang){
      translate.use(lang);
    }else{
      translate.use('en');
    }
  }

  showOtherDiv: boolean = false;
  inputValue: string = '';
  changePasswordBtnDisabled: boolean = false;
  passwordDialogOpen: boolean = false;

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
    // this.editBtn = false;
  }

  getButtonLabel(): string {
    return this.editBtn ?  'PROFILE_PAGE.EDIT_BUTTON':'PROFILE_PAGE.SAVE_BUTTON' ;
  }

  getProfileDetails() {
    this.http.get(`${environment.baseUrl}user/details`).subscribe({
      next: (res: any) => {
        // console.log('api res', res);
        let formData = {
          userName: res.data?.userName,
          email: res.data?.email,
          uid: res.data?.companyId?.uid,
          name: res.data?.companyId?.name,
        };
        this.profileForm.patchValue(formData);
        this.profileForm.disable();
      },
      error:(error:HttpErrorResponse)=>{
        if (error.error.message=="Resource not found. Please check the ID and try again.") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_RESOURCE_NOT_FOUND'));
        }
        else if(error.error.message=="No user found."){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_NO_USER_FOUND'));
        }
        else if(error.error.message=="Unauthorized"){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
        }
        else{
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
        }
      }
    });
  }

  editBtnClick() {
    this.profileForm.enable();
    this.profileForm.get('email')?.disable();
    this.profileForm.get('uid')?.disable();
    this.profileForm.get('name')?.disable();
    this.editBtn = false;
    this.changePasswordBtnDisabled = true;
    this.changePassword = false;
  }




  saveBtnClick() {
    // this.editBtn = true;
    if (this.profileForm.valid) {
      if (!this.showpassword) {
        if (this.profileForm.get('newPassword')?.value) {
          let pswd = this.profileForm.get('newPassword')?.value;
          if (!this.validatePassword(pswd)) {
            this.toastr.error(this.translate.instant('TOASTER_RESPONSE.PASSWORD_VALIDATION_ERROR'));
            return;
          }
          // console.log('new /password', this.profileForm.get('newPassword'));
          let password = {
            password: this.profileForm.get('newPassword')?.value,
            token: localStorage.getItem('token'),
          };
          this.http
            .patch(`${environment.baseUrl}user/set-password`, password)
            .subscribe({
              next: (res: any) => {
                if (res.statusCode == 200) {
                  // console.log('password res', res);
                  this.profileUpdate();

                  // this.toastr.success("Password Updated Successfully")
                  this.router.navigate(['']);
                }
              },
              error: (error: HttpErrorResponse) => {
                // console.log(' api error', err);
                // this.toastr.error(err.error.message);
                if (error.error.message=="An error occurred while updating. Please try again later.") {
                  this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UPDATE_ERROR'));
                }
                else if(error.error.message=="Unauthorized"){
                  this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
                }
                else if(error.error.message=="User is not admin or Invalid user Id."){
                  this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_USER_NOT_ADMIN_OR_INVALID_USER_ID'));
                }
                else if(error.error.message=="userName is required."){
                  this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_USERNAME_REQUIRED'));
                }
                else if(error.error.message=="Resource not found. Please check the ID and try again."){
                  this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_RESOURCE_NOT_FOUND'));
                }
                else{
                  this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
                }
                return;
              },
            });
        } else {
          this.toastr.info( this.translate.instant('TOASTER_RESPONSE.NEW_PASSWORD_ENTRY_INFO'));
          return;
        }
      } else {
        this.profileUpdate();
      }
      this.changePasswordBtnDisabled = false;

    } else {
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.FILL_ALL_FIELDS_ERROR'));
    }
  }

  profileUpdate() {
    // console.log(this.profileForm.valid);
    if (this.profileForm.valid) {
      let data = this.profileForm.value;
      delete data.newPassword
      delete data.email;
      this.http.patch(`${environment.baseUrl}user/admin-update`, data).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            // console.log('api res', res);
            this.profileForm.disable();
            this.editBtn = true;
            this.getProfileDetails();
            this.toastr.success(this.translate.instant('TOASTER_RESPONSE.PROFILE_UPDATED_SUCCESS'));
            localStorage.clear()
          }
        },
        error: (error: HttpErrorResponse) => {
          // console.log(' api error', err);
          // this.toastr.error(err.error.message);
          if (error.error.message=="An error occurred while updating. Please try again later.") {
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UPDATE_ERROR'));
          }
          else if(error.error.message=="Unauthorized"){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
          }
          else if(error.error.message=="User is not admin or Invalid user Id."){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_USER_NOT_ADMIN_OR_INVALID_USER_ID'));
          }
          else if(error.error.message=="userName is required."){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_USERNAME_REQUIRED'));
          }
          else if(error.error.message=="Resource not found. Please check the ID and try again."){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_RESOURCE_NOT_FOUND'));
          }
          else{
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
          }
        },
      });
    } else {
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.FILL_ALL_FIELDS_ERROR'));
    }
  }

  validatePassword(password: string): boolean {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }
}
