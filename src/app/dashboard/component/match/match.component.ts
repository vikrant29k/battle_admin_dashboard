import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss'],
})
export class MatchComponent implements OnInit {
  @ViewChild('matchName') matchNameInput!: ElementRef;
  selectedImg: any = null;
  fileError: boolean = false;
  baseUrl = environment.baseUrl;
  updateBtn = false;
  matchIdForUpdate = '';

  matches: any = [];

  constructor(private http: HttpClient, private toastr: ToastrService) {}
  ngOnInit(): void {
    this.getAllMatches();
  }

  onFileSelected(event: any): void {
    this.selectedImg = event.target.files[0];
    console.log(this.selectedImg);
  }

  onFileUpload(match: any) {
    // console.log('file type is', this.selectedImg.type);
    if (match) {
      // console.log('match', match);
      let data = new FormData();
      if (this.selectedImg) {
        data.append('avatar', this.selectedImg);
      } else {
        this.toastr.error('Please select an Image');
        return;
      }

      data.append('matchName', match);
      this.http.post(`${environment.baseUrl}match`, data).subscribe({
        next: (response: any) => {
          // console.log('response =>>', response);
          if (response.statusCode == 200) {
            // console.log('API Response:', response);
            this.selectedImg = null;
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
    this.http.get(`${environment.baseUrl}match`).subscribe({
      next: (res: any) => {
        if (res.success) {
          // console.log('api res', res);
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
      .patch(`${environment.baseUrl}match/${match._id}`, data)
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
    this.http.delete(`${environment.baseUrl}match/${match._id}`).subscribe({
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
    this.matchNameInput.nativeElement.value = match.matchName;
    this.selectedImg = { name: match.matchAvatar };
    this.updateBtn = true;
    this.matchIdForUpdate = match._id;
  }

  updateMatch(matchName: any) {
    // console.log('file type is', this.selectedImg.type);
    // console.log('update match ', matchName);
    const data = new FormData();
    data.append('matchName', matchName);
    if (this.selectedImg?.type !== undefined) {
      data.append('avatar', this.selectedImg);
    }

    // if ('type' in this.selectedImg) {
    //   
    // }

    this.http
      .patch(`${environment.baseUrl}match/${this.matchIdForUpdate}`, data)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // console.log('api res', res);
            this.toastr.success(res.message);
            this.getAllMatches();

            this.matchNameInput.nativeElement.value = '';
            this.selectedImg = null;
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
