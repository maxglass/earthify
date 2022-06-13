import {Component, OnInit} from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $: any;
declare var Metro: any;
@Component({
    selector: 'app-g-login',
    templateUrl: './g-login.component.html',
    styleUrls: ['./g-login.component.css']
})
export class GLoginComponent implements OnInit {
    constructor(private data: SharedService) {
    }

    ngOnInit(): void {
        if (SharedService.qr === '') {
            this.data.redirect('login');
            return;
        }
        $('#qr-code').attr('src', SharedService.qr);
    }

    login(e: any): void {
        e.preventDefault();
        setTimeout( () => {
            if ($('.invalid').length > 0) {
                SharedService.invalidForm(".g-login-form");
            } else {
                const form:any = {auth2fa: $('#code').val(), token: SharedService.getCookie('token')};
                SharedService.loading('g-login');
                this.data.apiService('login2fa', form).subscribe(
                    (result: any) => {
                        SharedService.loading('g-login', true);
                        if (result.hasOwnProperty('status')) {
                            SharedService.invalidForm(".login-form");
                            if (!result.hasOwnProperty('message')) {
                                result.message = "Unknown Error"
                            }
                            Metro.notify.create(result.message, "Login Failed", {
                                cls: "alert"
                            })
                        } else if (result.hasOwnProperty('access_token')) {
                            SharedService.setCookie('access_token', result.access_token, result.expires_in/86400);
                            this.data.postCheckLogin();
                        }
                    },
                    (err) => {
                        SharedService.loading('g-login', true);
                    }
                );
            }
        }, 200);
    }
}
