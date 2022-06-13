import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SharedService} from "./shared.service";
@Injectable({
    providedIn: 'root'
})
export class ApiService implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const urlToExclude = [
            SharedService.getServer() + 'login',
            SharedService.getServer() + 'register',
        ];
        if (urlToExclude.indexOf(req.url) === -1) {
            const tok = SharedService.getCookie('access_token');
            const reqWithToken = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${tok}`).set('Access-Control-Allow-Headers', '*'),
            });
            return next.handle(reqWithToken);
        }
        return next.handle(req);
    }
}
