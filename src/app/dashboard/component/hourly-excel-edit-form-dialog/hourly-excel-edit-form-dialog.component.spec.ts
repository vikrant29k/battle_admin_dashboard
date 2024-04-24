import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyExcelEditFormDialogComponent } from './hourly-excel-edit-form-dialog.component';

describe('HourlyExcelEditFormDialogComponent', () => {
  let component: HourlyExcelEditFormDialogComponent;
  let fixture: ComponentFixture<HourlyExcelEditFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HourlyExcelEditFormDialogComponent]
    });
    fixture = TestBed.createComponent(HourlyExcelEditFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
