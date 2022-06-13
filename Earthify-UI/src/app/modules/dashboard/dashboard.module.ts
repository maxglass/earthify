import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {MapComponent} from "./components/map/map.component";
import { MainComponent } from './components/main/main.component';
import { UploadComponent } from './components/upload/upload.component';
import { QualityCheckComponent } from './components/quality-check/quality-check.component';


@NgModule({
  declarations: [
      DashboardComponent,
      MapComponent,
      MainComponent,
      UploadComponent,
      QualityCheckComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }

