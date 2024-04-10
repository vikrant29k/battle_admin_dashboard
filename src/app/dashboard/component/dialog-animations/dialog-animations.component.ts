import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfileComponent } from '../profile/profile.component';
import { ChangepasswordService } from 'src/app/services/changepassword.service';

@Component({
  selector: 'app-dialog-animations',
  templateUrl: './dialog-animations.component.html',
  styleUrls: ['./dialog-animations.component.scss'],
})
export class DialogAnimationsComponent {
  title: string = 'Password Reset ';
  message: string = 'Do You want to Reset Your Password';

  constructor(
    public dialogRef: MatDialogRef<DialogAnimationsComponent>,
    public changePasswordService: ChangepasswordService
  ) {}
  onConfirm(): void {
    this.changePasswordService.showOtherDiv.emit(false);
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
