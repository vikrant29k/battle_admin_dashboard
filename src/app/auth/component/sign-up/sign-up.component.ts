import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CompanyService } from 'src/app/services/company/company.service';
import { TranslateService } from '@ngx-translate/core';
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

    if (selectedCompany) {
      const company = this.companyData.find(company => company.uid === selectedCompany || company.name === selectedCompany);
      if (company) {
        if (event.source.ngControl.name === 'companyNumber') {

          this.signupForm.get('companyName')?.setValue(company.name);

        } else {
          this.signupForm.get('companyNumber')?.setValue(company.uid);

        }
      }
    }
  }

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private fb:FormBuilder,
    public translate:TranslateService
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
    // console.log('Form Data:', this.formData);
    if (
      this.signupForm.value.name == '' ||
      this.signupForm.value.email == '' ||
      this.signupForm.value.companyNumber == undefined ||
      this.signupForm.value.companyName == ''
    ) {
      this.toastr.error(this.translate.instant('TOASTER_RESPONSE.ENTER_ALL_FIELDS'));
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
          // console.log('API Response:', response);
          if (response.success) {
            this.toastr.success(this.translate.instant('TOASTER_RESPONSE.PASSWORD_RESET_LINK_SENT_SUCCESS'));
            this.signupForm.reset()
          }
        },
        error: (error: HttpErrorResponse) => {
          // console.error('API Error:', error);
          if (error.error.message=='Email already exists. Please use a different email address.') {
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EMAIL_ALREADY_EXISTS'));
          }
          else if(error.error.message=='No matching company data found. Please check your input and try again.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_NO_COMPANY_DATA_FOUND'));
          }
          else if(error.error.message=='Email must be a string.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_EMAIL_MUST_BE_STRING'));
          }
          else if(error.error.message=='Invalid email address.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_INVALID_EMAIL_ADDRESS'));
          }
          else if(error.error.message=='Company name must be a string.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_COMPANY_NAME_MUST_BE_STRING'));
          }
          else if(error.error.message=='Company name is required.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_COMPANY_NAME_REQUIRED'));
          }
          else if(error.error.message=='User name must be a string.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_USER_NAME_MUST_BE_STRING'));
          }
          else if(error.error.message=='User name is required.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_USER_NAME_REQUIRED'));
          }
          else if(error.error.message=='Company number is required.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_COMPANY_NUMBER_REQUIRED'));
          }
          else if(error.error.message=='Company number must be a number.'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_COMPANY_NUMBER_MUST_BE_NUMBER'));
          }
          else if(error.error.message=='error occurred while sending email...'){
            this.toastr.error(this.translate.instant('TOASTER_ERROR.ERROR_SENDING_EMAIL'));
          }
           else {
            this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
          }
        },
      });
    }
  }
}
