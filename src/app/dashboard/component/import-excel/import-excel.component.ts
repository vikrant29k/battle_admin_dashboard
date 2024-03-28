import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  fileError: boolean = true;
  finalResult: any;
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // onFileSelected(event: any): void {
  //   const file: File = event.target.files[0];
  //   const fileReader: FileReader = new FileReader();

  //   fileReader.onload = (e: any) => {
  //     const binaryString: string = e.target.result;
  //     const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
  //       type: 'binary',
  //     });
  //     const worksheetName: string = workbook.SheetNames[0];
  //     const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
  //     const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //     // Convert the array of arrays into an array of objects
  //     const headers = data[0];
  //     const dataArray = data.slice(1); // Exclude the header row

  //     const result = dataArray.reduce((acc: any[], row: any[]) => {
  //       // Check if all values in the row are undefined
  //       const isEmpty = row.every((value: any) => value === undefined);
  //       // If the row is not empty, convert it to an object and add it to the result
  //       if (!isEmpty) {
  //         const obj: any = {};
  //         headers.forEach((header: any, index: any) => {
  //           obj[header] = row[index];
  //         });
  //         acc.push(obj);
  //       }
  //       return acc;
  //     }, []);

  //     console.log('Excel data:', result);

  //   };

  //   fileReader.readAsBinaryString(file);
  // }

  // onFileSelected(event: any): void {
  //   const file: File = event.target.files[0];
  //   const fileReader: FileReader = new FileReader();

  //   fileReader.onload = (e: any) => {
  //     const binaryString: string = e.target.result;
  //     const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
  //       type: 'binary',
  //     });
  //     const worksheetName: string = workbook.SheetNames[0];
  //     const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
  //     const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //     // Convert the array of arrays into an array of objects
  //     const headers = data[0];
  //     const dataArray = data.slice(1); // Exclude the header row

  //     // Extract column data
  //     const columnData: { [key: string]: any[] } = {};
  //     headers.forEach((header: string, index: number) => {
  //       const columnValues = dataArray.map((row: any[]) => row[index]);
  //       const filteredColumnValues = columnValues.filter((value: any) => value !== undefined);
  //       columnData[header] = filteredColumnValues;
  //     });

  //     // Convert the array of arrays into an array of objects
  //     const result = dataArray.reduce((acc: any[], row: any[]) => {
  //       // Check if all values in the row are undefined
  //       const isEmpty = row.every((value: any) => value === undefined);
  //       // If the row is not empty, convert it to an object and add it to the result
  //       if (!isEmpty) {
  //         const obj: any = {};
  //         headers.forEach((header: any, index: any) => {
  //           obj[header] = row[index];
  //         });
  //         acc.push(obj);
  //       }
  //       return acc;
  //     }, []);

  //     console.log('Excel data:', result);

  //     console.log('Column data:', columnData);
  //   };

  //   fileReader.readAsBinaryString(file);
  // }

  // onFileSelected(event: any): void {
  //   const file: File = event.target.files[0];
  //   const fileReader: FileReader = new FileReader();

  //   fileReader.onload = (e: any) => {
  //     const binaryString: string = e.target.result;
  //     const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
  //       type: 'binary',
  //     });
  //     const worksheetName: string = workbook.SheetNames[0];
  //     const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
  //     const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  //     // Convert the array of arrays into an array of objects
  //     const headers = data[0];
  //     const dataArray = data.slice(1); // Exclude the header row

  //     // Extract column data
  //     const columnData: { [key: string]: any[] } = {};
  //     headers.forEach((header: string, index: number) => {
  //       const columnValues = dataArray.map((row: any[]) => row[index]);
  //       const filteredColumnValues = columnValues.filter((value: any) => value !== undefined);
  //       columnData[header] = filteredColumnValues;
  //     });

  //     // Check if all values in the "Company No" column array are the same
  //     const companyNoArray = columnData['Company No'];
  //     const firstCompanyNo = companyNoArray[0];
  //     const companyNosMatch = companyNoArray.every((value: any) => value === firstCompanyNo);

  //     if (!companyNosMatch) {
  //       console.error('Error: Not all values in the "Company No" column are the same.');
  //     }

  //     // Convert the array of arrays into an array of objects
  //     const result = dataArray.reduce((acc: any[], row: any[]) => {
  //       // Check if all values in the row are undefined
  //       const isEmpty = row.every((value: any) => value === undefined);
  //       // If the row is not empty, convert it to an object and add it to the result
  //       if (!isEmpty) {
  //         const obj: any = {};
  //         headers.forEach((header: any, index: any) => {
  //           obj[header] = row[index];
  //         });
  //         acc.push(obj);
  //       }
  //       return acc;
  //     }, []);

  //     console.log('Excel data:', result);
  //     console.log('Column data:', columnData);
  //   };

  //   fileReader.readAsBinaryString(file);
  // }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.selectedFile = file;
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
      this.validateColumn(columnData, 'Company No');

      // Validate the "Company Name" column
      this.validateColumn(columnData, 'Company Name');
      this.validateColumn(columnData, 'Company Target LC Total');
      this.validateColumn(columnData, 'Currency');
      this.validateColumn(columnData, 'Time zone (correlated to CET)');
      this.validateColumn(columnData, `Language\r\nISO-639-1`);
      this.validateColumn(columnData, 'Battle Partner Company No');
      this.validateColumn(columnData, 'Battle Partner Company Name');
      this.validateColumn(columnData, 'Target / Sales Rep LC');
      this.validateColumn(columnData, 'Sales rep No');
      this.validateColumn(columnData, 'E-Mail');
      this.validateColumn(columnData, 'Company Unit (Region or Division...)');
      this.validateColumn(columnData, 'Team name (ASM level)');

      // Convert the array of arrays into an array of objects
      const result = dataArray.reduce((acc: any[], row: any[]) => {
        // Check if all values in the row are undefined
        // console.log('this is a excel row', row);
        const isEmpty = row.every((value: any) => value === undefined);
        // If the row is not empty, convert it to an object and add it to the result
        if (!isEmpty) {
          // console.log('second column', row[2]);

          const obj: any = {};
          headers.forEach((header: any, index: any) => {
            obj[header] = row[index];

            if (obj[header] == undefined && header !== 'Game-Leader (GL)') {
              this.toastr.error(`fill all fields in ${header}`);
              this.fileError = true;
            }
          });

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

          // console.log('common obj ', commonFieldObject);

          // if (obj['Company Unit (Region or Division...)'] == undefined) {
          //   this.toastr.error(
          //     `fill all fields in Company Unit (Region or Division...`
          //   );
          // } else if (
          //   typeof obj['Company Unit (Region or Division...)'] !== 'string'
          // ) {
          //   this.toastr.error(
          //     'Company Unit (Region or Division...) value should be string it must be letters'
          //   );
          // }

          // if (obj['Team name (ASM level)'] == undefined) {
          //   this.toastr.error(`fill all fields in Team name (ASM level)`);
          // } else if (typeof obj['Team name (ASM level)'] !== 'string') {
          //   this.toastr.error(
          //     'Team name (ASM level) value should be string it must be letters'
          //   );
          // }

          // if (obj['Battle Partner Team name (ASM level)'] == undefined) {
          //   this.toastr.error(
          //     `fill all fields in Battle Partner Team name (ASM level)`
          //   );
          // } else if (
          //   typeof obj['Battle Partner Team name (ASM level)'] !== 'string'
          // ) {
          //   this.toastr.error(
          //     'Battle Partner Team name (ASM level) value should be string it must be letters'
          //   );
          // }

          // if (obj['Game-Leader (GL)'] == 'GL') {
          //   obj.isGL = true;
          // } else {
          //   obj.isGL = false;
          // }

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

      console.log('Final Result:', this.finalResult);

      console.log('Column data:', columnData);
    };

    fileReader.readAsBinaryString(file);
  }

  validateColumn(columnData: any, columnName: string): void {
    const columnArray = columnData[columnName];

    if (columnName === 'E-Mail') {
      console.log(columnArray);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      columnArray.forEach((email: string, index: number) => {
        // console.log('email is =>', email);
        if (emailRegex.test(email)) {
          console.log('email correct');
        } else {
          console.error(
            `Error: Invalid email address "${email}" at index ${
              index + 1
            } in the "${columnName}" column.`
          );
          
          this.toastr.error(`invalid Email ${email}`);
          this.fileError = true;
          return;
        }
      });
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
        return;
      }
    }

    if (columnName == 'Target / Sales Rep LC' || columnName == 'Sales rep No') {
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
    }
  }

  arraysAreEqual(arr1: any[], arr2: any[]): boolean {
    // Check if arrays have the same length
    if (arr1.length !== arr2.length) {
      return false;
    }

    // Check if each element at corresponding indices is equal
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true; // Arrays are equal
  }

  onFileUpload(): void {
    
    if (!this.fileError) {
      // Use FormData to send the file
      // const formData = new FormData();
      // formData.append('excel', this.selectedFile, this.selectedFile.name);

      // Send the file using HttpClient
      this.http
        .post(`${environment.baseUrl}admin/player`, this.finalResult)
        .subscribe(
          (res: any) => {
            console.log('File upload response:', res);
            if (res.message == 'file received...') {
              // alert("Import Successful");
              this.toastr.error('Import Successful');
            }
          },
          (error) => {
            console.error('Error uploading file:', error);
          }
        );
    } else {
      if (!this.selectedFile) {
        this.toastr.error('Please Select File');
      } else {
        this.toastr.error('Error in file');
      }
    }
  }
}
