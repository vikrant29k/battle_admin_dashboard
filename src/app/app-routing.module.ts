import { NgModule } from '@angular/core';
import { RouterModule, Routes, } from '@angular/router';
import { AuthGuardService as authGuard } from './services/auth guard/auth-guard.service';

const routes: Routes = [
  {
    path:'',
    pathMatch:'full',
    redirectTo:'auth'
  },{
    path:'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path:'dashboard',

    loadChildren:() => import('./dashboard/dashboard.module').then(m=>m.DashboardModule),
    canActivate:[authGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
