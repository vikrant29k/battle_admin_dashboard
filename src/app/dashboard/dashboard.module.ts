import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './modules/dashboard-routing.module';
import { SliderComponent } from './component/slider/slider.component';
import { ScoreboardComponent } from './component/scoreboard/scoreboard.component';
import { HeaderComponent } from './component/header/header.component';
import { NewsUpdateComponent } from './component/news-update/news-update.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DashboardMaterialModule } from './modules/dashboard-material.module';
import { NewsListComponent } from './component/news-list/news-list.component';
import { ProfileComponent } from './component/profile/profile.component';
import { DialogAnimationsComponent } from './component/dialog-animations/dialog-animations.component';
import { ImportExcelComponent } from './component/import-excel/import-excel.component';
import { MatchComponent } from './component/match/match.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { EditFormDialogComponent } from './component/edit-form-dialog/edit-form-dialog.component';
@NgModule({
  declarations: [
    DashboardComponent,
    SliderComponent,
    ScoreboardComponent,
    HeaderComponent,
    NewsUpdateComponent,
    NewsListComponent,
    ProfileComponent,
    DialogAnimationsComponent,
    ImportExcelComponent,
    MatchComponent,
  EditFormDialogComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AngularEditorModule,
    HttpClientModule,
    DashboardMaterialModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http),
        deps: [HttpClient]
      }
    }),
  ],
})
export class DashboardModule {}
