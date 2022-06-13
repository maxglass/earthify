import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedService} from "./shared.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ApiService} from "./api.service";
import {FormsModule} from "@angular/forms";
import {LoginComponent} from "./modules/login/components/login/login.component";
import {RegisterComponent} from "./modules/login/components/register/register.component";

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule
    ],
    providers: [
        SharedService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiService,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
