import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-hourly-excel-edit-form-dialog',
  templateUrl: './hourly-excel-edit-form-dialog.component.html',
  styleUrls: ['./hourly-excel-edit-form-dialog.component.scss'],
})
export class HourlyExcelEditFormDialogComponent implements OnInit {
  hourlyExcelFileLineForm!: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<HourlyExcelEditFormDialogComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.hourlyExcelFileLineForm = fb.group({
      'Company ID': ['', Validators.required],
      'Sales rep no.': ['', Validators.required],
      'Sales in LC': ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.hourlyExcelFileLineForm.patchValue(this.data);
  }

  onConfirm(): void {
    if (this.hourlyExcelFileLineForm.valid) {
      this.dialogRef.close(this.hourlyExcelFileLineForm.value);
      this.toastr.success('Update successfully')
    } else {
      console.error('enter all fields');
      this.toastr.error('Enter all required fields');
    }
  }
  

  onDismiss(): void {
    console.log('on dismiss');
    this.dialogRef.close(false);
  }
}
