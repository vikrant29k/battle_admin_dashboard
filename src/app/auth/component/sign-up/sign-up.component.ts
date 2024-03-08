import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  submit(): void {
    console.log('Form Data:', this.formData);
    // Create the data object with form values
    const data = {
      email: this.formData.email,
      companyNumber: this.formData.companyNumber,
      companyName: this.formData.companyName,
      name:this.formData.name
    };

    console.log(data);

    // Call the API
    this.http.post('http://192.168.29.234:8000/admin-register', data).subscribe(
      (response:any) => {
        console.log('API Response:', response);
        if(response.success== "Sign Up successfully!!"){
          alert(response.message);
        }

        // Handle success, e.g., show a success message
      },
      (error) => {
        console.error('API Error:', error);
        // Handle error, e.g., show an error message
      }
    );
  }
}
