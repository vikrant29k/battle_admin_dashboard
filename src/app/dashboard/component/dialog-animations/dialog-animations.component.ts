import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileComponent } from '../profile/profile.component';
import { ChangepasswordService } from 'src/app/services/changepassword.service';

@Component({
  selector: 'app-dialog-animations',
  templateUrl: './dialog-animations.component.html',
  styleUrls: ['./dialog-animations.component.scss'],
})
export class DialogAnimationsComponent implements OnInit {
  title: string = '';
  message: string = '';

  constructor(
    public dialogRef: MatDialogRef<DialogAnimationsComponent>,
    public changePasswordService: ChangepasswordService,
    @Inject(MAT_DIALOG_DATA) public data:any
  ) {}

  ngOnInit(): void {
    console.log("dialog data", this.data)
    this.title = this.data.title
    this.message = this.data.message
  }

  onConfirm(): void {
    this.changePasswordService.showOtherDiv.emit(false);
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
