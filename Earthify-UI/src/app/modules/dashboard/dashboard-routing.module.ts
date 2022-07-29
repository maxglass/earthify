import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {MapComponent} from "./components/map/map.component";
import {LoginGuard} from "../../guards/login.guard";
import {UploadComponent} from "./components/upload/upload.component";
import {QualityCheckComponent} from "./components/quality-check/quality-check.component";
import {RedirectLoginGuard} from "../../guards/redirect-login.guard";
import {UplaodGuard} from "../../guards/uplaod.guard";
import {StandardGuard} from "../../guards/standard.guard";
import {NormaliseGuard} from "../../guards/normalise.guard";
import {LoginAdminGuard} from "../../guards/login-admin.guard";
import {AdminComponent} from "./components/admin/admin.component";
import {DataSchemaComponent} from "./components/data-schema/data-schema.component";


const routes: Routes = [
    {path: '', redirectTo: '/dashboard/app/map', pathMatch: 'full'},
    {
        path: 'app',
        component: DashboardComponent,
        children:[
            { path: 'map', component: MapComponent,canActivate: [LoginGuard]},
            { path: 'upload', component: UploadComponent, canActivate: [UplaodGuard]},
            { path: 'standard', component: QualityCheckComponent,canActivate: [StandardGuard]},
            { path: 'normalise', component: QualityCheckComponent,canActivate: [NormaliseGuard]},
            { path: 'management', component: AdminComponent,canActivate: [LoginAdminGuard]},
            { path: 'schema', component: DataSchemaComponent,canActivate: [LoginAdminGuard]}
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {
}
