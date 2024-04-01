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
  selectedImg: File | null = null;
  fileError: boolean = false;
  baseUrl = environment.baseUrl;

  matches = [
    {
      _id: '660a568b2014fdbbccbdb020',
      matchName: 'updatej',
      matchAvatar: '1711968940477-img2.jpg',
      isActive: true,
      __v: 0,
    },
  ];

  constructor(private http: HttpClient, private toastr: ToastrService) {}
  ngOnInit(): void {
    this.getAllMatches();
  }

  onFileSelected(event: any): void {
    this.selectedImg = event.target.files[0];
    console.log(this.selectedImg);
  }

  onFileUpload(match: any) {
    if (match) {
      console.log('match', match);
      

      for (let i = 0; i < 100; i++) {
        let data = new FormData();
      if (this.selectedImg) {
        data.append('avatar', this.selectedImg);
      } else {
        this.toastr.info('Please select an Image');
        return;
      }
        data.append('matchName', match + i);

        this.http.post(`${environment.baseUrl}match`, data).subscribe({
          next: (response: any) => {
            console.log('response =>>', response);
            if (response.statusCode == 200) {
              console.log('API Response:', response);
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
      }
    } else {
      this.toastr.info('Enter Match Name');
    }
  }

  getAllMatches() {
    this.http.get(`${environment.baseUrl}match`).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('api res', res);
          this.matches = res.data;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log('error', error);
        this.toastr.error('error');
      },
    });
  }
}
