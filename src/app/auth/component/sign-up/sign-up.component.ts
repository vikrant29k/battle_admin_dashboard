import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  formData: any = {
    name:"",
    email: "",
    companyNumber: 0,
    companyName: ""
  };

  constructor(private http: HttpClient, private auth:AuthService, private toastr:ToastrService) {}

  ngOnInit(): void {}

  submit(): void {
    // console.log('Form Data:', this.formData);
    if(this.formData.name==""||this.formData.email==""||this.formData.companyNumber==undefined||this.formData.companyName==""){
      this.toastr.error("enter all fields")
    }
    else{
    // Create the data object with form values
    const data = {
      userName:this.formData.name,
      email: this.formData.email,
      uid: this.formData.companyNumber,
      name: this.formData.companyName,
    };

    console.log(data);

    // Call the API

    this.auth.signUp(data).subscribe({
      next:(response:any)=>{

        console.log('API Response:', response);
          if(response.success){
            this.toastr.success(response.message)
            this.formData.name = ''
            this.formData.email = ''
            this.formData.companyNumber = 0
            this.formData.companyName=''
          } 
      },
      error:(error:HttpErrorResponse)=>{
        console.error('API Error:', error);
          if(error.error.message){
          this.toastr.error(error.error.message)
        }
        else{
          this.toastr.error("server error")
        }
      }
    }
    );
  }
  }
}
