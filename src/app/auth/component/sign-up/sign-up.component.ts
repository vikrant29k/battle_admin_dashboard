import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  signupForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    companyNumber: ['', Validators.required],
    companyName: ['', Validators.required]
  });
  filteredCompanies: Company[] = [];
  filteredCompaniesName: Company[] = [];
  filterCompanies(event: any) {
    const searchTerm = event.target.value;
    if (!searchTerm) {
      this.filteredCompanies = this.companyData;
      return;
    }
    this.filteredCompanies = this.companyData.filter(company => company.uid.toString().includes(searchTerm));
  }

  filterCompaniesName(event: any) {
    const searchTerm = event.target.value;
    if (!searchTerm) {
      this.filteredCompaniesName = this.companyData;
      return;
    }
    this.filteredCompaniesName = this.companyData.filter(company => company.name.toString().includes(searchTerm));
  }

  onCompanySelection(event: any) {
    const selectedCompany = event.value;
    debugger
    if (selectedCompany) {
      const company = this.companyData.find(company => company.uid === selectedCompany || company.name === selectedCompany);
      if (company) {
        if (event.source.ngControl.name === 'companyNumber') {
          debugger
          this.signupForm.get('companyName')?.setValue(company.name);
          debugger
        } else {
          this.signupForm.get('companyNumber')?.setValue(company.uid);
          debugger
        }
      }
    }
  }

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private fb:FormBuilder
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
    this.signupForm
    debugger
    // console.log('Form Data:', this.formData);
    if (
      this.signupForm.value.name == '' ||
      this.signupForm.value.email == '' ||
      this.signupForm.value.companyNumber == undefined ||
      this.signupForm.value.companyName == ''
    ) {
      this.toastr.error('Enter All Fields');
      debugger
    } else {
      // Create the data object with form values
      const data = {
        userName: this.signupForm.value.name,
        email: this.signupForm.value.email,
        uid: this.signupForm.value.companyNumber,
        name: this.signupForm.value.companyName,
      };

      console.log(data);

      // Call the API

      this.auth.signUp(data).subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          if (response.success) {
            this.toastr.success(response.message);
            this.signupForm.value.name = '';
            this.signupForm.value.email = '';
            this.signupForm.value.companyNumber = null;
            this.signupForm.value.companyName = '';
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
