import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../component/login/login.component';
import { SignUpComponent } from '../component/sign-up/sign-up.component';
import { SetPasswordComponent } from '../component/set-password/set-password.component';
import { AuthComponent } from '../auth.component';

const routes: Routes = [
  {
    path:'',
   component:AuthComponent,
   children:[
    {
      path: '',pathMatch:'full',redirectTo:'login'
    },
  {
    path:'login',
    component:LoginComponent
  },
  {
    path:'signup',
    component:SignUpComponent
  },
  {
    path:'password/:id',
    component:SetPasswordComponent
  }
]
}
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
