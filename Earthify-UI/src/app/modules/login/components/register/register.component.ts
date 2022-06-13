import {Component, OnInit} from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $: any;
declare var Metro: any;

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    constructor(private data: SharedService) {
    }

    ngOnInit(): void {
    }

    checkForInvalid(): void {
        setTimeout( () => {
            if ($('.invalid').length > 0) {
                SharedService.invalidForm(".register-form");
            }
        }, 200);
    }

    submitRegistration(): void {
        const allParams = $('#registration-form').serializeArray();
        const formData = new FormData();
        allParams.forEach((param: any) => {
            formData.append(param.name, param.value);
        });
        SharedService.loading('register');
        this.data.apiService('register', formData).subscribe(
            (result: any) => {
                SharedService.loading('register', true);
                SharedService.fire(result.message, !result.status);
                if (result.status) {
                    this.openVerifyDialog();
                }
            },
            (error: any) => {
                SharedService.loading('register', true);
                SharedService.fire('Failed to create account. Please try again later');
            }
        )
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
            Metro.dialog.close('#code-dialog');
            if (result.status) {
                this.data.redirect('login')
            }
        }, (err: any) => {
            SharedService.loading('email-confirmation', true);
        })
    }

    // openVerifyCodeDialog(): void {
    //     Metro.dialog
    // }
}
