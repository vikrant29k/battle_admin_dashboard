import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Route, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';
import { ChangepasswordService } from 'src/app/services/changepassword.service';
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
  

  ngOnInit(): void {
    this.changepass.showOtherDiv.subscribe((res:any)=>{
      this.showpassword=res
    })
  }
  constructor(public dialog: MatDialog,public changepass:ChangepasswordService) {}
  showOtherDiv: boolean = false;
  inputValue: string='';
  showpassword=this.changepass.showOtherDiv
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DialogAnimationsComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
