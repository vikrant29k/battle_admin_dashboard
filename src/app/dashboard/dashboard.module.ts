import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './modules/dashboard-routing.module';
import { SliderComponent } from './component/slider/slider.component';
import { ScoreboardComponent } from './component/scoreboard/scoreboard.component';
import { HeaderComponent } from './component/header/header.component';
import { NewsUpdateComponent } from './component/news-update/news-update.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { DashboardMaterialModule } from './modules/dashboard-material.module';
import { NewsListComponent } from './component/news-list/news-list.component';
import { ProfileComponent } from './component/profile/profile.component';
import { DialogAnimationsComponent } from './component/dialog-animations/dialog-animations.component';

import { ImportExcelComponent } from './component/import-excel/import-excel.component';
@NgModule({
  declarations: [DashboardComponent, SliderComponent, ScoreboardComponent, HeaderComponent, NewsUpdateComponent, NewsListComponent, ProfileComponent, DialogAnimationsComponent, ImportExcelComponent],
  imports: [
    CommonModule,DashboardRoutingModule,AngularEditorModule,HttpClientModule,DashboardMaterialModule
  ]
})
export class DashboardModule { }
