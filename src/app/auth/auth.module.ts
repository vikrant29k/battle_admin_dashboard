import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './component/login/login.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { SetPasswordComponent } from './component/set-password/set-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthComponent } from './auth.component';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './module/auth-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthMaterialModule } from './module/auth-material.module';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    AuthComponent,
    SignUpComponent,
    SetPasswordComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule,
    HttpClientModule,AuthMaterialModule
  ],
})
export class AuthModule {}
