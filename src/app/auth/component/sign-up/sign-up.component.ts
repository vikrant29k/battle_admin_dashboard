import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company/company.service';
interface Company {
  uid: number;
  name: string;
}
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  companyData:any[]=[]

  filteredCompanies: Company[] = [];
  filteredCompaniesName: Company[] = [];
  filterCompanies(event: any) {
    const searchTerm = event.target.value;

    if (!searchTerm) {
      this.filteredCompanies = this.companyData;
      return;
    }
    this.filteredCompanies = this.companyData.filter(
      (company) => company.uid.toString().includes(searchTerm)
    );
  }
  filterCompaniesName(event: any) {
    const searchTerm = event.target.value;

    if (!searchTerm) {
      this.filteredCompaniesName = this.companyData;
      return;
    }

    this.filteredCompaniesName = this.companyData.filter(
      (company) => company.name.toString().includes(searchTerm)
    );
  }
  formData: any = {
    name: '',
    email: '',
    companyNumber: null,
    companyName: '',
  };

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toastr: ToastrService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.companyService.getAllCompany().subscribe((res:any)=>{
      // console.log(res)
      this.companyData=res.data
      this.filteredCompanies =this.companyData
      // this.filteredCompanies = this.companyData;
      this.filteredCompaniesName = this.companyData;
    })

  }

  submit(): void {
    // console.log('Form Data:', this.formData);
    if (
      this.formData.name == '' ||
      this.formData.email == '' ||
      this.formData.companyNumber == undefined ||
      this.formData.companyName == ''
    ) {
      this.toastr.error('Enter All Fields');
    } else {
      // Create the data object with form values
      const data = {
        userName: this.formData.name,
        email: this.formData.email,
        uid: this.formData.companyNumber,
        name: this.formData.companyName,
      };

      console.log(data);

      // Call the API

      this.auth.signUp(data).subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          if (response.success) {
            this.toastr.success(response.message);
            this.formData.name = '';
            this.formData.email = '';
            this.formData.companyNumber = null;
            this.formData.companyName = '';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('API Error:', error);
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('server error');
          }
        },
      });
    }
  }
}
