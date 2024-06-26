import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss'],
})
export class MatchComponent implements OnInit {
  @ViewChild('matchName') matchNameInput!: ElementRef;
  @ViewChild('themeColor') themeColor!: ElementRef;
  @ViewChild('uploadSection') uploadSection!: ElementRef;
  isActive: boolean = true;
  selectedImgLogo: any = null;
  selectedImgBg: any = null;
  fileError: boolean = false;
  baseUrl = environment.baseUrl;
  updateBtn = false;
  matchIdForUpdate = '';
  tableData: any[] = [];

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
    public dialog: MatDialog,
    public translate:TranslateService
  ) {
    this.activeEventDialogData.title = this.translate.instant('DELETE_ACTIVE_EVENT_DIALOG_BOX_POP_UP.TITLE')
    this.activeEventDialogData.message = this.translate.instant('DELETE_ACTIVE_EVENT_DIALOG_BOX_POP_UP.MESSAGE')
    this.deleteEventDialogData.title = this.translate.instant('DELETE_EVENT_DIALOG_BOX_POP_UP.TITLE')
    this.deleteEventDialogData.message = this.translate.instant('DELETE_EVENT_DIALOG_BOX_POP_UP.MESSAGE')
  }
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
  selectedImgBanner:any;
  selectedImgFlyer:any;
  onFileSelectedLogo(event: any): void {
    this.selectedImgLogo = event.target.files[0];
    // console.log(this.selectedImgLogo);
  }
  onFileSelectedBanner(event: any): void {
    this.selectedImgBanner = event.target.files[0];
    // console.log(this.selectedImgLogo);
  }
  onFileSelectedFlyer(event: any): void {
    this.selectedImgFlyer = event.target.files[0];
    // console.log(this.selectedImgLogo);
  }
  onFileSelectedBg(event: any): void {
    this.selectedImgBg = event.target.files[0];
    // console.log(this.selectedImgBg);
  }

  onFileUpload(match: any, color:string) {
    // console.log('file type is', this.selectedImg.type);
    this.isActive = true;
    if (match && color) {
      // console.log('match', match);
      let data = new FormData();
      if (this.selectedImgLogo && this.selectedImgBg && this.selectedImgBanner && this.selectedImgFlyer) {
        data.append('avatar', this.selectedImgLogo);
        data.append('bgAvatar', this.selectedImgBg);
        data.append('dashboardImage',this.selectedImgBanner)
        data.append('groundImage',this.selectedImgFlyer)
      } else {
        this.toastr.error(this.translate.instant('TOASTER_RESPONSE.IMAGE_SELECTION_ERROR'));
        return;
      }

      data.append('eventName', match);
      data.append('themeColor',color)
      this.http.post(`${environment.baseUrl}event`, data).subscribe({
        next: (response: any) => {
          // console.log('response =>>', response);
          if (response.statusCode == 200) {
            // console.log('API Response:', response);
            this.selectedImgLogo = null;
            this.selectedImgBg = null;
            this.selectedImgBanner=null;
            this.selectedImgFlyer=null
            this.matchNameInput.nativeElement.value = '';
            this.themeColor.nativeElement.value=''
            this.toastr.success(this.translate.instant('TOASTER_RESPONSE.EVENT_ADDED_SUCCESS'));
            this.getAllMatches();
          }
        },
        error: (error: HttpErrorResponse) => {
          // console.log('error', error);
          // console.error('API Error:', error);
          if (!error.error.message) {
            this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
          } else {
            // this.toastr.error(error.error.message);
            if (error.error.message=="Event name is required.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EVENT_NAME_REQUIRED'));
            }
            else if (error.error.message=="Event name must be a string.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EVENT_NAME_MUST_BE_STRING'));
            }
            else if (error.error.message=="Event name is aleardy exist.") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EVENT_NAME_ALREADY_EXIST'));
            }
            else if (error.error.message=="Unauthorized") {
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
            }
            else{
              this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
            }
          }
        },
      });
    } else {
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.MATCH_NAME_MISSING_ERROR'));
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
        // console.log('error', error);
        // this.toastr.error(error.error.message);
        if (error.error.message=="No event data found.") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EVENT_NAME_REQUIRED'));
        }
        else if(error.error.message=="Unauthorized"){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
        }
        else{
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
        }
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
            this.toastr.success(this.translate.instant('TOASTER_RESPONSE.EVENT_UPDATED_SUCCESS'));
            this.getAllMatches();
          }
        },
        error: (error: HttpErrorResponse) => {
          // console.log('error', error);
          // this.toastr.error(error.error.message);
          if (error.error.message=="Resource not found. Please check the ID and try again.") {
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_RESOURCE_NOT_FOUND'));
          }
          else if(error.error.message=="Unauthorized"){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
          }
          else{
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
          }
        },
      });
  }

  deleteMatch(match: any) {
    // console.log('delete match', match);
    this.http.delete(`${environment.baseUrl}event/${match._id}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          // console.log('api res', res);
          this.toastr.success(this.translate.instant("TOASTER_RESPONSE.EVENT_DELETED_SUCCESS"));
         // Clear the form details when the record is deleted
         this.selectedImgLogo = null;
            this.selectedImgBg = null;
            this.selectedImgBanner=null;
            this.selectedImgFlyer=null
            this.matchNameInput.nativeElement.value = '';
            this.themeColor.nativeElement.value=''
         this.updateBtn = false;
         this.matchIdForUpdate = '';
          this.getAllMatches();
        }
      },
      error: (error: HttpErrorResponse) => {
        // console.log('error', error);
        // this.toastr.error(error.error.message);
        if (error.error.message=="Resource not found. Please check the ID and try again.") {
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_RESOURCE_NOT_FOUND'));
        }
        else if(error.error.message=="Unauthorized"){
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED'));
        }
        else{
          this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SERVER'));
        }
      },
    });
  }

  updateMatchBtn(match: any) {
    console.log('update match btn', match);

    this.matchNameInput.nativeElement.value = match.eventName;
    this.themeColor.nativeElement.value =match.themeColor
    this.selectedImgLogo = { name: match.avatar };
    this.selectedImgBg = { name: match.bgAvatar };
    this.selectedImgBanner = {name: match.dashboardImage}
    this.selectedImgFlyer = {name: match.groundImage}
    this.updateBtn = true;
    this.matchIdForUpdate = match._id;
    if (this.uploadSection && this.uploadSection.nativeElement) {
      this.uploadSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }



  updateMatch(matchName: any, color:string) {

    let data = new FormData();
    data.append('eventName', matchName);
    data.append('themeColor',color)
    if (this.selectedImgLogo.type !== undefined) {
      data.append('avatar', this.selectedImgLogo);
    }
    if (this.selectedImgBg.type !== undefined) {
      data.append('bgAvatar', this.selectedImgBg);
    }
     if(this.selectedImgBanner.type !== undefined){
      data.append('dashboardImage',this.selectedImgBanner)

     }
     if(this.selectedImgFlyer !== undefined){
      data.append('groundImage',this.selectedImgFlyer)
     }

    this.http
      .patch(`${environment.baseUrl}event/${this.matchIdForUpdate}`, data)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // console.log('api res', res);
            this.toastr.success(this.translate.instant('TOASTER_RESPONSE.EVENT_UPDATED_SUCCESS'));
            this.getAllMatches();

            this.selectedImgLogo = null;
            this.selectedImgBg = null;
            this.selectedImgBanner=null;
            this.selectedImgFlyer=null
            this.matchNameInput.nativeElement.value = '';
            this.themeColor.nativeElement.value=''
            this.updateBtn = false;
            this.matchIdForUpdate = '';
          }
        },
        error: (error: HttpErrorResponse) => {
          // console.log('error', error);
          this.toastr.error(error.error.message);
        },
      });
  }
}
