import {Component, OnInit} from '@angular/core';
import {SharedService} from "../../../../shared.service";
declare var $: any;
declare var Metro: any;
@Component({
    selector: 'app-forget-password',
    templateUrl: './forget-password.component.html',
    styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

    constructor(private data: SharedService) {
    }

    ngOnInit(): void {
    }

    submitForget(): void {
        const allParams = $('#forget-form').serializeArray();
        const formData = new FormData();
        allParams.forEach((param: any) => {
            formData.append(param.name, param.value);
        });
        SharedService.loading('forgotten-password', false);
        this.data.apiService('forgotten-password', formData).subscribe(
            (result: any) => {
                SharedService.loading('forgotten-password', true);
                SharedService.fire(result.message, !result.status);
                if (result.status) {
                    const tabs = Metro.getPlugin('#reset-tabs');
                    tabs.tabs.open('2');
                }
            },
            (error: any) => {
                SharedService.loading('forgotten-password', true);
                SharedService.fire('Failed to request. Please try again later');
            }
        )
    }

    submitReset(): void {
        const allParams = $('#reset-form').serializeArray();
        const formData = new FormData();
        allParams.forEach((param: any) => {
            formData.append(param.name, param.value);
        });
        SharedService.loading('reset-password', false);
        this.data.apiService('reset-password', formData).subscribe(
            (result: any) => {
                SharedService.loading('reset-password', true);
                SharedService.fire(result.message, !result.status);
                if (result.status) {
                    this.data.redirect('login');
                }
            },
            (error: any) => {
                SharedService.loading('reset-password', true);
                SharedService.fire('Failed to reset. Please try again later');
            }
        )
    }
    checkForInvalid(cl: string): void {
        setTimeout( () => {
            if ($('.invalid').length > 0) {
                SharedService.invalidForm(cl);
            }
        }, 200);
    }
}
