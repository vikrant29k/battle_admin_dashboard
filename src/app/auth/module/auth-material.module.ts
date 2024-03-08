import { NgModule } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatRadioModule } from "@angular/material/radio";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatMenuModule } from "@angular/material/menu";
import {MatExpansionModule} from '@angular/material/expansion';
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { FormsModule } from "@angular/forms";
import { MatProgressBarModule } from '@angular/material/progress-bar';
const materials = [
    MatMenuModule,
    FormsModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatCheckboxModule,

];

@NgModule({
    imports: [materials],
    exports: [materials]
})
export class AuthMaterialModule {}
