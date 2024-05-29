import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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
    public translate:TranslateService,
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
      this.toastr.success(this.translate.instant('TOASTER_RESPONSE.UPDATE_SUCCESS'));

    } else {
      console.error('enter all fields');
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.ENTER_ALL_FIELDS'));

    }
  }


  onDismiss(): void {
    // console.log('on dismiss');
    this.dialogRef.close(false);
  }
}
