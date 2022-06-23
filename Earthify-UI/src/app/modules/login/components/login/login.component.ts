import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $: any;
declare var Metro: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    @Output() dataOnErrorForm = new EventEmitter<any>();
    constructor(private data: SharedService) {
    }

    ngOnInit(): void {
    }
    login(): void {
        setTimeout( () => {
            if ($('.invalid').length > 0) {
                SharedService.invalidForm(".login-form");
            } else {
                const form:any = {email: $('#username').val(), password: $('#pass').val()};
                SharedService.loading('login');
                this.data.apiService('user/login', form).subscribe(
                    (result: any) => {
                        SharedService.loading('login', true);
                        if (result.hasOwnProperty('qr')){
                            this.data.redirect('g-login');
                            SharedService.qr = result.qr;
                            SharedService.setCookie('token', result.token, 1);
                            return;
                        }
                        if (result.hasOwnProperty('status')) {
                            SharedService.invalidForm(".login-form");
                            Metro.notify.create(result.message, "Login Failed", {
                                cls: "alert"
                            })
                        } else if (result.hasOwnProperty('access_token')) {
                            SharedService.setCookie('access_token', result.access_token, 0.1);
                            window.location.reload(true)
                        }
                    },
                    (err) => {
                        SharedService.loading('login', true);
                    }
                );
            }
        }, 200);
    }
    openVerifyDialog(): void {
        const ctx = this;
        const html = `<div id="code-error-div" class="fg-red text-small"></div><div class="form-group">
<input autocomplete="off" type="text" id="code" data-role="materialinput"
       placeholder="Enter 8 digit code"
       data-icon="<span class='mif-mail-read'>"
       data-label="Verification Code"
       data-cls-line="bg-amber"
></div>`;
        Metro.dialog.create({
            title: "Enter verification code",
            content: html,
            clsDialog: 'code-dialog fg-amber',
            actions: [
                {
                    caption: "Verify",
                    cls: "warning",
                    onclick: function(){
                        const code = $('#code').val();
                        if (code.trim().length < 8) {
                            $('#code-error-div').empty().append("Code must be of 8 characters");
                            setTimeout(()=>{$('#code-error-div').empty();}, 3000);
                            SharedService.invalidForm('#code-error-div');
                            return;
                        }
                        Metro.dialog.close('.code-dialog');
                        ctx.verifyCode(code);
                    }
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close alert",
                    onclick: function(){

                    }
                }
            ]
        });
    }
    verifyCode(code: string): void{
        SharedService.loading('email-confirmation', false);
        this.data.apiGetService('email-confirmation/'+code).subscribe((result: any) => {
            SharedService.loading('email-confirmation', true);
            SharedService.fire(result.message, !result.status);
            if (result.status) {
                this.data.redirect('login')
            }
        }, (err: any) => {
            SharedService.loading('email-confirmation', true);
        })
    }
}
