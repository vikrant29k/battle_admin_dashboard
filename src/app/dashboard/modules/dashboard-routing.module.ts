import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard.component';
import { ScoreboardComponent } from '../component/scoreboard/scoreboard.component';
import { NewsUpdateComponent } from '../component/news-update/news-update.component';
import { NewsListComponent } from '../component/news-list/news-list.component';


const routes: Routes = [
  {
    path:'',
   component:DashboardComponent,
    children:[
      {
        path:'',
        pathMatch: "full",
        redirectTo:'scoreboard'
      },
        {
          path:'scoreboard',
          component:ScoreboardComponent
        },
        {
          path:'news-update',
          component:NewsUpdateComponent
        },
        {
          path:'news-list',
          component:NewsListComponent
        }
    ]
}
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
