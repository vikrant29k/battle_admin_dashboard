import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent {
  constructor(private http: HttpClient, private toastr: ToastrService) {}
  // file!: File;
  // selectedFile!: File;
  file: File | null = null;
  selectedFile: File | null = null;

  fileSelectedSpinner: boolean = false;
  confirm: boolean = false;
  fileError: boolean = false;
  fileErrorMessage!: string;

  fileData: any;

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
    this.selectedFile = this.file;
    console.log('file is', this.selectedFile);

    const fileReader: FileReader = new FileReader();
    this.fileSelectedSpinner = true;
    fileReader.onload = (e: any) => {
      const binaryString: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
        type: 'binary',
      });
      const worksheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convert the array of arrays into an array of objects
      const allowedHeaders = ['Company ID', 'Sales rep no.', 'Sales in LC'];
      const headers = data[0];

      console.log('headers', headers);

      let headersSame = this.arraysAreEqual(headers, allowedHeaders);

      if (headersSame) {
        console.log('arrays is same');
      } else {
        console.log('array not same');
        this.toastr.error('Please Check Headers');
        this.fileError = true;
        this.fileErrorMessage = 'Please Check Headers';
        this.fileSelectedSpinner = false;
        return;
      }

      const dataArray = data.slice(1); // Exclude the header row

      console.log('dataarry', dataArray);

      // Extract column data
      const columnData: { [key: string]: any[] } = {};
      headers.forEach((header: string, index: number) => {
        const columnValues = dataArray.map((row: any[]) => row[index]);
        const filteredColumnValues = columnValues.filter(
          (value: any) => value !== undefined
        );
        columnData[header] = filteredColumnValues;
      });

      // Validate the "Company No" column
      if (
        this.validateColumn(columnData, 'Company ID') ||
        this.validateColumn(columnData, 'Sales rep no.') ||
        this.validateColumn(columnData, 'Sales in LC')
      ) {
        this.fileSelectedSpinner = false;
        throw new Error('validation failed');
      }

      this.fileData = dataArray.reduce((acc: any[], row: any[]) => {
        // Check if all values in the row are undefined
        // console.log('this is a excel row', row);
        const isEmpty = row.every((value: any) => value === undefined);
        // If the row is not empty, convert it to an object and add it to the result
        if (!isEmpty) {
          // console.log('second column', row[2]);

          const obj: any = {};
          headers.forEach((header: any, index: any) => {
            obj[header] = row[index];

            // if (obj[header] == undefined) {
            //   this.toastr.error(`fill all fields in ${header}`);
            //   this.fileErrorMessage = `fill all fields in ${header}`
            //   this.fileError = true;
            // }

            try {
              headers.forEach((header: any, index: any) => {
                obj[header] = row[index];

                if (obj[header] === undefined) {
                  this.toastr.error(`Fill all fields in ${header}`);
                  this.fileErrorMessage = `Fill all fields in ${header}`;
                  this.fileError = true;
                  this.fileSelectedSpinner = false;
                  throw new Error(`Error: Missing value in "${header}" field`);
                }
              });
            } catch (error: any) {
              console.error(error.message);
              throw error;
            }
          });

          try {
            headers.forEach((header: any, index: any) => {
              obj[header] = row[index];
            });
          } catch (error: any) {
            console.error(error.message);
            throw error;
          }

          acc.push(obj);
        }
        return acc;
      }, []);

      this.fileSelectedSpinner = false;
      console.log('Excel data:', this.fileData);
    };
    this.file
      ? fileReader.readAsBinaryString(this.file)
      : (this.fileSelectedSpinner = false);
  }

  validateColumn(columnData: any, columnName: string): any {
    try {
      const columnArray = columnData[columnName];

      // check if column values in numbers
      if (
        columnName == 'Company ID' ||
        columnName == 'Sales in LC'
      ) {
        var allVAluesInNumber = columnArray.every(
          (value: any) => typeof value === 'number'
        );
        if (!allVAluesInNumber) {
          console.error(
            `Error: Not all values in the "${columnName}" column are numbers.`
          );
          this.toastr.error(
            `Please check all values in number column ${columnName}`
          );
          this.fileError = true;
          throw new Error('column values not in number');
          return;
        }
      }

      // check all values in number or string
      if(columnName == 'Sales rep no.'){
        var allValuesInNumberOrString = columnArray.every(
          (value: any) => typeof value === 'number' || typeof value === 'string'
        );

        if (!allValuesInNumberOrString) {
          console.error(
            `Error: Not all values in the "${columnName}" column are numbers or string.`
          );
          this.toastr.error(
            `Please check all values in number or string in column ${columnName}`
          );
          this.fileError = true;
          throw new Error('column values not in number or string');
          return;
        }
      }
    } catch (error: any) {
      console.error('error while validating', error.message);
      this.fileErrorMessage = error.message;
      this.fileError = true;
      this.fileSelectedSpinner = false;
      return true;
    }
  }

  arraysAreEqual(arr1: any[], arr2: any[]): boolean {
    // Check if arrays have the same length
    if (arr1.length !== arr2.length) {
      // this.fileErrorMessage = 'Please Check Headers';
      return false;
    }

    // Check if each element at corresponding indices is equal
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        this.fileErrorMessage = 'Please Check Headers';
        return false;
      }
    }

    return true; // Arrays are equal
  }

  onFileUpload() {
    if (!this.fileError) {
      if (this.selectedFile) {
        if (!this.fileSelectedSpinner) {
          this.confirm = true;
          let data = {
            data: this.fileData,
          };
          console.log('data for api ', data);
          this.http
            .post(`${environment.baseUrl}sales/upload-hourly-sales-data`, data)
            .subscribe(
              (res: any) => {
                this.confirm = false;
                console.log('File upload response:', res);
                if (res.statusCode == 200) {
                  // alert("Import Successful");
                  this.selectedFile = null;
                  this.file = null;
                  this.toastr.success(res.message);
                } else {
                  this.toastr.success(res.message);
                  this.selectedFile = null;
                  this.file = null;
                }
              },
              (error: HttpErrorResponse) => {
                this.confirm = false;
                console.error('Error uploading file:', error);
                // this.selectedFile = null;
                // this.file = null;
                if (error.error.message) {
                  this.toastr.error(error.error.message);
                } else {
                  this.toastr.error('server error');
                }
              }
            );
        } else {
          this.toastr.error('file upload in progress');
        }
      } else {
        this.toastr.error('Please select file');
      }
    } else {
      this.toastr.error(this.fileErrorMessage);
    }
  }
}
