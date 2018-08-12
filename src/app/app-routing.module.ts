import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageNotFoundComponent } from './not-found.component';
import { IkoMessageComponent } from './iko-message.component';
import { PagePluBelleComponent } from './pageplubelle';
import { ZoulikPageComponent } from './zoulipage';
import { AlorAlorComponent } from './aloralor';

/*import { CanDeactivateGuard }       from './can-deactivate-guard.service';
import { AuthGuard }                from './auth-guard.service';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';*/

const zeRoutes: Routes = [
  {
    path: 'compose',
    component: IkoMessageComponent,
    outlet: 'popup'
  },
  {
    path: 'schedule',
    loadChildren: './schedule/schedule.module#ScheduleModule',
    // canLoad: [AuthGuard]
  },
 /* {
    path: 'crisis-center',
    loadChildren: 'app/crisis-center/crisis-center.module#CrisisCenterModule',
    data: { preload: true }
  },*/
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
        enableTracing: true, // Attention , que pour le debug
        //  preloadingStrategy: SelectivePreloadingStrategy,

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
