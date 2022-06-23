import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {SharedService} from "../shared.service";

@Injectable({
    providedIn: 'root'
})
export class RedirectLoginGuard implements CanActivate {
    constructor(private data: SharedService) {

    }
//	0	"admin"
//	1	"upload"
// 	2	"standard"
// 	3	"normalise"
// 	3	"map"
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isLogin = this.data.checkLogin();
        if (isLogin) {
          const route = this.data.getRole()
          if (location.hash.indexOf('dashboard/app/'+route) === -1) {
            this.data.redirect('dashboard/app/'+route);
          }
        } else {
          if (location.hash.indexOf('login') === -1) {
            window.location.assign(window.location.origin + '/#/login')
          }
        }
        return true;
    }

}
