import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelService } from 'src/app/services/importExcel.service';
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
  constructor(
    private toastr: ToastrService,
    private excelService: ExcelService
  ) {}

  onFileSelected(event: any): void {
    // console.log('file', event);
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
    this.disableConfirmButotn = false;
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
      var data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (
        data[0][12] == 'Language\r\nISO-639-1' ||
        data[0][12] == 'Language\nISO-639-1'
      ) {
        data[0][12] = 'Language ISO-639-1';
      }

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
        'Language ISO-639-1',
        'Battle Partner Company No',
        'Battle Partner Company Name',
      ];

      const headers = data[0];

      let headersSame = this.arraysAreEqual(headers, allowedHeaders);

      if (headersSame) {
        // console.log('arrays is same');
      } else {
        // console.log('array not same');
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
        this.validateColumn(columnData, `Language ISO-639-1`) ||
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
        this.fileSelectedSpinner = false;
        throw new Error('validation failed');
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
          commonFieldObject['Language ISO-639-1'] = obj['Language ISO-639-1'];
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
          delete obj['Language ISO-639-1'];
          delete obj['Battle Partner Company No'];
          delete obj['Battle Partner Company Name'];

          acc.push(obj);
        }
        return acc;
      }, []);

      // console.log('Excel data:', result);

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

      // teamArrays.map((arr, i) => {
      for (let i = 0; i < teamArrays.length; i++) {
        let arr = teamArrays[i];

        // console.log('arrrrrr', arr);
        try {
          let values: any = [];
          let teamName = '';
          arr.map((obj, i) => {
            if (
              obj['Company Unit (Region or Division...)'].toLowerCase() ==
                'superuser' ||
              obj['Team name (ASM level)'].toLowerCase() == 'superuser' ||
              (typeof obj['Sales rep No'] === 'string' &&
                obj['Sales rep No'].toLowerCase() == 'superuser') ||
              obj['Battle Partner Team name (ASM level)'].toLowerCase() ==
                'superuser' ||
              obj['Battle Partner Team name (ASM level)'].toLowerCase() ==
                'superuser'
            ) {
              if (!(obj['Game-Leader (GL)'] == 'SU')) {
                this.toastr.error(
                  'For Superuser You need to enter SU in Game-Leader (GL) column'
                );
                throw new Error(
                  'For Superuser You need to enter SU in Game-Leader (GL) column'
                );
              }
            }

            if (obj['Game-Leader (GL)'] == 'SU') {
              // console.log('obj', obj['Game-Leader (GL)']);
              if (
                obj['Company Unit (Region or Division...)'].toLowerCase() !==
                'superuser'
              ) {
                this.toastr.error(
                  'superuser name should be Superuser in Company Unit (Region or Division...)'
                );
                this.fileError = true;
                this.fileErrorMessage = `superuser name should be Superuser in Company Unit (Region or Division...)`;
                this.fileSelectedSpinner = false;
                throw new Error(
                  'superuser name should be Superuser in Company Unit (Region or Division...)'
                );
              }
              if (obj['Team name (ASM level)'].toLowerCase() !== 'superuser') {
                this.toastr.error(
                  'superuser name should be Superuser in Team name (ASM level)'
                );
                this.fileError = true;
                this.fileErrorMessage = `superuser name should be Superuser in Team name (ASM level)`;
                this.fileSelectedSpinner = false;
                throw new Error(
                  'superuser name should be Superuser in Team name (ASM level)'
                );
              }
              if (obj['Sales rep No'].toLowerCase() !== 'superuser') {
                this.toastr.error(
                  'superuser name should be Superuser in Sales rep No'
                );
                this.fileError = true;
                this.fileErrorMessage = `superuser name should be Superuser in Sales rep No`;
                this.fileSelectedSpinner = false;
                throw new Error(
                  'superuser name should be Superuser in Sales rep No'
                );
              }
              if (
                obj['Battle Partner Team name (ASM level)'].toLowerCase() !==
                'superuser'
              ) {
                this.toastr.error(
                  'superuser name should be Superuser in Battle Partner Team name (ASM level)'
                );
                this.fileError = true;
                this.fileErrorMessage = `superuser name should be Superuser in Battle Partner Team name (ASM level)`;
                this.fileSelectedSpinner = false;
                throw new Error(
                  'superuser name should be Superuser in Battle Partner Team name (ASM level)'
                );
              }
            }

            values.push(obj['Game-Leader (GL)']);
            teamName = obj['Team name (ASM level)'];
          });
          //     console.log('values =>', values);
          // var atleastOneString = values.every(
          //     //   (value: any) => typeof value === 'number'
          //     // );

          //     // var values = [1, 'su', 'three', 'four', 5];

          var stringCount = values.reduce((count: any, value: any) => {
            return typeof value === 'string' ? count + 1 : count;
          }, 0);

          if (stringCount === 0) {
            // console.log('game leader not found, team name', teamName);
            this.toastr.error('game leader not found', teamName);
            this.fileError = true;
            this.fileErrorMessage = `game leader not found, team name ${teamName}`;
            this.fileSelectedSpinner = false;
            throw new Error(`game leader not found, team name,${teamName}`);
          } else {
            // console.log('No error. team leader found');
          }

          var stringCountforMoreGL = values.reduce((count: any, value: any) => {
            return typeof value === 'string' && value !== 'SU'
              ? count + 1
              : count;
          }, 0);

          if (stringCountforMoreGL > 1) {
            // console.log('game leader not found, team name', teamName);
            this.toastr.error(`more than one game leader found in ${teamName}`);
            this.fileError = true;
            this.fileErrorMessage = `more than one game leader found in ${teamName}`;
            this.fileSelectedSpinner = false;
            throw new Error(`more than one game leader found in,${teamName}`);
          } else {
            // console.log('No error. team leader found');
          }

          //     ///////
        } catch (error: any) {
          console.error('error while validating', error.message);
          this.fileErrorMessage = error.message;
          this.fileError = true;
          this.fileSelectedSpinner = false;
          // break;
          return;
        }
        // });
      }

      // validate two columns Company Name and Battle Partner Company Name

      let teamNameColumn = columnData['Team name (ASM level)'];
      let battlePartnerTeamNameColumn =
        columnData['Battle Partner Team name (ASM level)'];
      // console.log('team names', teamNameColumn, battlePartnerTeamNameColumn);

      // let filteredTeamNameColumn = teamNameColumn.filter((val:any,i:number)=>{
      //   return val!=="Superuser"
      // })
      // let filteredBattlePartnerTeamNameColumn = teamNameColumn.filter((val:any,i:number)=>{
      //   return val!=="Superuser"
      // })

      const missingValues = teamNameColumn.filter(
        (val) => !battlePartnerTeamNameColumn.includes(val)
      );

      const missingValues1 = battlePartnerTeamNameColumn.filter(
        (val) => !teamNameColumn.includes(val)
      );

      if (missingValues.length === 0) {
        // console.log('All values in the first array exist in the second array.');
      } else {
        // console.log(
        //   'Not all values in the first array exist in the second array.'
        // );
        let mess = `Team name (ASM level) ${missingValues} not present in Battle Partner Team name (ASM level)`;
        this.toastr.error(mess);
        this.fileError = true;
        this.fileErrorMessage = mess;
        this.fileSelectedSpinner = false;
        return;
      }

      if (missingValues1.length === 0) {
        // console.log('All values in the second array exist in the first array.');
      } else {
        // console.log(
        //   'Not all values in the second array exist in the first array.'
        // );
        let mess = `Battle Partner Team name (ASM level) ${missingValues1} not present in Team name (ASM level)`;
        this.toastr.error(mess);
        this.fileError = true;
        this.fileErrorMessage = mess;
        this.fileSelectedSpinner = false;
        return;
      }

      // console.log("team names", filteredTeamNameColumn, filteredBattlePartnerTeamNameColumn)

      this.finalResult = {
        teamsData: teamArrays,
        commonFields: commonFieldObject,
      };
      this.fileError = false;
      this.fileSelectedSpinner = false;
      // console.log('Final Result:', this.finalResult);

      // console.log('Column data:', columnData);
    };

    fileReader.readAsBinaryString(this.file);
    event.target.value = '';
  }

  validateColumn(columnData: any, columnName: string): any {
    try {
      var columnArray = columnData[columnName];

      if (columnName === 'E-Mail') {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
      // check column values in number or string
      if (columnName == 'Sales rep No') {
        var allValuesInNumberOrString = columnArray.every(
          (value: any) => typeof value === 'number' || typeof value === 'string'
        );

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

      if (
        columnName == 'Target / Sales Rep LC' ||
        columnName == 'Sales rep No'
      ) {
        return;
      }
      //

      //validate total value of Target / Sales Rep LC is equal to Company Target LC Total
      // const Target_Sales_Rep_LC_total = columnData['Target / Sales Rep LC'];
      // let total_value = 0;
      // Target_Sales_Rep_LC_total.map((num: number, i: number) => {
      //   total_value += num;
      // });

      // const Company_Target_LC_Total = columnData['Company Target LC Total'];
      // Company_Target_LC_Total.map((val: number, i: number) => {
      //   if (val !== total_value) {
      //     this.fileError = true;
      //     this.toastr.error(
      //       'Target / Sales Rep LC total not equal to Company Target LC Total'
      //     );
      //     throw new Error(
      //       'Target / Sales Rep LC total not equal to Company Target LC Total'
      //     );
      //   }
      // });

      // check column values in string
      if (
        columnName == 'Company Name' ||
        columnName == 'Company Unit (Region or Division...)' ||
        columnName == 'Team name (ASM level)' ||
        columnName == 'Currency' ||
        columnName == 'Battle Partner Team name (ASM level)' ||
        columnName == `Language ISO6391` ||
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

      if (columnName === 'Company Name') {
        columnArray = columnArray.map((val: any) => {
          return val.replace(/Wüerth/g, 'Würth');
        });
      }

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
  disableConfirmButotn: boolean = true;
  onFileUpload(): void {
    if (!this.fileError) {
      // console.log(this.finalResult);
      this.excelService.importExcel(this.finalResult).subscribe(
        (res: any) => {
          // console.log('File upload response:', res);
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
          this.disableConfirmButotn = true;
        },
        (error) => {
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
