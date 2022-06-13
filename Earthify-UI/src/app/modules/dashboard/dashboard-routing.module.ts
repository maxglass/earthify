import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {MapComponent} from "./components/map/map.component";
import {LoginGuard} from "../../guards/login.guard";
import {UploadComponent} from "./components/upload/upload.component";
import {QualityCheckComponent} from "./components/quality-check/quality-check.component";


const routes: Routes = [
    {path: '', redirectTo: '/dashboard/app/map', pathMatch: 'full'},
    {
        path: 'app',
        component: DashboardComponent,
        children:[
            { path: 'map', component: MapComponent,canActivate: [LoginGuard]},
            { path: 'upload', component: UploadComponent,canActivate: [LoginGuard]},
            { path: 'qc', component: QualityCheckComponent,canActivate: [LoginGuard]},
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {
}
