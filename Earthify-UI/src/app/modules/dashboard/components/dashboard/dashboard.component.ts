import {Component, OnInit} from '@angular/core';
import {SharedService} from "../../../../shared.service";
import {HttpParams} from "@angular/common/http";

declare var $: any;
declare var Metro: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    alerts: any = [];
    inbox: any = [];
    coins: any = [];
    btcUsdPrice = 0;
    currentSelectedCoin: any = {};
    currentCoinPrice = 0;
    $ = $;
    profile = {
        "id": -1,
        "user_id": 1,
        "first_name": "",
        "last_name": "",
        "description": "",
        "mobile": "",
        "banner_path": null,
        "ref_code": "",
        "created_at": "",
        "updated_at": "",
        "picture": "",
        "email": "",
        "no_of_properties": -1,
        "inward": -1,
        "outward": -1,
        "net_worth": -1,
        "reserve": -1,
        "pending": null
    };
    pendingTransaction = {
        "pay_address": "",
        "amount": "",
        "qrcode": "assets/coin.png",
        "status": "pending",
        "coin_status": "",
        "name": "",
        "icon": "assets/coin.png",
        "coin_id": "",
        "coin_amount": ""
    };

    constructor(private data: SharedService) {
        setTimeout(() => {
            const ref = location.hash.split('/').pop();
            $(`li[routerLink="${ref}"]`).click();
        }, 500)
    }

    ngOnInit(): void {
        this.getAlerts();
        this.getAlerts();
        this.getInbox();
        this.getProfile();
        this.getSettings();
        this.data.currentMessage.subscribe(message => {
            if (message === 'get-settings') {
                this.getSettings();
            }
            if (message === 'get-profile') {
                // this.getProfile();
            }
            if (message === 'cancel-pending') {
                this.cancelPendingTransactions();
            }
        });
        this.getRates();
        if (this.data.checkLogin()){

        }
    }

    getAlerts(silent: boolean = false): void {
        if (!silent) {
            SharedService.loading('alerts');
        }
        this.data.apiGetService('notification').subscribe(
            (result: any) => {
                if (!silent) {
                    SharedService.loading('alerts', true);
                }
                this.alerts = result;
            },
            (error: any) => {
                if (!silent) {
                    SharedService.loading('alerts', true);
                }
            }
        )
    }

    getInbox(silent: boolean = false): void {
        if (!silent){
            SharedService.loading('inbox');
        }
        this.data.apiGetService('inbox').subscribe(
            (result: any) => {
                if (!silent) {
                    SharedService.loading('inbox', true);
                }
                this.inbox = result;
            },
            (error: any) => {
                if (!silent) {
                    SharedService.loading('inbox', true);
                }
            }
        )
    }

    getProfile(silent: boolean = false): void {
        if (!silent) {
            SharedService.loading('profile');
        }
        this.data.apiGetService('profile').subscribe(
            (result: any) => {
                if (!silent) {
                    SharedService.loading('profile', true);
                }
                SharedService.profile = this.profile = result;
                this.startPendingCheck();
                this.data.changeMessage('fetch-profile');
                if (this.profile.picture != null) {
                    $('#dp').css('backgroundImage', `url('${SharedService.server + this.profile.picture}')`)
                }
            },
            (error: any) => {
                if (!silent) {
                    SharedService.loading('profile', true);
                }
            }
        )
    }

    getSettings(): void {
        SharedService.loading('settings');
        this.data.apiGetService('user/settings').subscribe(
            (result: any) => {
                SharedService.loading('settings', true);
                SharedService.settings = result;
                this.data.changeMessage('fetch-settings');
            },
            (error: any) => {
                SharedService.loading('settings', true);
            }
        )
    }

    login(): void {
        this.data.redirect('login');
    }

    logout(): void {
        this.data.logOut();
    }

    getRates(): void {
        SharedService.loading('rates')
        this.data.apiGetService('rates').subscribe(
            (results: any) => {
                SharedService.loading('rates', true);
                $('#coins').off('change').empty();
                this.coins = [];
                var keys = Object.keys(results['result']);
                let i = 0;
                keys.forEach((k: any) => {
                    const coin = results['result'][k];
                    coin['coin_id'] = k;
                    if (k != "USD") {
                        if (coin.status === "online" && coin.capabilities.indexOf('payments') !== -1) {
                            this.coins.push(coin);
                            $('#coins').append(
                                `<option value="${i}" data-template="<img style='height:20px;margin-left:5px;' src='${coin.image}'> $1">${coin.name}</option>`
                            )
                            i++;
                        }
                    } else {
                        // this.usd = coin;
                        this.btcUsdPrice = 1 / coin.rate_btc;
                    }
                });
                const selCoins = Metro.getPlugin('#coins', 'select');
                selCoins.reset();
                $('#lima-to-buy').on('keyup', () => {
                    $('#coins').trigger('change');
                });
                $('#coins').on('change', () => {
                    const selCoins = Metro.getPlugin('#coins', 'select');
                    this.currentSelectedCoin = this.coins[selCoins.val()];
                    const converted$ = this.currentSelectedCoin.rate_btc * this.btcUsdPrice;
                    const one$coin = 1 / converted$;
                    const requiredLimaCoins = $('#lima-to-buy').val();
                    this.currentCoinPrice = requiredLimaCoins * one$coin;
                    $('#coin-value').html(this.currentCoinPrice)

                });
                $('#coins').trigger('change');
            },
            (err: any) => {
                SharedService.loading('rates', true);
            }
        )
    }

    buyCoins(): void {
        const requiredLimaCoins = $('#lima-to-buy').val();
        if (requiredLimaCoins.trim() == '' || !this.currentSelectedCoin.hasOwnProperty('name')) {
            SharedService.invalidForm('#wallet-dialog');
            SharedService.fire("Please enter coin quantity", true)
            return;
        }
        const coinDetail = btoa(JSON.stringify({
            name: this.currentSelectedCoin.name,
            icon: this.currentSelectedCoin.image,
            coin_id: this.currentSelectedCoin.coin_id
        }));
        const form = {coin: coinDetail, amount: requiredLimaCoins};
        SharedService.loading('transaction');
        Metro.dialog.close('#wallet-dialog');
        this.data.apiService('transaction', form).subscribe(
            (results: any) => {
                SharedService.loading('transaction', true);
                if (!results.status && results.message === "pending") {
                    this.storePendingDetails(results.results);
                    const ctx = this;
                    Metro.dialog.create({
                        title: "Pending Transaction",
                        content: "You already have a ongoing transaction",
                        clsDialog: "alert",
                        actions: [
                            {
                                caption: "Cancel Pending Transaction",
                                cls: "js-dialog-close warning",
                                onclick: function () {
                                    ctx.cancelPendingTransactions();
                                }
                            },
                            {
                                caption: "View Details",
                                cls: "js-dialog-close success",
                                onclick: function () {
                                    Metro.dialog.open('#pending-dialog');
                                }
                            },
                            {
                                caption: "Close",
                                cls: "js-dialog-close alert",
                                onclick: function () {

                                }
                            }
                        ]
                    });
                } else if (results.status) {
                    this.storePendingDetails(results.results);
                    this.startPendingCheck();
                    Metro.dialog.open('#pending-dialog');
                } else {
                    SharedService.fire(results.message, true);
                }
            },
            (error: any) => {
                SharedService.loading('transaction', true);
                SharedService.fire("Internal Error", true);
            }
        )
    }

    startPendingCheck(): void {
        clearInterval(SharedService.checkPendingIntervalId);
        if (this.profile.pending != null) {
            setTimeout(() => {
                SharedService.checkPendingIntervalId = setInterval(() => {
                    if (this.profile.pending == null) {
                        clearInterval(SharedService.checkPendingIntervalId);
                        return;
                    }
                    this.data.apiGetService(`check-auto-transactions/${this.profile.pending}`).subscribe(
                        (results: any) => {
                            if (results.status === "credited") {
                                clearInterval(SharedService.checkPendingIntervalId);
                                this.storePendingDetails(results.results);
                                this.data.changeMessage('get-profile');
                            }
                        },
                        (error: any) => {
                            clearInterval(SharedService.checkPendingIntervalId);
                        }
                    )
                }, 20000);
            }, 120000);
        }
    }

    storePendingDetails(results: any): void {
        const coinDetails: any = JSON.parse(atob(results.coin_name));
        this.pendingTransaction.status = results.status;
        this.pendingTransaction.coin_status = results.coin_status;
        this.pendingTransaction.qrcode = results.qrcode;
        this.pendingTransaction.amount = results.amount;
        this.pendingTransaction.coin_amount = results.coin_amount;
        this.pendingTransaction.pay_address = results.pay_address;
        this.pendingTransaction.name = coinDetails.name;
        this.pendingTransaction.icon = coinDetails.icon;
        this.pendingTransaction.coin_id = coinDetails.coin_id;
        this.profile.pending = results.order_id;
        if (this.pendingTransaction.status === "credited") {
            this.profile.pending = null;
        }

    }

    cancelPendingTransactions(): void {
        SharedService.loading('cancel-pending');
        this.data.apiGetService('cancel-pending-transactions').subscribe(
            (result: any) => {
                SharedService.loading('cancel-pending', true);
                SharedService.fire(result.message, !result.status);
                if (result.status) {
                    this.data.changeMessage('get-profile');
                        this.data.changeMessage('cancel-pending-done');
                }
            },
            (error: any) => {
                SharedService.loading('cancel-pending', true);
                SharedService.fire("Internal Error", true);
            }
        )
    }

    checkPendingStatus(): void {
        SharedService.loading('check-pending');
        this.data.apiGetService('check-pending-transactions').subscribe(
            (result: any) => {
                SharedService.loading('check-pending', true);
                if (result.status) {
                    if (result.results.status === "credited") {
                        this.data.changeMessage('get-profile');
                    }
                    this.storePendingDetails(result.results);
                }
                SharedService.fire(result.message, !result.status);
            },
            (error: any) => {
                SharedService.loading('check-pending', true);
                SharedService.fire("Internal Error", true);
            }
        )
    }
}
