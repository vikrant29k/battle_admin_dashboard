import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environment/enviroment';

@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styleUrls: ['./import-excel.component.scss']
})
export class ImportExcelComponent {
  selectedFile: File | null = null;
  constructor(private http:HttpClient){

  }
  onFileSelected(event: any): void {
    console.log(event)
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files) {
      this.selectedFile = fileInput.files[0];
    }
  }
  onFileUpload(): void {
    if (this.selectedFile) {
      // Use FormData to send the file
      const formData = new FormData();
      formData.append('excel', this.selectedFile, this.selectedFile.name);

      // Send the file using HttpClient
      this.http.post(`${environment.baseUrl}importTeam`, formData).subscribe(
        (res:any) => {
          // console.log('File upload response:', res);
          if(res.message=='file received...'){
            alert("Import Successful");
          }
        },
        (error) => {
          console.error('Error uploading file:', error);
        }
      );
    } else {
      console.error('No file selected.');
    }
  }
}
