import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './modules/dashboard-routing.module';
import { SliderComponent } from './component/slider/slider.component';
import { ScoreboardComponent } from './component/scoreboard/scoreboard.component';
import { HeaderComponent } from './component/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { NewsUpdateComponent } from './component/news-update/news-update.component';
@NgModule({
  declarations: [DashboardComponent, SliderComponent, ScoreboardComponent, HeaderComponent, NewsUpdateComponent],
  imports: [
    CommonModule,DashboardRoutingModule,MatIconModule
  ]
})
export class DashboardModule { }
