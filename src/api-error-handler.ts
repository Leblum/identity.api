import { NextFunction, Request, Response } from 'express';
import log = require('winston');
import { Config } from './config/config';

export class ApiErrorHandler {
    public static HandleApiError(error: Error & { status: number }, request: Request, response: Response, next: NextFunction) {
        log.error(error.stack);

        // Set the response status code on the response in the case of error.
        response.statusCode = error.status || 500;

        //If there was an authentication errror.
        if (error.name == 'JWTExpressError') {
            response.status(401);
        }
        response.json({
            message: error.message || 'Server Error',
            status: error.status || 500,
            URL: request.url,
            method: request.method,
            stack: Config.active.get('returnCallStackOnError') ? error.stack : '',
            requestBody: request.body
        });
    }
}