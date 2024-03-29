import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as XLSX from 'xlsx';

import { environment } from 'src/environment/enviroment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styleUrls: ['./import-excel.component.scss'],
})
export class ImportExcelComponent {
  selectedFile: File | null = null;
  file: File | null = null;
  fileError: boolean = true;
  fileErrorMessage: string = '';
  finalResult: any;
  fileSelectedSpinner: boolean = false;
  confirm: boolean = false;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
    this.selectedFile = this.file;

    if (
      this.file?.type !== 'application/vnd.ms-excel' &&
      !this.file?.name.endsWith('.xlsx')
    ) {
      // File format is not supported
      this.toastr.error('Please select an Excel file (.xlsx).');
      this.fileError = true;
      this.fileErrorMessage = 'Please select an Excel file (.xlsx).';
      return;
    }

    this.fileSelectedSpinner = true;

    var commonFieldObject: any = {};
    const fileReader: FileReader = new FileReader();

    fileReader.onload = (e: any) => {
      const binaryString: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
        type: 'binary',
      });
      const worksheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convert the array of arrays into an array of objects
      const allowedHeaders = [
        'Company No',
        'Company Name',
        'Company Unit (Region or Division...)',
        'Team name (ASM level)',
        'Company Target LC Total',
        'Target / Sales Rep LC',
        'Currency',
        'Sales rep No',
        'E-Mail',
        'Game-Leader (GL)',
        'Battle Partner Team name (ASM level)',
        'Time zone (correlated to CET)',
        'Language\r\nISO-639-1',
        'Battle Partner Company No',
        'Battle Partner Company Name',
      ];
      const headers = data[0];

      console.log('headers', headers);

      let headersSame = this.arraysAreEqual(headers, allowedHeaders);

      if (headersSame) {
        console.log('arrays is same');
      } else {
        console.log('array not same');
        this.toastr.error('Please Check Headers');
        this.fileError = true;
        this.fileSelectedSpinner = false;
        return;
      }

      const dataArray = data.slice(1); // Exclude the header row

      // console.log('dataarry', dataArray);

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
        this.validateColumn(columnData, 'Company No') ||
        this.validateColumn(columnData, 'Company Name') ||
        this.validateColumn(columnData, 'Company Target LC Total') ||
        this.validateColumn(columnData, 'Currency') ||
        this.validateColumn(columnData, 'Time zone (correlated to CET)') ||
        this.validateColumn(columnData, `Language\r\nISO-639-1`) ||
        this.validateColumn(columnData, 'Battle Partner Company No') ||
        this.validateColumn(columnData, 'Battle Partner Company Name') ||
        this.validateColumn(columnData, 'Target / Sales Rep LC') ||
        this.validateColumn(columnData, 'Sales rep No') ||
        this.validateColumn(columnData, 'E-Mail') ||
        this.validateColumn(
          columnData,
          'Company Unit (Region or Division...)'
        ) ||
        this.validateColumn(columnData, 'Team name (ASM level)')
      ) {
        throw new Error('validation failed');
        this.fileSelectedSpinner = false;
      }

      // Convert the array of arrays into an array of objects
      const result = dataArray.reduce((acc: any[], row: any[]) => {
        // Check if all values in the row are undefined
        // console.log('this is a excel row', row);
        const isEmpty = row.every((value: any) => value === undefined);
        // If the row is not empty, convert it to an object and add it to the result
        if (!isEmpty) {
          // console.log('second column', row[2]);

          const obj: any = {};
          // headers.forEach((header: any, index: any) => {
          //   obj[header] = row[index];

          //   if (obj[header] == undefined && header !== 'Game-Leader (GL)') {
          //     this.toastr.error(`fill all fields in ${header}`);
          //     this.fileError = true;
          //   }
          // });

          try {
            headers.forEach((header: any, index: any) => {
              obj[header] = row[index];

              if (obj[header] === undefined && header !== 'Game-Leader (GL)') {
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

          // Assign values to commonFieldObject outside the loop
          commonFieldObject['Company No'] = obj['Company No'];
          commonFieldObject['Company Name'] = obj['Company Name'];
          commonFieldObject['Company Target LC Total'] =
            obj['Company Target LC Total'];
          commonFieldObject.Currency = obj.Currency;
          commonFieldObject['Time zone (correlated to CET)'] =
            obj['Time zone (correlated to CET)'];
          commonFieldObject['Language\r\nISO-639-1'] =
            obj['Language\r\nISO-639-1'];
          commonFieldObject['Battle Partner Company No'] =
            obj['Battle Partner Company No'];
          commonFieldObject['Battle Partner Company Name'] =
            obj['Battle Partner Company Name'];

          // Remove assigned fields from the current object
          delete obj['Company No'];
          delete obj['Company Name'];
          delete obj['Company Target LC Total'];
          delete obj.Currency;
          delete obj['Time zone (correlated to CET)'];
          delete obj['Language\r\nISO-639-1'];
          delete obj['Battle Partner Company No'];
          delete obj['Battle Partner Company Name'];

          acc.push(obj);
        }
        return acc;
      }, []);

      console.log('Excel data:', result);

      // Create an object to store arrays of objects with the same team name
      const teamObject: { [teamName: string]: any[] } = {};

      // Iterate through the dataArray and populate the teamObject
      result.forEach((obj: any) => {
        const teamName = obj['Team name (ASM level)'];
        if (teamObject[teamName]) {
          teamObject[teamName].push(obj);
        } else {
          teamObject[teamName] = [obj];
        }
      });

      const teamArrays = Object.values(teamObject);

      this.finalResult = {
        teamsData: teamArrays, // Assign the teamArrays
        commonFields: commonFieldObject, // Assign the commonFieldObject
      };
      this.fileError = false;
      this.fileSelectedSpinner = false;
      console.log('Final Result:', this.finalResult);

      console.log('Column data:', columnData);
    };

    fileReader.readAsBinaryString(this.file);
  }

  validateColumn(columnData: any, columnName: string): any {
    try {
      const columnArray = columnData[columnName];

      if (columnName === 'E-Mail') {
        console.log(columnArray);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // columnArray.forEach((email: string, index: number) => {
        //   // console.log('email is =>', email);
        //   if (emailRegex.test(email)) {
        //     console.log('email correct');
        //   } else {
        //     console.error(
        //       `Error: Invalid email address "${email}" at index ${
        //         index + 1
        //       } in the "${columnName}" column.`
        //     );

        //     this.toastr.error(`invalid Email ${email}`);
        //     this.fileError = true;
        //     return;
        //   }
        // });

        for (const [index, email] of columnArray.entries()) {
          if (!emailRegex.test(email)) {
            console.error(
              `Error: Invalid email address "${email}" at index ${
                index + 1
              } in the "${columnName}" column.`
            );
            this.toastr.error(`Invalid Email: ${email}`);
            throw new Error('Invalid email found'); // Exit the loop by throwing an error
          }
        }
        return;
      }

      // check if column values in numbers
      if (
        columnName == 'Battle Partner Company No' ||
        columnName == 'Sales rep No' ||
        columnName == 'Target / Sales Rep LC' ||
        columnName == 'Company Target LC Total' ||
        columnName == 'Company No'
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

      if (
        columnName == 'Target / Sales Rep LC' ||
        columnName == 'Sales rep No'
      ) {
        return;
      }

      // check column values in string
      if (
        columnName == 'Company Name' ||
        columnName == 'Company Unit (Region or Division...)' ||
        columnName == 'Team name (ASM level)' ||
        columnName == 'Currency' ||
        columnName == 'Battle Partner Team name (ASM level)' ||
        columnName == 'Language\r\nISO-639-1' ||
        columnName == 'Battle Partner Company Name'
      ) {
        var allVAluesInString = columnArray.every(
          (value: any) => typeof value === 'string'
        );
        if (!allVAluesInString) {
          console.error(
            `Error: Not all values in the "${columnName}" column are string.`
          );
          this.toastr.error(
            `Please check all values in string, column ${columnName}`
          );
          this.fileError = true;
          throw new Error(
            `Please check all values in string, column ${columnName}`
          );
        }
      }

      if (
        columnName == 'Company Unit (Region or Division...)' ||
        columnName == 'Team name (ASM level)' ||
        columnName == 'Battle Partner Team name (ASM level)'
      ) {
        return;
      }

      // if (columnName == 'Company Unit (Region or Division...)') {
      //   console.log('values =>', columnArray);
      //   const allColumnInString = columnArray.every(
      //     (value: any) => typeof value == 'string'
      //   );
      //   if (!allColumnInString) {
      //     console.error(
      //       `Error: Not all values in the "${columnName}" column are String.`
      //     );
      //     return alert(
      //       `Error: Not all values in the "${columnName}" column are String.`
      //     );
      //   } else {
      //     return;
      //   }
      // }

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
      this.fileErrorMessage = 'Please Check Headers';
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

  onFileUpload(): void {
    this.confirm = true;
    if (!this.fileError) {
      // Use FormData to send the file
      // const formData = new FormData();
      // formData.append('excel', this.selectedFile, this.selectedFile.name);

      // Send the file using HttpClient
      this.http
        .post(`${environment.baseUrl}admin/player`, this.finalResult)
        .subscribe(
          (res: any) => {
            this.confirm = false;
            console.log('File upload response:', res);
            if (res.statusCode == 200) {
              // alert("Import Successful");
              this.toastr.success(res.message);
              this.selectedFile = null;
              this.file = null;
            } else {
              this.toastr.success(res.message);
              this.selectedFile = null;
              this.file = null;
            }
          },
          (error: HttpErrorResponse) => {
            this.confirm = false;
            this.file = null;
            console.error('Error uploading file:', error);
            if (error.error.message) {
              this.toastr.error(error.error.message);
            } else {
              this.toastr.error('server error');
            }
          }
        );
    } else {
      this.confirm = false;
      if (!this.selectedFile) {
        this.toastr.error('Please Select File');
      } else {
        this.toastr.error(this.fileErrorMessage);
      }
    }
  }
}
