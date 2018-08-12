import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageNotFoundComponent } from './not-found.component';
import { IkoMessageComponent } from './iko-message.component';
import { PagePluBelleComponent } from './pageplubelle';
import { ZoulikPageComponent } from './zoulipage';
import { AlorAlorComponent } from './aloralor';

const zeRoutes: Routes = [
  {
    path: 'compose',
    component: IkoMessageComponent,
    outlet: 'popup'
  },
  {
    path: 'schedule',
    loadChildren: './schedule/schedule.module#ScheduleModule'
  },
  { path: 'supezouli', component: ZoulikPageComponent },
  { path: 'pageplubelle', component: PagePluBelleComponent },
  { path: 'aloralor', component: AlorAlorComponent },

  { path: '', redirectTo: '/supezouli', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      zeRoutes,
      {
        enableTracing: true// Attention , que pour le debug

      }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [

  ]
})
export class AppRoutingModule { }
