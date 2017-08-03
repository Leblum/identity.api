import { Router } from 'express';
import { EmailVerificationController } from '../controllers/';
import { BaseRouter } from './base/base.router';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { CONST } from '../constants';

export class ValidateEmailRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new EmailVerificationController();
    public resource: string = '';

    public constructor(){
        super();
    }

    public getRouter(): Router {
        return this.router
            .post(`${this.resource}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.validateEmail(request, response, next);
            });
    }
}