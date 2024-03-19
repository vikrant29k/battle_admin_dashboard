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
      email: this.formData.email,
      companyNumber: this.formData.companyNumber,
      companyName: this.formData.companyName,
      userName:this.formData.name,
      role:"admin",
    };

    console.log(data);

    // Call the API
    this.auth.signUp(data).subscribe({
      next:(response:any)=>{
        console.log('API Response:', response);
          if(response.message== "please verify..."||response.message=="please check your mail for email verifiying..."){
            this.toastr.success(response.message)
            this.formData.name = ''
            this.formData.email = ''
            this.formData.companyNumber = 0
            this.formData.companyName=''
          } 
      },
      error:(error:HttpErrorResponse)=>{
        console.error('API Error:', error);
          // Handle error, e.g., show an error message
          this.toastr.error("error while signup")
      }
    }
    );
  }
  }
}
