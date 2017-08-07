import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {MimeType} from '../../enumerations';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { ServiceError } from '../../classes/app-error.class'
import { BaseModel } from '../../models';

export class BaseService {

    protected requestOptions: RequestOptions;

    public constructor(){
        this.requestOptions = new RequestOptions({
            headers: new Headers({ 'Content-Type': MimeType.JSON })
        });
    }

    protected handleError(errorResponse: Response | any) {
        // TODO: Implement Real Logging infrastructure.
        // Might want to log to remote server (Fire and forget style)
        const appError = new ServiceError();
        if (errorResponse instanceof Response) {
            const body = errorResponse.json() || '';
            if (typeof body.error !== 'undefined' && typeof body.error.message !== 'undefined' && body.error.detail !== undefined) {
                appError.message = body.error.message;
                appError.description = body.error.detail;
            } else if (errorResponse.status === 0) {
                appError.message = `API call failed`;
            } else {
                appError.message = `${errorResponse.status} - ${errorResponse.statusText || ''}`;
            }
            appError.statusCode = errorResponse.status;
            appError.statusText = errorResponse.statusText;
            return Observable.throw(appError);
        } else {
            appError.message = typeof errorResponse.message !== 'undefined' ? errorResponse.message : errorResponse.toString();
            return Observable.throw(appError);
        }
    }
}

