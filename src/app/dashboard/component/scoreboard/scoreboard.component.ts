import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environment/enviroment';
import * as XLSX from 'xlsx';
import { HourlyExcelEditFormDialogComponent } from '../hourly-excel-edit-form-dialog/hourly-excel-edit-form-dialog.component';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public translate:TranslateService
  ) {
    this.editLineDialogData = {
      title: this.translate.instant('UPLOAD_SECTION.EDIT_LINE_TITLE'),
      message: this.translate.instant('UPLOAD_SECTION.EDIT_LINE_MESSAGE')
    };
  }
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
  jsonFileData: any;
  storedData: any;

  editLineDialogData :any;

  ngOnInit(): void {
    // this.storedData = localStorage.getItem('hourly_file_data');
    // this.getCompanyUid()
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    const dialogRef = this.dialog.open(HourlyExcelEditFormDialogComponent, {
      width: '900px',
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

  openNewDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    const dialogRef = this.dialog.open(DialogAnimationsComponent, {
      width: '250px',
      enterAnimationDuration,
      data: this.editLineDialogData,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // console.log('result', result);

        this.openDialog('0ms', '0ms');
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

      // console.log('headers', this.headers);

      let headersSame = this.arraysAreEqual(this.headers, allowedHeaders);

      if (headersSame) {
        // console.log('arrays is same');
      } else {
        // console.log('array not same');
        this.toastr.error(this.translate.instant('TOASTER_RESPONSE.CHECK_HEADERS_ERROR'));
        this.fileError = true;
        this.fileErrorMessage = 'Please Check Headers';
        this.fileSelectedSpinner = false;
        return;
      }

      this.dataArray = data.slice(1); // Exclude the header row

      // console.log('dataarry', this.dataArray);
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
                this.toastr.error(this.translate.instant(`TOASTER_RESPONSE.FILL_ALL_FIELDS_ERROR ${header}`));
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
    // console.log('Excel data:', this.fileData);
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

          this.toastr.error(this.translate.instant(`${columnName} need to same COLUMN_VALUE_MATCH_ERROR`));
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
          this.toastr.error(this.translate.instant(`CHECK_NUMBER_COLUMN`,{columnName:columnName}));
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
          // console.error(
          //   `Error: Not all values in the "${columnName}" column are numbers or string.`
          // );
          const errorMessage = this.translate.instant('TOASTER_RESPONSE.COLUMN_NUMBER_VALUE_ERROR', { columnName: columnName });
          this.toastr.error(errorMessage);
          this.fileError = true;
          throw new Error(
            errorMessage
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
            this.toastr.error(this.translate.instant(`${val} TOASTER_RESPONSE.SALES_REP_DUPLICATE_ENTRY`));
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
          // console.log('data for api ', data);
          this.http
            .post(`${environment.baseUrl}sales/upload-hourly-sales-data`, data)
            .subscribe(
              (res: any) => {
                this.confirm = false;
                // console.log('File upload response:', res);
                if (res.statusCode == 200) {
                  // alert("Import Successful");
                  localStorage.setItem(
                    'hourly_file_data',
                    JSON.stringify(this.fileData)
                  );
                  // this.storedData = localStorage.getItem('hourly_file_data');
                  this.downloadJsonFile();
                  this.selectedFile = null;
                  this.file = null;
                  this.toastr.success(res.message);
                  this.fileData = [];
                  this.headers = [];
                }
                //  else {
                //   this.toastr.success(res.message);
                //   this.selectedFile = null;
                //   this.file = null;
                // }
                this.disableConfirmButotn = true;
              },
              (error: HttpErrorResponse) => {
                this.confirm = false;
                // console.error('Error uploading file:', error);
                // this.selectedFile = null;
                // this.file = null;
                if (error.error.message) {
                  this.toastr.error(error.error.message);
                } else {
                  this.toastr.error(this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR'));
                }
              }
            );
        } else {
          this.toastr.error(this.translate.instant('TOASTER_RESPONSE.FILE_UPLOAD_IN_PROGRESS'));
        }
      } else {
        this.toastr.error(this.translate.instant('TOASTER_RESPONSE.PLEASE_SELECT_FILE_ERROR'));

      }
    } else {
      this.toastr.error(this.fileErrorMessage);
    }
  }

  downloadJsonFile() {
    var hourly_file_data: [];
    var company_current = 0;
    var companyTargetLC = 0;
    this.storedData = localStorage.getItem('hourly_file_data');

    // console.log("storedata ", this.storedData)

    if (this.storedData !== null) {
      hourly_file_data = JSON.parse(this.storedData);
      // console.log("hourly ", hourly_file_data)
    } else {
      this.toastr.error(this.translate.instant('TOASTER_REPLACE.UPLOAD_EXCEL_FIRST_ERROR'));
      return;
    }

    this.http.get(environment.baseUrl + 'user/target-sales').subscribe({
      next: (res: any) => {
        // console.log('res==', res);
        if (res.success) {
          console.log('api data', res.data);
          // console.log('file data data', res.data);
          const promises = res.data.map((obj: any) => {
            // console.log('abj is', obj);
            return new Promise((resolve, reject) => {
              if (Array.isArray(hourly_file_data)) {
                hourly_file_data.map((obj1: any) => {
                  company_current = company_current + obj1['Sales in LC'];
                  // console.log("obj",obj.salesRepNo,"obj1",obj1 )
                  if (obj.salesRepNo == obj1['Sales rep no.']) {
                    // console.log("obj1['Sales in LC']", obj1['Sales in LC']);
                    obj.salesInLC = obj1['Sales in LC'];
                    // console.log('obj', obj);
                  }
                });
                companyTargetLC = obj.companyTargetLC;
                resolve(obj);
              } else {
                reject(new Error('storedData is not an array'));
              }
            });
          });

          Promise.all(promises)
            .then((jsonFileData: any[]) => {
              // console.log('final json file data', jsonFileData);
              const jsonObject = {
                 data:jsonFileData,
                company_current: company_current,
                company_total: companyTargetLC,
              };
              const jsonString = JSON.stringify(jsonObject, null, 2);
              const blob = new Blob([jsonString], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'data.json';
              anchor.click();
              URL.revokeObjectURL(url);
            })
            .catch((error) => {
              console.error('Error processing data:', error);
            });
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

//   getCompanyUid() {
//     this.http.get(`${environment.baseUrl}user/details`).subscribe({
//       next: (res: any) => {
//         this.companyUid = res.data?.companyId?.uid;
//         const storedDataString = localStorage.getItem('hourly_file_data');
//         if (storedDataString !== null) {
//           const storedDataArr = JSON.parse(storedDataString);
//           console.log("Company ID", storedDataArr[0]["Company ID"], this.companyUid);
//           if (storedDataArr[0]["Company ID"] !== this.companyUid) {
//             localStorage.removeItem("hourly_file_data");
//           }
//         } else {
//           console.error("No data found in local storage for 'hourly_file_data'");
//         }
//       },
//       error: (error: any) => {
//         console.error("Error fetching user details:", error);
//       }
//     });
// }


  convertobjectToArray(filesData: any) {
    const arrayOfArrays = filesData.map((obj: any) => Object.values(obj));
    this.dataArray = arrayOfArrays;
    this.validateAndFinalResult();
  }

  editLine(index: any) {
    // console.log('line ', index);
    this.excelFileLineIndexForEditDialog = index;
    // this.openDialog('0ms', '0ms');
    this.openNewDialog('0ms', '0ms');
  }
}
