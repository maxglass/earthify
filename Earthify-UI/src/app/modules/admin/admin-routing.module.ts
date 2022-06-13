import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RedirectLoginGuard} from "../../redirect-login.guard";
import {AdminComponent} from "./components/admin/admin.component";
import {LoginGuard} from "../../guards/login.guard";

const routes: Routes = [
    {path: '', redirectTo: '/admin/app', pathMatch: 'full'},
    {
        path: 'app',
        component: AdminComponent,
        canActivate: [LoginGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {
}
