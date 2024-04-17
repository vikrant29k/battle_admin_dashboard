import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss'],
})
export class MatchComponent implements OnInit {
  @ViewChild('matchName') matchNameInput!: ElementRef;
  selectedImgLogo: any = null;
  selectedImgBg: any = null;
  fileError: boolean = false;
  baseUrl = environment.baseUrl;
  updateBtn = false;
  matchIdForUpdate = '';

  matches: any = [];

  activeEventDialogData = {
    title: 'Delete Active Event',
    message: 'Are you sure you want to delete the active event?',
  };

  deleteEventDialogData = {
    title: 'Delete Event',
    message: 'Are you sure you want to delete this event?',
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getAllMatches();
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string,
    match: any
  ): void {
    const dialogRef = this.dialog.open(DialogAnimationsComponent, {
      width: '250px',
      enterAnimationDuration,
      data: match.isActive
        ? this.activeEventDialogData
        : this.deleteEventDialogData,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteMatch(match);
      }
    });
  }

  onFileSelectedLogo(event: any): void {
    this.selectedImgLogo = event.target.files[0];
    console.log(this.selectedImgLogo);
  }
  onFileSelectedBg(event: any): void {
    this.selectedImgBg = event.target.files[0];
    console.log(this.selectedImgBg);
  }

  onFileUpload(match: any) {
    // console.log('file type is', this.selectedImg.type);
    if (match) {
      // console.log('match', match);
      let data = new FormData();
      if (this.selectedImgLogo && this.selectedImgBg) {
        data.append('avatar', this.selectedImgLogo);
        data.append('bgAvatar', this.selectedImgBg);
      } else {
        this.toastr.error('Please select both the image');
        return;
      }

      data.append('eventName', match);
      this.http.post(`${environment.baseUrl}event`, data).subscribe({
        next: (response: any) => {
          // console.log('response =>>', response);
          if (response.statusCode == 200) {
            // console.log('API Response:', response);
            this.selectedImgLogo = null;
            this.selectedImgBg = null;
            this.matchNameInput.nativeElement.value = '';
            this.toastr.success(response.message);
            this.getAllMatches();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log('error', error);
          console.error('API Error:', error);
          if (!error.error.message) {
            this.toastr.error('error');
          } else {
            this.toastr.error(error.error.message);
          }
        },
      });
    } else {
      this.toastr.error('Enter Match Name');
    }
  }

  getAllMatches() {
    this.http.get(`${environment.baseUrl}event`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.matches = res.data;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log('error', error);
        this.toastr.error('error');
      },
    });
  }

  updateActiveMatch(match: any) {
    // console.log('match select ', match);
    const data = new FormData();
    data.append('isActive', 'true');
    this.http
      .patch(`${environment.baseUrl}event/${match._id}`, data)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // console.log('api res', res);
            this.toastr.success(res.message);
            this.getAllMatches();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log('error', error);
          this.toastr.error('error');
        },
      });
  }

  deleteMatch(match: any) {
    // console.log('delete match', match);
    this.http.delete(`${environment.baseUrl}event/${match._id}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          // console.log('api res', res);
          this.toastr.success(res.message);
          this.getAllMatches();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log('error', error);
        this.toastr.error('error');
      },
    });
  }

  updateMatchBtn(match: any) {
    console.log('update match btn', match);
    this.matchNameInput.nativeElement.value = match.eventName;
    this.selectedImgLogo = { name: match.avatar };
    this.selectedImgBg = { name: match.bgAvatar };
    this.updateBtn = true;
    this.matchIdForUpdate = match._id;
  }

  updateMatch(matchName: any) {
    let data = new FormData();
    data.append('eventName', matchName);
    if (this.selectedImgLogo.type !== undefined) {
      data.append('avatar', this.selectedImgLogo);
    }
    if (this.selectedImgBg.type !== undefined) {
      data.append('bgAvatar', this.selectedImgBg);
    }

    this.http
      .patch(`${environment.baseUrl}event/${this.matchIdForUpdate}`, data)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // console.log('api res', res);
            this.toastr.success(res.message);
            this.getAllMatches();

            this.matchNameInput.nativeElement.value = '';
            this.selectedImgLogo = null;
            this.selectedImgBg = null;
            this.updateBtn = false;
            this.matchIdForUpdate = '';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log('error', error);
          this.toastr.error('error');
        },
      });
  }
}
