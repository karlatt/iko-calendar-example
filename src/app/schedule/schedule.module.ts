import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleComponent } from './schedule.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


// bon je la mets ici , pas la peine de faire un module de routing pour une route , mais bon , quand même hein ....!

const zeOnlyRoute: Routes = [

  { path: '',  component: ScheduleComponent },
];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(zeOnlyRoute)
  ],
  declarations: [ScheduleComponent]
})
export class ScheduleModule { }
