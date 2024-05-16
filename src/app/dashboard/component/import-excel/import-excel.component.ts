import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelService } from 'src/app/services/importExcel.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditFormDialogComponent } from '../edit-form-dialog/edit-form-dialog.component';
import { DialogAnimationsComponent } from '../dialog-animations/dialog-animations.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styleUrls: ['./import-excel.component.scss'],
})
export class ImportExcelComponent {
  isActive: boolean = false;
  fileUploaded: boolean = false;

  selectedFile: File | null = null;
  file: File | null = null;
  fileError: boolean = true;
  fileErrorMessage: string = '';
  finalResult: any;
  fileSelectedSpinner: boolean = false;
  confirm: boolean = false;
  tableData: any[] = [];
  headers: any;
  dataArray: any;
  commonFieldObject: any = {};
  tableHeaders: any = [];
  excelFileLineIndexForEditDialog!: number;

  editLineDialogData: any;

  constructor(
    private toastr: ToastrService,
    private excelService: ExcelService,
    public dialog: MatDialog,
    public translate: TranslateService
  ) {
    let lang: any = localStorage.getItem('lang');
    translate.use(lang);
    this.editLineDialogData = {
      title: this.translate.instant('UPLOAD_SECTION.EDIT_LINE_TITLE'),
      message: this.translate.instant('UPLOAD_SECTION.EDIT_LINE_MESSAGE'),
    };
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string,
    lineData: any
  ): void {
    const dialogRef = this.dialog.open(EditFormDialogComponent, {
      width: '900px',
      enterAnimationDuration,
      data: lineData,
      exitAnimationDuration,
    });
    dialogRef.afterClosed().subscribe((result) => {
      // console.log("dialog result is ", result)
      if (result) {
        let Gl = result['Game-Leader (GL)'];
        // console.log("gl is", Gl)
        if (Gl == '') {
          result['Game-Leader (GL)'] = undefined;
        }
        // console.log("updated result", result)
        const salesRepNo = parseInt(result['Sales rep No']);
        if (!isNaN(salesRepNo)) {
          result['Sales rep No'] = salesRepNo;
        }

        this.tableData.splice(this.excelFileLineIndexForEditDialog, 1);
        this.tableData.splice(this.excelFileLineIndexForEditDialog, 0, result);
        this.convertobjectToArray(this.tableData);
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

        this.openDialog(
          '0ms',
          '0ms',
          this.tableData[this.excelFileLineIndexForEditDialog]
        );
      }
    });
  }

  onFileSelected(event: any): void {
    // console.log('file', event);
    this.file = event.target.files[0];
    this.selectedFile = this.file;
    this.isActive = true;

    if (
      this.file?.type !== 'application/vnd.ms-excel' &&
      !this.file?.name.endsWith('.xlsx')
    ) {
      // File format is not supported
      this.toastr.error(
        this.translate.instant('TOASTER_RESPONSE.SELECT_EXCEL_FILE_ERROR')
      );
      this.fileError = true;
      this.fileErrorMessage = this.translate.instant(
        '.TOASTER_RESPONSESELECT_EXCEL_FILE_ERROR'
      );
      return;
    }
    this.disableConfirmButotn = false;
    this.fileSelectedSpinner = true;

    this.commonFieldObject;
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

      this.headers = data[0];
      this.tableHeaders = this.headers;

      let headersSame = this.arraysAreEqual(this.headers, allowedHeaders);

      if (headersSame) {
        // console.log('arrays is same');
      } else {
        // console.log('array not same');
        this.toastr.error(
          this.translate.instant('TOASTER_RESPONSE.CHECK_HEADERS_ERROR')
        );

        this.fileError = true;
        this.fileSelectedSpinner = false;
        return;
      }

      this.dataArray = data.slice(1); // Exclude the header row

      // console.log('dataarry', this.dataArray);

      this.validateAndFinalResult();
    };

    fileReader.readAsBinaryString(this.file);

    event.target.value = '';
    this.tableData = [];
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
      this.validateColumn(columnData, 'Company Unit (Region or Division...)') ||
      this.validateColumn(columnData, 'Team name (ASM level)')
    ) {
      this.fileSelectedSpinner = false;
      throw new Error('validation failed');
    }

    this.tableData = [];
    // Convert the array of arrays into an array of objects
    const result = this.dataArray.reduce((acc: any[], row: any[]) => {
      // Check if all values in the row are undefined
      // console.log('this is a excel row', row);
      const isEmpty = row.every((value: any) => value === undefined);
      // If the row is not empty, convert it to an object and add it to the result
      if (!isEmpty) {
        // console.log('second column', row[2]);
        // console.log('this is a excel row', row);
        let obj1: any = {};
        this.headers.forEach((header: any, index: any) => {
          obj1[header] = row[index];
        });
        // console.log("obj 1",obj1)
        this.tableData.push(obj1);

        const obj: any = {};
        // headers.forEach((header: any, index: any) => {
        //   obj[header] = row[index];

        //   if (obj[header] == undefined && header !== 'Game-Leader (GL)') {
        //     this.toastr.error(`fill all fields in ${header}`);
        //     this.fileError = true;
        //   }
        // });

        try {
          this.headers.forEach((header: any, index: any) => {
            obj[header] = row[index];

            // console.log("obj", obj)

            if (obj[header] === undefined && header !== 'Game-Leader (GL)') {
              this.toastr.error(
                this.translate.instant(`FILL_ALL_FIELDS_ERROR  ${header}`)
              );

              this.fileErrorMessage = this.translate.instant(
                `FILL_ALL_FIELDS_ERROR  ${header}`
              );
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
        this.commonFieldObject['Company No'] = obj['Company No'];
        this.commonFieldObject['Company Name'] = obj['Company Name'];
        this.commonFieldObject['Company Target LC Total'] =
          obj['Company Target LC Total'];
        this.commonFieldObject.Currency = obj.Currency;
        this.commonFieldObject['Time zone (correlated to CET)'] =
          obj['Time zone (correlated to CET)'];
        this.commonFieldObject['Language ISO-639-1'] =
          obj['Language ISO-639-1'];
        this.commonFieldObject['Battle Partner Company No'] =
          obj['Battle Partner Company No'];
        this.commonFieldObject['Battle Partner Company Name'] =
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
          // console.log("gl checker - ", obj)
          if (
            obj['Game-Leader (GL)'] !== undefined &&
            obj['Game-Leader (GL)'] !== 'SU'
          ) {
            // console.log('other value', obj);
            if (obj['Game-Leader (GL)'] !== 'GL') {
              this.toastr.error(
                this.translate.instant(
                  `TOASTER_RESPONSE.GAME_LEADER_COLUMN_ERROR`,
                  { val: obj['Sales rep No'] }
                )
              );
              this.fileErrorMessage = this.translate.instant(
                `TOASTER_RESPONSE.GAME_LEADER_COLUMN_ERROR`,
                { val: obj['Sales rep No'] }
              );
              this.fileError = true;
              this.fileSelectedSpinner = false;
              throw new Error(
                this.translate.instant(
                  `TOASTER_RESPONSE.GAME_LEADER_COLUMN_ERROR`,
                  { val: obj['Sales rep No'] }
                )
              );
            }
          }

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
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_COLUMN_ERROR'
                )
              );

              throw new Error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_COLUMN_ERROR'
                )
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
                this.translate.instant('TOASTER_RESPONSE.SUPERUSER_NAME_ERROR')
              );

              this.fileError = true;
              this.fileErrorMessage = this.translate.instant(
                'TOASTER_RESPONSE.SUPERUSER_NAME_ERROR'
              );
              this.fileSelectedSpinner = false;
              throw new Error(
                this.translate.instant('TOASTER_RESPONSE.SUPERUSER_NAME_ERROR')
              );
            }
            if (obj['Team name (ASM level)'].toLowerCase() !== 'superuser') {
              this.toastr.error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_ASM_LEVEL_ERROR'
                )
              );

              this.fileError = true;
              this.fileErrorMessage = this.translate.instant(
                'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_ASM_LEVEL_ERROR'
              );
              this.fileSelectedSpinner = false;
              throw new Error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_ASM_LEVEL_ERROR'
                )
              );
            }
            if (obj['Sales rep No'].toLowerCase() !== 'superuser') {
              this.toastr.error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_SALES_REP_NO_ERROR'
                )
              );

              this.fileError = true;
              // this.fileErrorMessage = `superuser name should be Superuser in Sales rep No`;
              this.fileErrorMessage = this.translate.instant(
                'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_SALES_REP_NO_ERROR'
              );
              this.fileSelectedSpinner = false;
              // throw new Error(
              //   'superuser name should be Superuser in Sales rep No'
              // );
              throw new Error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_SALES_REP_NO_ERROR'
                )
              );
            }
            if (
              obj['Battle Partner Team name (ASM level)'].toLowerCase() !==
              'superuser'
            ) {
              this.toastr.error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_BATTLE_PARTNER_ERROR'
                )
              );

              this.fileError = true;
              this.fileErrorMessage = this.translate.instant(
                'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_BATTLE_PARTNER_ERROR'
              );
              this.fileSelectedSpinner = false;
              throw new Error(
                this.translate.instant(
                  'TOASTER_RESPONSE.SUPERUSER_NAME_SUPERUSER_BATTLE_PARTNER_ERROR'
                )
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
          this.toastr.error(
            this.translate.instant('TOASTER_RESPONSE.GAME_LEADER_NOT_FOUND', {
              teamName: teamName,
            })
          );
          this.fileError = true;
          // this.fileErrorMessage = `game leader not found, team name ${teamName}`;
          this.fileErrorMessage = this.translate.instant(
            'TOASTER_RESPONSE.GAME_LEADER_NOT_FOUND',
            { teamName: teamName }
          );
          this.fileSelectedSpinner = false;
          // throw new Error(`game leader not found, team name,${teamName}`);
          throw new Error(
            this.translate.instant('TOASTER_RESPONSE.GAME_LEADER_NOT_FOUND', {
              teamName: teamName,
            })
          );
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
          this.toastr.error(
            this.translate.instant(
              'TOASTER_RESPONSE.MULTIPLE_GAME_LEADERS_FOUND',
              { teamName: teamName }
            )
          );

          this.fileError = true;
          this.fileErrorMessage = this.translate.instant(
            'TOASTER_RESPONSE.MULTIPLE_GAME_LEADERS_FOUND',
            { teamName: teamName }
          );
          this.fileSelectedSpinner = false;
          throw new Error(
            this.translate.instant(
              'TOASTER_RESPONSE.MULTIPLE_GAME_LEADERS_FOUND',
              { teamName: teamName }
            )
          );
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
      let mess = this.translate.instant(
        'TOASTER_RESPONSE.TEAM_NAME_NOT_PRESENT',
        { teamName: missingValues[0] }
      );
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
      let mess = this.translate.instant(
        'TOASTER_RESPONSE.BATTLE_PARTNER_TEAM_NAME_NOT_PRESENT',
        { teamName: missingValues1 }
      );
      this.toastr.error(mess);
      this.fileError = true;
      this.fileErrorMessage = mess;
      this.fileSelectedSpinner = false;
      return;
    }

    // console.log("team names", filteredTeamNameColumn, filteredBattlePartnerTeamNameColumn)

    this.finalResult = {
      teamsData: teamArrays,
      commonFields: this.commonFieldObject,
    };
    this.fileError = false;
    this.fileSelectedSpinner = false;
    // console.log('Final Result:', this.finalResult);
    // console.log('table data', this.tableData);
    // console.log('Column data:', columnData);
  };

  validateColumn(columnData: any, columnName: string): any {
    // debugger
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
            this.toastr.error(
              this.translate.instant(`TOASTER_RESPONSE.INVALID_EMAIL`, {
                email: email,
              })
            );

            // this.toastr.error(`Invalid Email: );
            throw new Error(
              this.translate.instant(`TOASTER_RESPONSE.INVALID_EMAIL`, {
                email: email,
              })
            ); // Exit the loop by throwing an error
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
            this.translate.instant(`TOASTER_RESPONSE.CHECK_NUMBER_COLUMN`, {
              columnName: columnName,
            })
          );
          this.fileError = true;
          throw new Error(
            this.translate.instant(`TOASTER_RESPONSE.CHECK_NUMBER_COLUMN`, {
              columnName: columnName,
            })
          );
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
              this.translate.instant(
                `TOASTER_RESPONSE.SALES_REP_DUPLICATE_ENTRY`,
                { val: val }
              )
            );

            this.fileError = true;
            throw new Error(
              this.translate.instant(
                `TOASTER_RESPONSE.SALES_REP_DUPLICATE_ENTRY`,
                { val: val }
              )
            );
          }
          seenSet.add(val);
        }

        if (!allValuesInNumberOrString) {
          console.error(
            `Error: Not all values in the "${columnName}" column are numbers or string.`
          );
          this.toastr.error(
            this.translate.instant(`TOASTER_RESPONSE.COLUMN_VALUE_ERROR`, {
              columnName: columnName,
            })
          );
          this.fileError = true;
          throw new Error(
            this.translate.instant(`TOASTER_RESPONSE.COLUMN_VALUE_ERROR`, {
              columnName: columnName,
            })
          );
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
            this.translate.instant(`TOASTER_RESPONSE.ERROR_MESSAGE`, {
              columnName: columnName,
            })
          );
          this.fileError = true;
          throw new Error(
            this.translate.instant(`TOASTER_RESPONSE.ERROR_MESSAGE`, {
              columnName: columnName,
            })
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
        // console.error(
        //   `Error: Not all values in the "${columnName}" column are the same.`
        // );

        this.toastr.error(
          this.translate.instant(`TOASTER_RESPONSE.COLUMN_VALUE_MATCH_ERROR`, {
            columnName: columnName,
          })
        );
        this.fileError = true;
        throw new Error(
          this.translate.instant(`TOASTER_RESPONSE.COLUMN_VALUE_MATCH_ERROR`, {
            columnName: columnName,
          })
        );
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
      this.fileErrorMessage = this.translate.instant(
        'TOASTER_RESPONSE.CHECK_HEADERS_ERROR'
      );
      return false;
    }

    // Check if each element at corresponding indices is equal
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        this.fileErrorMessage = this.translate.instant(
          'TOASTER_RESPONSE.CHECK_HEADERS_ERROR'
        );
        return false;
      }
    }

    return true; // Arrays are equal
  }
  disableConfirmButotn: boolean = true;
  onFileUpload(): void {
    // this.isActive=true;
    // this.fileUploaded = true;

    if (!this.fileError) {
      // console.log(this.finalResult);
      this.excelService.importExcel(this.finalResult).subscribe(
        (res: any) => {
          // console.log('File upload response:', res);
          if (res.statusCode == 200) {
            // alert("Import Successful");
            this.toastr.success(
              this.translate.instant(
                'TOASTER_RESPONSE.EXCEL_FILE_ADDED_SUCCESS'
              )
            );
            this.selectedFile = null;
            this.file = null;
            this.tableData = [];
            this.tableHeaders = [];
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
          if (error.error.message == 'Something went wrong on the server.') {
            this.toastr.error(
              this.translate.instant('TOASTER_ERROR.ERROR_SERVER_ERROR')
            );
          } else if (error.error.message == 'Unauthorized') {
            this.toastr.error(
              this.translate.instant('TOASTER_ERROR.ERROR_UNAUTHORIZED')
            );
          } else if (
            error.error.message == 'User is not admin or Invalid user Id.'
          ) {
            this.toastr.error(
              this.translate.instant(
                'TOASTER_ERROR.ERROR_USER_NOT_ADMIN_OR_INVALID_USER_ID'
              )
            );
          } else if (error.error.message == 'No data in excel file') {
            this.toastr.error(
              this.translate.instant(
                'TOASTER_ERROR.ERROR_NO_DATA_IN_EXCEL_FILE'
              )
            );
          } else if (
            error.error.message ==
            'Resource not found. Please check the ID and try again.'
          ) {
            this.toastr.error(
              this.translate.instant('TOASTER_ERROR.ERROR_RESOURCE_NOT_FOUND')
            );
          } else if (
            error.error.message ==
            'Your are not authorised to add another company details.'
          ) {
            this.toastr.error(
              this.translate.instant(
                'TOASTER_ERROR.ERROR_NOT_AUTHORIZED_TO_ADD_COMPANY'
              )
            );
          } else if (
            error.error.message.includes(
              'Given battle partner company number and name not exis'
            )
          ) {
            this.toastr.error(
              this.translate.instant(
                'TOASTER_ERROR.ERROR_INVALID_BATTLE_PARTNER_COMPANY'
              )
            );
          } else if (
            error.error.message.includes(
              'Given company number and name not exist'
            )
          ) {
            this.toastr.error(
              this.translate.instant(
                'TOASTER_ERROR.ERROR_INVALID_BATTLE_PARTNER_COMPANY'
              )
            );
          } else if (
            error.error.message ==
            'Within one company the sales rep number cannot come up twice {{data}}'
          ) {
            this.toastr.error(
              this.translate.instant(
                'TOASTER_ERROR.ERROR_DUPLICATE_SALES_REP_NUMBER',
                { data: error.error.errors }
              )
            );
          } else if (
            error.error.message == 'error occurred while sending email...'
          ) {
            this.toastr.error(
              this.translate.instant('TOASTER_ERROR.ERROR_SENDING_EMAIL')
            );
          } else {
            this.toastr.error(
              this.translate.instant('TOASTER_RESPONSE.SERVER_ERROR')
            );
          }
        }
      );
    } else {
      this.confirm = false;
      if (!this.selectedFile) {
        this.toastr.error(
          this.translate.instant('TOASTER_RESPONSE.PLEASE_SELECT_FILE_ERROR')
        );
      } else {
        this.toastr.error(this.fileErrorMessage);
      }
    }
  }

  convertobjectToArray(tableData: any) {
    const arrayOfArrays = tableData.map((obj: any) => Object.values(obj));
    this.dataArray = arrayOfArrays;
    // console.log("data arr", this.dataArray)
    this.validateAndFinalResult();
  }

  deleteLine(index: any) {
    // console.log('line ', index);
    this.tableData.splice(index, 1);
    this.convertobjectToArray(this.tableData);
    this.validateAndFinalResult();
  }

  editLine(index: any) {
    // console.log('line ', index);
    this.excelFileLineIndexForEditDialog = index;
    this.openNewDialog('0ms', '0ms');
  }
}
