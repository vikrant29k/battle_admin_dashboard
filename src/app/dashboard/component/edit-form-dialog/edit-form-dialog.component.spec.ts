import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFormDialogComponent } from './edit-form-dialog.component';

describe('EditFormDialogComponent', () => {
  let component: EditFormDialogComponent;
  let fixture: ComponentFixture<EditFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditFormDialogComponent]
    });
    fixture = TestBed.createComponent(EditFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
