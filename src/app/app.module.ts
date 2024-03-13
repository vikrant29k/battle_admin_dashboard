import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardModule } from './dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
   

  ],
  imports: [
    BrowserModule,RouterModule,BrowserAnimationsModule,
    AppRoutingModule,DashboardModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }