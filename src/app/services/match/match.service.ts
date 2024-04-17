import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})

export class MatchService{
  constructor(private http:HttpClient, private toast :ToastrService) {}
  baseUrl:string = environment.baseUrl+'event';


}
