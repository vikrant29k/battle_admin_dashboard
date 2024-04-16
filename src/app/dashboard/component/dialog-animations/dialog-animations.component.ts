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
  title: string = 'Reset Password!!';
  message: string = 'Do you want to reset your password?';

  constructor(
    public dialogRef: MatDialogRef<DialogAnimationsComponent>,
    public changePasswordService: ChangepasswordService
  ) {}
  onConfirm(): void {
   this.changePasswordService.showOtherDiv.emit(false)
    this.dialogRef.close(true);
  }

  onDismiss(): void {

    this.dialogRef.close(false);
  }
}
