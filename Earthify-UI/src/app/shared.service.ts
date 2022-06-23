import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subscription, throwError} from "rxjs";
import {retry} from "rxjs/operators";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Router} from "@angular/router";
import {JwtHelperService} from "@auth0/angular-jwt";

declare var $: any;
declare var Metro: any;

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    static checkPendingIntervalId: any = -1;
    static checkProfileIntervalId: any = -1;
    static checkInboxIntervalId: any = -1;
    static checkAlertsIntervalId: any = -1;
    static activityTimer: any = -1;
    static rememberBidDetails = {
        status: false,
        details: {},
        grids: [],
        locationCenter: {lat: 0, lng: 0},
        deedId: ''
    };
    static accessToken = 'pk.eyJ1Ijoid2FoYWJjaCIsImEiOiJjamIyaTVrdXkyYzUxMzNuZ2FkNThidTV6In0.RN8ftxXp1QaswbhxFKUNlw';
    static server = '';
    jwtHelper = new JwtHelperService();
    public static timerId: any;
    public static timerId60: any;
    static processes: any = [];
    static qr: any = '';
    static profile: any = {
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
        "center": '-80.192621,25.772591'
    };
    static clearIntervals(): void {
        clearInterval(SharedService.checkProfileIntervalId);
        clearInterval(SharedService.checkInboxIntervalId);
        clearInterval(SharedService.checkAlertsIntervalId);
    }
    static latlong2tileForOverlay(center: any, zoom: number): string {

        var lon = center.lng;
        var lat = center.lat;
        var x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
        var y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
        if (x<0){
            // x = x*-1;
        }
        if (y<0){
            // y = y*-1;
        }
        return `https://a.tiles.mapbox.com/v4/mapbox.satellite/${zoom}/${x}/${y}.png?access_token=${SharedService.accessToken}`;
    };
    static settings: any = {
        settings: {
            country_flag_id: null,
            id: -1,
            is_allowed_bid_low_price: false,
            is_send_email: false,
            is_shown_profile_for_activity: false,
            map_view: -1,
            user_id: -1,
            google2fa_enable: false,
            google2fa: false
        },
        countries: [],
        mapViews: [{id: 1, url: 'mapbox://styles/mapbox/streets-v11', view: 'Streets', icon: 'street'},
            {id: 2, url: 'mapbox://styles/mapbox/outdoors-v11', view: 'Outdoors', icon: 'outdoors'},
            {id: 3, url: 'mapbox://styles/mapbox/light-v10', view: 'Light', icon: 'light'},
            {id: 4, url: 'mapbox://styles/mapbox/dark-v10', view: 'Dark', icon: 'dark'},
            {id: 5, url: 'mapbox://styles/mapbox/satellite-streets-v11', view: 'Satellite Streets', icon: 'satellite'},
            {id: 6, url: 'mapbox://styles/mapbox/navigation-day-v1', view: 'Navigation Day', icon: 'day'},
            {id: 7, url: 'mapbox://styles/mapbox/navigation-night-v1', view: 'Navigation Night', icon: 'night'}]
    };
    private messageSource = new BehaviorSubject('default message');
    currentMessage = this.messageSource.asObservable();

    static loading(process: string, isStop: boolean = false): void {
        let index = SharedService.processes.indexOf(process);
        if (isStop){
            if (index !== -1) {
                SharedService.processes.splice(index, 1);
            }
        } else {
            if (index === -1) {
                SharedService.processes.push(process);
            }
        }
        if (SharedService.processes.length === 0) {
            $('#loading').removeClass('d-flex').addClass('d-none');
        } else {
            $('#loading').addClass('d-flex').removeClass('d-none');
        }
    }

    static fire(msg: string, isError: boolean = false): void {
        Metro.toast.create(msg, null, 5000, isError ? "bg-red fg-white":"bg-green fg-white");
    }
    static invalidForm(el: string): void {
        var form  = $(el);
        form.addClass("ani-vertical");
        setTimeout(function(){
            form.removeClass("ani-vertical");
        }, 1000);
    }
    static getServer(): string {
        if (SharedService.server === '') {
            if (window.hasOwnProperty('settings')) {
                // @ts-ignore
                SharedService.server = window.settings.server;
            }
        }
        return SharedService.server;
    }
    static setCookie(cname: any, cvalue: any, ex: any): string {
        const d = new Date();
        d.setTime((Date.now() + (ex * 24 * 60 * 60 * 1000)));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
            return SharedService.getCookie(cname);
    }
    static getCookie(cname: any): string {
        const name = cname + '=';
        const ca = document.cookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }
    constructor(private http: HttpClient, private route: Router) {
        SharedService.getServer();
    }

    async updateLocationName(center: any, id: any): Promise<string> {
        SharedService.loading('get-location');
        let address = '';
        return new Promise<string>((success, error) => {
            this.apiGetService(`https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=${SharedService.accessToken}&limit=1&types=address`, true, new HttpParams())
                .subscribe(
                     (result: any) => {
                        SharedService.loading('get-location', true);
                        try {
                            address = result.features[0].place_name;
                            const form: any = {location: address, gid: id};
                            SharedService.loading("location-update");
                            this.apiService(`location/update`, form).subscribe(
                                (results: any) => {
                                    SharedService.loading("location-update", true);
                                    success(address);
                                },
                                (err: any) => {
                                    SharedService.loading("location-update", true);
                                    success(address);
                                }
                            )
                        } catch (e) {
                            SharedService.loading("location-update", true);
                            success(address);
                        }
                    },
                    (error: any) => {
                        SharedService.loading('get-location', true);
                        success(address);
                    }
                );
        });


    }

    changeMessage(message: string): any {
        this.messageSource.next(message);
    }

    apiService(type: string, body: any): Observable<object> {
        if (!this.checkLogin() && ['user/login', 'user/register', 'forgotten-password', 'reset-password', 'login2fa'].indexOf(type) === -1) {
            this.postCheckLogin();
            return throwError({});
        }
        return this.http.post(SharedService.server + type, body).pipe(
            retry(1), // retry a failed request up to 3 times
        );
    }

    apiGetService(type: string, staticUrl: boolean = false,  body: HttpParams= new HttpParams()): Observable<object> {
        if (staticUrl){
            return this.http.get(type)
        }
        if (!this.checkLogin() && type !== 'login' && type.indexOf('email-confirmation') == -1) {
            this.postCheckLogin();
            return throwError({});
        }
        return this.http.get(SharedService.server + type, {
            params: body
        }).pipe(
            retry(1), // retry a failed request up to 3 times
        );
    }

    getRole(): string {
      const tok = SharedService.getCookie('access_token');
      const data = this.jwtHelper.decodeToken(tok)
      return data.route;
    }

    checkLogin(): boolean {
        const tok = SharedService.getCookie('access_token');
        // this.isAdminLogin()
        if (tok === '') {
            return false;
        }
        // this.jwtHelper.getTokenExpirationDate(tok)
        // console.log(this.jwtHelper.getTokenExpirationDate(tok))
        return !this.jwtHelper.isTokenExpired(tok);
    }
    postCheckLogin(): void {
        const loc = window.location.href;
        if (this.checkLogin()) {
            // @ts-ignore
          const route = this.data.getRole()
          if (route.indexOf('admin') !== -1) {
            if (location.hash.indexOf('admin/app') === -1) {
              this.redirect('admin/app');
            }
          } else {
            if (location.hash.indexOf('dashboard/app/'+route) === -1) {
              this.redirect('dashboard/app/'+route);
            }
          }
        } else {
            if (loc.indexOf('/login') === -1) {
              window.location.assign(window.location.origin + '/#/login')
            }
        }
    }
    logOut(): void {
        SharedService.clearIntervals();
        clearInterval(SharedService.checkPendingIntervalId);
        clearInterval(SharedService.activityTimer);
        SharedService.setCookie('access_token', '', -(50 * 12 * 30 * 24 * 3600));
        SharedService.setCookie('prev_url', '', -(50 * 12 * 30 * 24 * 3600));
        this.postCheckLogin();
        location.reload();
    }
    redirect(to: string, id:any = -1): void {
        if (to === 'login') {
            SharedService.setCookie('prev_url', location.hash, 1);
        }
        if (id == -1) {
            this.route.navigateByUrl(`/${to}`);
        } else {
            this.route.navigate([`/${to}`, id]);
        }
    }

    promoteForLogin(): void {
        if (!this.checkLogin()) {
            const hr = window.location.href;
            if (hr.indexOf('/dashboard') !== -1) {
                this.logOut()
            }
        } else {
            this.redirect('dashboard');
        }
    }
}
