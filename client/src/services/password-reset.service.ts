import { BaseService } from "./";
import { Observable } from "rxjs/Observable";
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
// This is required for our catch call...
// I'm concerned about load time, so I'm adding observables very carefully.
import 'rxjs/add/operator/catch';
import { ServiceError } from "../classes/app-error.class";
import { environment } from '../environments/environment';

@Injectable()
export class PasswordResetService extends BaseService {

    constructor(protected http: Http) {
        super();
    }

    public resetPassword(passwordResetTokenId: string, password: string): Observable<Response> {

        const url = `${environment.IdentityAPIBase}${environment.IdentityAPIVersion}/password-reset`;
        return this.http.post(url, { 
                passwordResetTokenId: passwordResetTokenId, 
                password: password 
            }, this.requestOptions)
            .map((res: Response) => {
                return res;
            }).catch( this.handleError );
    }
}