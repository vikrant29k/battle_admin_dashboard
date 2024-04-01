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

  matches = [
    {
      _id: '660a568b2014fdbbccbdb020',
      matchName: 'updatej',
      matchAvatar: '1711968940477-img2.jpg',
      isActive: true,
      __v: 0,
    },
    {
      _id: '660a571a9b80db5d028de922',
      matchName: 'Football',
      matchAvatar: '1711953690693-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a5833666c3b6e3d02710f',
      matchName: 'Football',
      matchAvatar: '1711953971575-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a589151607f936562b43c',
      matchName: '5',
      matchAvatar: '1711954065962-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a59cfa0d6b1451eddbb96',
      matchName: 'cricket',
      matchAvatar: '1711954383572-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a5a00a0d6b1451eddbb99',
      matchName: '6666',
      matchAvatar: '1711954432309-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a5a22a0d6b1451eddbb9d',
      matchName: '66',
      matchAvatar: '1711954466606-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a5a9e8a38b270a615bfa3',
      matchName: '665',
      matchAvatar: '1711954590320-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a5b561d8b0747e9b004ce',
      matchName: 'test',
      matchAvatar: '1711954774733-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a5b7f1d8b0747e9b004d3',
      matchName: 'testtest',
      matchAvatar: '1711954815606-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a616afa7ce7fb670874a5',
      matchName: 'testtest2',
      matchAvatar: '1711956330288-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a91b0755da4bff1ea8ce1',
      matchName: 'football',
      matchAvatar: '1711968688298-football.jpg',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a959d47a3575d9a2c0631',
      matchName: 'pv',
      matchAvatar: '1711969693245-Screenshot (1).png',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a970c4bbb7e9f4aba4ea5',
      matchName: 'testtestwfwefwef',
      matchAvatar: '1711970060886-Screenshot (1).png',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a97154bbb7e9f4aba4ea9',
      matchName: 'testtestwfwefwefwfwef',
      matchAvatar: '1711970069760-Screenshot (1).png',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a97674bbb7e9f4aba4eae',
      matchName: 'rvefrfe',
      matchAvatar: '1711970151304-Screenshot (1).png',
      isActive: false,
      __v: 0,
    },
    {
      _id: '660a97884bbb7e9f4aba4eb1',
      matchName: 'wefwef',
      matchAvatar: '1711970184120-triangle down.png',
      isActive: false,
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
      let data = new FormData();
      if (this.selectedImg) {
        data.append('avatar', this.selectedImg);
      } else {
        this.toastr.info('Please select an Image');
        return;
      }

      data.append('matchName', match);
      this.http.post(`${environment.baseUrl}match`, data).subscribe({
        next: (response: any) => {
          console.log('response =>>', response);
          if (response.statusCode == 200) {
            console.log('API Response:', response);
            this.selectedImg = null;
            this.matchNameInput.nativeElement.value = '';
            this.toastr.success(response.message);
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
        this.toastr.error("error")
      },
    });
  }
}
