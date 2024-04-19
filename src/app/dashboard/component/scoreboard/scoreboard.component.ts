import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment';
import * as XLSX from 'xlsx';
import { HourlyExcelEditFormDialogComponent } from '../hourly-excel-edit-form-dialog/hourly-excel-edit-form-dialog.component';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {}
  // file!: File;
  // selectedFile!: File;
  file: File | null = null;
  selectedFile: File | null = null;

  fileSelectedSpinner: boolean = false;
  confirm: boolean = false;
  fileError: boolean = false;
  fileErrorMessage!: string;

  fileData: any;
  disableConfirmButotn: boolean = true;

  dataArray: any;
  headers: any;
  excelFileLineIndexForEditDialog!: number;

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    const dialogRef = this.dialog.open(HourlyExcelEditFormDialogComponent, {
      width: '250px',
      enterAnimationDuration,
      data: this.fileData[this.excelFileLineIndexForEditDialog],
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const salesRepNo = parseInt(result['Sales rep no.']);
        if (!isNaN(salesRepNo)) {
          result['Sales rep no.'] = salesRepNo;
        }

        this.fileData.splice(this.excelFileLineIndexForEditDialog, 1);
        this.fileData.splice(this.excelFileLineIndexForEditDialog, 0, result);
        this.convertobjectToArray(this.fileData);
      }
    });
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
    this.selectedFile = this.file;
    // console.log('file is', this.selectedFile);

    const fileReader: FileReader = new FileReader();
    this.fileSelectedSpinner = true;
    this.disableConfirmButotn = false;
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
      this.headers = data[0];

      console.log('headers', this.headers);

      let headersSame = this.arraysAreEqual(this.headers, allowedHeaders);

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

      this.dataArray = data.slice(1); // Exclude the header row

      console.log('dataarry', this.dataArray);
      this.validateAndFinalResult();
    };
    this.file
      ? fileReader.readAsBinaryString(this.file)
      : (this.fileSelectedSpinner = false);
    event.target.value = '';
    this.fileData = [];
    this.fileError = false;
  }

  validateAndFinalResult = () => {
    // Extract column data
    const columnData: { [key: string]: any[] } = {};
    this.headers.forEach((header: string, index: number) => {
      const columnValues = this.dataArray.map((row: any[]) => row[index]);
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

    this.fileData = this.dataArray.reduce((acc: any[], row: any[]) => {
      // Check if all values in the row are undefined
      // console.log('this is a excel row', row);
      const isEmpty = row.every((value: any) => value === undefined);
      // If the row is not empty, convert it to an object and add it to the result
      if (!isEmpty) {
        // console.log('second column', row[2]);

        const obj: any = {};
        this.headers.forEach((header: any, index: any) => {
          obj[header] = row[index];

          // if (obj[header] == undefined) {
          //   this.toastr.error(`fill all fields in ${header}`);
          //   this.fileErrorMessage = `fill all fields in ${header}`
          //   this.fileError = true;
          // }

          try {
            this.headers.forEach((header: any, index: any) => {
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
          this.headers.forEach((header: any, index: any) => {
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
    this.fileError = false;
    console.log('Excel data:', this.fileData);
  };

  validateColumn(columnData: any, columnName: string): any {
    try {
      const columnArray = columnData[columnName];

      // check all values same
      if (columnName === 'Company ID') {
        const firstValue = columnArray[0];

        const allValuesMatch = columnArray.every(
          (value: any) => value === firstValue
        );

        if (!allValuesMatch) {
          console.error(
            `Error: Not all values in the "${columnName}" column are the same.`
          );

          this.toastr.error(`${columnName} need to same `);
          this.fileError = true;
          throw new Error(`${columnName} need to same `);
        }
      }

      // check if column values in numbers
      if (columnName == 'Company ID' || columnName == 'Sales in LC') {
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
          throw new Error(
            `Please check all values in number column ${columnName}`
          );
          return;
        }
      }

      // check all values in number or string
      if (columnName == 'Sales rep no.') {
        var allValuesInNumberOrString = columnArray.every(
          (value: any) =>
            typeof value === 'number' ||
            (typeof value === 'string' && value.toLowerCase() === 'superuser')
        );

        if (!allValuesInNumberOrString) {
          console.error(
            `Error: Not all values in the "${columnName}" column are numbers or string.`
          );
          this.toastr.error(
            `Please check all values in number in column ${columnName} or enter superuser`
          );
          this.fileError = true;
          throw new Error(
            `Please check all values in number in column ${columnName} or enter superuser`
          );
          return;
        }

        // check 'Sales rep No' column value unique
        let seenSet = new Set();
        for (let val of columnArray) {
          if (typeof val === 'string') {
            if (val.toLowerCase() == 'superuser') {
              continue;
            }
          }
          if (seenSet.has(val)) {
            this.toastr.error(
              `${val} is already exist in Sales rep No. check and remove duplicate entry`
            );
            this.fileError = true;
            throw new Error(
              `${val} is already exist in Sales rep No. check and remove duplicate entry`
            );
          }
          seenSet.add(val);
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
                  this.fileData = []
                } else {
                  this.toastr.success(res.message);
                  this.selectedFile = null;
                  this.file = null;
                }
                this.disableConfirmButotn = true;
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

  convertobjectToArray(filesData: any) {
    const arrayOfArrays = filesData.map((obj: any) => Object.values(obj));
    this.dataArray = arrayOfArrays;
    this.validateAndFinalResult();
  }

  editLine(index: any) {
    // console.log('line ', index);
    this.excelFileLineIndexForEditDialog = index;
    this.openDialog('0ms', '0ms');
  }
}
