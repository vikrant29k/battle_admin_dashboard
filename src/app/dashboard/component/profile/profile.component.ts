import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Route, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';
import { ChangepasswordService } from 'src/app/services/changepassword.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  @ViewChild('angularEditor') editor!: ElementRef;
  // content:any;
  // title:any
  newsContent = new FormGroup({
    content: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
  });

  profileForm! : FormGroup

  editBtn:boolean= true
  changePassword:boolean = false

  ngOnInit(): void {
    this.changepass.showOtherDiv.subscribe((res: any) => {
      this.showpassword = res;
    });
    this.profileForm = this.fb.group({
      userName:['', Validators.required],
      email:['', Validators.email],
      uid:[null,Validators.required],
      name:['', Validators.required]
    })
    
    this.getProfileDetails();
  }
  constructor(
    public dialog: MatDialog,
    public changepass: ChangepasswordService,
    private http: HttpClient,
    private fb:FormBuilder
  ) {}

  showOtherDiv: boolean = false;
  inputValue: string = '';
  showpassword = this.changepass.showOtherDiv;
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogAnimationsComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });

    this.changePassword = true
  }

  getProfileDetails() {
    this.http.get(`${environment.baseUrl}user/details`).subscribe({
      next: (res: any) => {
        console.log('api res', res);
        let formData = {
          userName:res.data.userName,
          email:res.data.email,
          uid:res.data.companyId.uid,
          name:res.data.companyId.name
        }
        this.profileForm.patchValue(formData)
        this.profileForm.disable()
      },
    });
  }

  editBtnClick(){
    this.profileForm.enable()
    this.profileForm.get('email')?.disable()
    this.editBtn = false
  }

  saveBtnClick(){
    this.profileForm.disable()
    this.editBtn = true
    alert("working on it")
  }
}
