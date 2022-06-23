import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginGuard} from "./guards/login.guard";
import {LoginComponent} from "./modules/login/components/login/login.component";
import {LoginAdminGuard} from "./guards/login-admin.guard";
import {RegisterComponent} from "./modules/login/components/register/register.component";
import {RedirectLoginGuard} from "./guards/redirect-login.guard";
import {ForgetPasswordComponent} from "./modules/login/components/forget-password/forget-password.component";
import {GLoginComponent} from "./modules/login/components/g-login/g-login.component";

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [RedirectLoginGuard]},
    { path: 'register', component: RegisterComponent, canActivate: [RedirectLoginGuard]},
    { path: 'forget', component: ForgetPasswordComponent, canActivate: [RedirectLoginGuard]},
    { path: 'g-login', component: GLoginComponent, canActivate: [RedirectLoginGuard]},
    {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(dashboard => dashboard.DashboardModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes,{useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
