import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {SharedService} from "./shared.service";

@Injectable({
    providedIn: 'root'
})
export class RedirectLoginGuard implements CanActivate {
    constructor(private data: SharedService) {

    }
//	0	"admin"
//	1	"data"
// 	2	"viewer"
// 	3	"qc"
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isLogin = this.data.checkLogin();
        if (isLogin) {
          switch (this.data.getRole()){
            case '0':
              this.data.redirect('admin/app');
              break;
            case '1':
              this.data.redirect('dashboard/app/upload');
              break;
            case '2':
              this.data.redirect('dashboard/app/map');
              break;
            case '3':
              this.data.redirect('dashboard/app/qc');
              break;
            default:
              this.data.redirect('login');
          }
        }

        return true;
    }

}
