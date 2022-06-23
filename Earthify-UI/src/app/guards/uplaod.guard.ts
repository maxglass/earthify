import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {SharedService} from "../shared.service";

@Injectable({
  providedIn: 'root'
})
export class UplaodGuard implements CanActivate {
  constructor(private http: HttpClient, private data: SharedService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise<boolean>((accept, reject) => {
      return this.http.get(SharedService.server + "check/user/upload").subscribe((result: any) => {
        accept(true);
      }, (error: any) => {
        if (error.status == 403) {
          this.data.logOut()
        }
        accept(false);
      })
    })
  }

}
