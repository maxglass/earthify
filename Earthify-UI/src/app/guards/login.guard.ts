import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {SharedService} from "../shared.service";

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(private data: SharedService) {

    }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const isLogin = this.data.checkLogin();
      if (!isLogin) {
          this.data.redirect('login');
      }
      return isLogin;
  }
}
