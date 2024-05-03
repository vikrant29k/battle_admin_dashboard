import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-form-dialog',
  templateUrl: './edit-form-dialog.component.html',
  styleUrls: ['./edit-form-dialog.component.scss']
})
export class EditFormDialogComponent implements OnInit {
  excelFileLineForm!:FormGroup;
  constructor(
    public dialogRef: MatDialogRef<EditFormDialogComponent>,
    private fb:FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data:any,
    public translate:TranslateService
  ) {
    let lang= localStorage.getItem('lang');
    if(lang){
      translate.use(lang)
    }

    this.excelFileLineForm = fb.group({
      'Company No':['',Validators.required],
      'Company Name':['',Validators.required],
      'Company Unit (Region or Division...)':['',Validators.required],
      'Team name (ASM level)':['',Validators.required],
      'Company Target LC Total':['',Validators.required],
      'Target / Sales Rep LC':['',Validators.required],
      'Currency':['',Validators.required],
      'Sales rep No':['',Validators.required],
      'E-Mail':['',Validators.required],
      'Game-Leader (GL)':[''],
      'Battle Partner Team name (ASM level)':['',Validators.required],
      'Time zone (correlated to CET)':['',Validators.required],
      'Language ISO-639-1':['',Validators.required],
      'Battle Partner Company No':['',Validators.required],
      'Battle Partner Company Name':['',Validators.required],
    })
  }

  ngOnInit(): void {
    console.log("dialog data", this.data)
    // if(!this.data['Game-Leader (GL)']){
    //   this.excelFileLineForm.get('Game-Leader (GL)')?.disable()
    // }
    this.excelFileLineForm.patchValue(this.data)
  }

  onConfirm(): void {
    if(this.excelFileLineForm.valid){
      this.dialogRef.close(this.excelFileLineForm.value);
      this.toastr.success("Update successfully ")

    }else{
      console.error("enter all fields")
      this.toastr.error("Enter all required fields")
    }
  }

  onDismiss(): void {
    console.log("on dismiss")
    this.dialogRef.close(false);
  }
}
